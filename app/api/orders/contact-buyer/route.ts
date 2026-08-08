import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendCustomEmailToBuyer } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { orderId, subject, message, paymentLink } = await request.json();

    if (!orderId || !subject || !message) {
      return NextResponse.json(
        { error: '缺少必要参数 (orderId, subject, message)' },
        { status: 400 }
      );
    }

    const order = await db.orders.getById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    await sendCustomEmailToBuyer(
      order.email,
      order.customerName,
      order.id,
      subject,
      message,
      paymentLink
    );

    return NextResponse.json({
      success: true,
      message: `邮件已发送至 ${order.email}`,
    });
  } catch (error) {
    console.error('Contact buyer email error:', error);
    return NextResponse.json(
      { error: '邮件发送失败' },
      { status: 500 }
    );
  }
}
