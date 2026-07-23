import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const rates = await db.shippingRates.getAll();
  return NextResponse.json(rates);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await db.shippingRates.save(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save shipping rates' }, { status: 500 });
  }
}