import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPaymentReceivedEmail } from '@/lib/email';

export async function GET() {
  const orders = await db.orders.getAll();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await db.orders.create({
      ...body,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 获取更新前的订单，用于检测状态变化
    const previousOrder = await db.orders.getById(body.id);
    if (!previousOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = previousOrder.status;
    const newStatus = body.status;

    const order = await db.orders.update(body.id, body);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 当订单从 pending 变为 paid 时，自动发送"付款已收到"邮件
    if (previousStatus === 'pending' && newStatus === 'paid') {
      try {
        await sendPaymentReceivedEmail(
          order.email,
          order.customerName,
          order.id,
          order.totalAmount
        );
        console.log(`[Orders] Payment received email sent to ${order.email} for order ${order.id}`);
      } catch (emailError) {
        console.error('[Orders] Failed to send payment received email:', emailError);
        // 邮件发送失败不影响订单状态更新
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}