import { NextRequest, NextResponse } from 'next/server';
import { checkCoupon, redeemCoupon, releaseCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
// 正式环境：api-m.paypal.com  沙箱环境：api-m.sandbox.paypal.com
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

// 国家名 -> PayPal 需要的 ISO 3166-1 alpha-2 国家码
const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'Hong Kong': 'HK',
  'Taiwan': 'TW',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Thailand': 'TH',
  'South Korea': 'KR',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Ireland': 'IE',
  'Austria': 'AT',
  'Portugal': 'PT',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Greece': 'GR',
  'New Zealand': 'NZ',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'India': 'IN',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Israel': 'IL',
  'Turkey': 'TR',
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const getAccessToken = async () => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    console.error('PayPal access token error:', response.status, data);
    throw new Error('PAYPAL_AUTH_FAILED');
  }
  return data.access_token as string;
};

export async function POST(request: NextRequest) {
  let appliedCoupon = '';
  let couponEmail = '';
  try {
    const body = await request.json();
    const {
      items,
      shipping: shippingFromClient,
      tax: taxFromClient,
      total: totalFromClient,
      email,
      shippingAddress,
      couponCode,
    } = body;

    if (!Array.isArray(items) || items.length === 0 || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!clientId || !clientSecret || clientId === 'your_paypal_client_id_here') {
      return NextResponse.json(
        { error: 'PayPal is not configured yet. Please contact support.' },
        { status: 503 }
      );
    }

    // 金额一律在服务端重新计算，防止前端金额被篡改
    const itemTotal = round2(
      items.reduce((sum: number, item: { price: number; quantity: number }) =>
        sum + Number(item.price) * Number(item.quantity), 0)
    );
    const shipping = round2(Number(shippingFromClient) || 0);
    const tax = round2(Number(taxFromClient) || 0);

    // 折扣码在服务端重新校验：身份（订阅者）、是否已用、折扣金额全部以后端为准
    let discount = 0;
    if (couponCode) {
      const check = await checkCoupon(couponCode, email, itemTotal);
      if (!check.ok) {
        return NextResponse.json({ error: check.message }, { status: 400 });
      }
      appliedCoupon = check.code;
      couponEmail = email;
      discount = check.discount;
    }

    const total = round2(itemTotal + shipping + tax - discount);

    if (totalFromClient != null && Math.abs(Number(totalFromClient) - total) > 0.01) {
      console.error('PayPal amount mismatch:', { totalFromClient, itemTotal, shipping, tax, discount, total });
      return NextResponse.json(
        { error: 'Order amount verification failed. Please refresh the page and try again.' },
        { status: 400 }
      );
    }

    const hasPhysical = items.some((item: { type?: string }) => item.type !== 'digital');

    const paypalItems = items.map((item: { name: string; nameEn: string; price: number; quantity: number; productId?: string }) => ({
      name: String(item.nameEn || item.name).slice(0, 127),
      description: item.nameEn ? String(item.nameEn).slice(0, 127) : undefined,
      sku: item.productId ? String(item.productId).slice(0, 127) : undefined,
      quantity: String(item.quantity),
      unit_amount: {
        currency_code: 'USD',
        value: round2(Number(item.price)).toFixed(2),
      },
    }));

    const breakdown: Record<string, { currency_code: string; value: string }> = {
      item_total: { currency_code: 'USD', value: itemTotal.toFixed(2) },
    };
    if (shipping > 0) {
      breakdown.shipping = { currency_code: 'USD', value: shipping.toFixed(2) };
    }
    if (tax > 0) {
      breakdown.tax_total = { currency_code: 'USD', value: tax.toFixed(2) };
    }
    if (discount > 0) {
      breakdown.discount = { currency_code: 'USD', value: `-${discount.toFixed(2)}` };
    }

    const orderNumber = `ORD-${Date.now()}`;

    // 先核销折扣码（唯一约束防并发重复使用）；PayPal 下单失败则释放
    if (appliedCoupon) {
      const redemption = await redeemCoupon(appliedCoupon, email, orderNumber, discount);
      if (!redemption.ok) {
        return NextResponse.json({ error: redemption.message }, { status: 400 });
      }
    }

    const purchaseUnit: Record<string, unknown> = {
      reference_id: orderNumber,
      description: `Voice Culture Order ${orderNumber}`,
      items: paypalItems,
      amount: {
        currency_code: 'USD',
        value: total.toFixed(2),
        breakdown,
      },
      custom_id: email,
    };

    // 实物商品：把买家填的收货地址带给 PayPal；纯数字商品：不需要收货地址
    if (hasPhysical) {
      const countryName: string = shippingAddress?.country || '';
      const countryCode = shippingAddress?.countryCode || COUNTRY_CODES[countryName] || 'US';
      purchaseUnit.shipping = {
        name: {
          full_name: String(shippingAddress?.fullName || '').slice(0, 127),
        },
        address: {
          address_line_1: String(shippingAddress?.address || '').slice(0, 300),
          admin_area_2: String(shippingAddress?.city || '').slice(0, 120),
          postal_code: String(shippingAddress?.postalCode || '').slice(0, 60),
          country_code: countryCode,
        },
      };
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: 'Voice Culture',
          locale: 'en-US',
          shipping_preference: hasPhysical ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal create order failed:', response.status, JSON.stringify(data, null, 2));
      if (appliedCoupon) await releaseCoupon(appliedCoupon, couponEmail).catch(() => {});
      return NextResponse.json(
        { error: 'Failed to create PayPal order', details: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      orderNumber,
      total,
      links: data.links,
    });
  } catch (error) {
    if (appliedCoupon) await releaseCoupon(appliedCoupon, couponEmail).catch(() => {});
    console.error('PayPal order creation error:', error);
    const message = error instanceof Error && error.message === 'PAYPAL_AUTH_FAILED'
      ? 'PayPal credential verification failed. Please try again later or contact support.'
      : 'Failed to create payment';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
