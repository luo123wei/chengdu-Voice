import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    if (!(await db.verificationCodes.isValid(email, code))) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 401 });
    }

    let user = await db.users.getByEmail(email);
    if (!user) {
      user = await db.users.create({
        email,
        createdAt: new Date().toISOString(),
        orderIds: [],
      });
    }

    await db.users.update(user.id, { lastLoginAt: new Date().toISOString() });
    await db.verificationCodes.delete(email);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}