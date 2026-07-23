import { NextResponse } from 'next/server';
import { sendDownloadLinkEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    try {
      await sendDownloadLinkEmail(email);
    } catch (emailError) {
      console.error('Failed to send download link email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription successful. Check your email for the download link.' 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
