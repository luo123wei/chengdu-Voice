import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  
  if (email) {
    const user = await db.users.getByEmail(email);
    if (user) {
      return NextResponse.json(user);
    }
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const users = await db.users.getAll();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingUser = await db.users.getByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser });
    }

    const newUser = await db.users.create({
      email,
      name,
      createdAt: new Date().toISOString(),
      orderIds: [],
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();
    
    if (!id || !updates) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updatedUser = await db.users.update(id, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}