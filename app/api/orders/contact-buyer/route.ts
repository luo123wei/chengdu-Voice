import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendCustomEmailToBuyer } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { orderId, subject, message, paymentLink } = await request.json();

    if (!orderId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required parameters (orderId, subject, message)' },
        { status: 400 }
      );
    }

    const order = await db.orders.getById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
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
      message: `Email sent to ${order.email}`,
    });
  } catch (error) {
    console.error('Contact buyer email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
