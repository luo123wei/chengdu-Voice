import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const clientId = process.env.PAYPAL_CLIENT_ID || '';
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
// 正式环境：api-m.paypal.com  沙箱环境：api-m.sandbox.paypal.com
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

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
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      );
    }

    if (!clientId || !clientSecret || clientId === 'your_paypal_client_id_here') {
      return NextResponse.json(
        { error: 'PayPal is not configured yet. Please contact support.' },
        { status: 503 }
      );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Prefer': 'return=representation',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', response.status, JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'Payment was not completed. Please try again or contact support.', status: data.status, details: data },
        { status: 500 }
      );
    }

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return NextResponse.json({
      success: true,
      status: data.status,
      transactionId: capture?.id,
      order: data,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    const message = error instanceof Error && error.message === 'PAYPAL_AUTH_FAILED'
      ? 'PayPal credential verification failed. Please try again later or contact support.'
      : 'Payment capture failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
