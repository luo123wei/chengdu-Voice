import { NextResponse } from 'next/server';

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
