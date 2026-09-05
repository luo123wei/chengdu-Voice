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
    const { items, total, email, customerName, shippingMethod } = await request.json();

    if (!items || !total || !email) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${Date.now()}`;
    const accessToken = await getAccessToken();

    const paypalItems = items.map((item: { name: string; nameEn: string; price: number; quantity: number }) => ({
      name: item.nameEn,
      description: item.name,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: 'USD',
        value: item.price.toFixed(2),
      },
    }));

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber,
            description: `Chengdu Craft Studio Order ${orderNumber}`,
            items: paypalItems,
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total.toFixed(2),
                },
              },
            },
          },
        ],
        application_context: {
          brand_name: 'Chengdu Craft Studio',
          locale: 'en-US',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancel=true`,
        },
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      orderId: data.id,
      orderNumber,
      links: data.links,
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: '创建支付失败' },
      { status: 500 }
    );
  }
}