import { NextRequest, NextResponse } from 'next/server';

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
  return data.access_token;
};

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单ID' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: '支付捕获失败' },
      { status: 500 }
    );
  }
}