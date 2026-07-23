import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, orderNumber, items, total, shippingMethod } = await request.json();

    if (!email || !customerName || !orderNumber || !items || !total) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    await sendOrderConfirmationEmail(email, customerName, orderNumber, items, total, shippingMethod);

    return NextResponse.json({
      success: true,
      message: '订单确认邮件已发送',
    });
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { error: '邮件发送失败' },
      { status: 500 }
    );
  }
}