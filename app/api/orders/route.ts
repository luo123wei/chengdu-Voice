import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const order = await db.orders.update(body.id, body);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}