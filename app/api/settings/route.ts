import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const settings = await db.settings.get();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await db.settings.save(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}