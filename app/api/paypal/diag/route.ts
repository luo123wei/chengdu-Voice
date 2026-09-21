import { NextResponse } from 'next/server';
import { checkCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
const isSandbox = process.env.PAYPAL_MODE === 'sandbox';
const base = isSandbox
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

export async function GET() {
  const result: Record<string, unknown> = {
    hasClientId: !!clientId,
    clientIdLength: clientId.length,
    clientIdPrefix: clientId.slice(0, 8),
    hasSecret: !!clientSecret,
    secretLength: clientSecret.length,
    mode: isSandbox ? 'sandbox' : 'live',
    base,
  };

  if (!clientId || !clientSecret) {
    return NextResponse.json({ ...result, error: 'Missing PayPal credentials' });
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const start = Date.now();
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(15000),
    });
    const tokenBody = await tokenRes.json();
    const elapsed = Date.now() - start;

    result.authStatus = tokenRes.status;
    result.authTimeMs = elapsed;
    result.hasToken = !!tokenBody.access_token;
    result.tokenType = tokenBody.token_type;
    result.errorFromPayPal = tokenBody.error || tokenBody.error_description || null;

    if (tokenBody.access_token) {
      // 用 token 查账户状态
      try {
        const meRes = await fetch(`${base}/v1/customer/partners/merchant-integrations/credentials`, {
          headers: { Authorization: `Bearer ${tokenBody.access_token}` },
          signal: AbortSignal.timeout(10000),
        });
        result.merchantStatus = meRes.status;
        const meBody = await meRes.json().catch(() => ({}));
        result.merchantDetails = JSON.stringify(meBody).slice(0, 500);
      } catch (e) {
        result.merchantError = e instanceof Error ? e.message : String(e);
      }
    }
  } catch (e) {
    result.fetchError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}

// POST: 模拟 create-order 的关键步骤，定位崩溃点
export async function POST(request: Request) {
  const steps: Record<string, unknown> = {};
  try {
    steps.import = 'ok';

    const body = await request.json().catch(() => ({}));
    const email = body.email || 'diag@test.com';
    const items = body.items || [{ name: 'Test', price: 9.99, quantity: 1, type: 'digital' }];

    steps.bodyParsed = { email, itemsCount: items.length };

    // 步骤1: 计算金额
    const itemTotal = Math.round((9.99 * 1 + Number.EPSILON) * 100) / 100;
    steps.itemTotal = itemTotal;

    // 步骤2: checkCoupon（没有折扣码应该直接跳过）
    steps.checkCouponNoCode = 'skip (no code)';

    // 步骤3: 测试 checkCoupon 调数据库
    try {
      const r = await checkCoupon('WELCOME10', email, itemTotal);
      steps.checkCouponWELCOME10 = r.ok ? 'ok' : `rejected: ${r.message}`;
    } catch (e) {
      steps.checkCouponWELCOME10 = `CRASH: ${e instanceof Error ? e.message : String(e)}`;
    }

    // 步骤4: PayPal 认证
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${auth}` },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(15000),
    });
    const tokenData = await tokenRes.json();
    steps.paypalAuth = tokenRes.status;

    if (!tokenData.access_token) {
      steps.error = 'No access token';
      return NextResponse.json(steps, { headers: { 'Cache-Control': 'no-store' } });
    }

    // 步骤5: 创建订单（最小化）
    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `DIAG-${Date.now()}`,
          description: 'Voice Culture Diag',
          amount: { currency_code: 'USD', value: '9.99' },
        }],
        application_context: {
          brand_name: 'Voice Culture',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
      signal: AbortSignal.timeout(20000),
    });
    const orderData = await orderRes.json();
    steps.createOrderStatus = orderRes.status;
    steps.createOrderOk = orderRes.ok;
    if (orderRes.ok) {
      steps.orderId = orderData.id;
    } else {
      steps.paypalError = JSON.stringify(orderData).slice(0, 300);
    }

    steps.result = 'ALL STEPS PASSED';
    return NextResponse.json(steps, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    steps.finalCrash = e instanceof Error ? e.message : String(e);
    steps.stack = e instanceof Error ? e.stack?.slice(0, 300) : undefined;
    return NextResponse.json(steps, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
