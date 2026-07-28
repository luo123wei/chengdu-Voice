import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = generateCode();
    
    try {
      await db.verificationCodes.create(email, code);
      console.log('[Auth] Verification code saved to database');
    } catch (dbError) {
      console.error('[Auth] Failed to save verification code to database:', dbError);
      console.log('[Auth] Proceeding with email send despite database error');
    }

    const settings = await db.settings.get();
    const appUrl = settings?.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com';

    await sendEmail({
      to: email,
      subject: 'Your Login Verification Code for Chengdu Voice',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nVisit ${appUrl} to complete your login.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">Chengdu Voice</h2>
          <p>Hello,</p>
          <p>Your login verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #D4A574; margin: 20px 0;">
            ${code}
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>Visit <a href="${appUrl}" style="color: #D4A574;">${appUrl}</a> to complete your login.</p>
          <p style="color: #888; font-size: 12px;">Chengdu Voice | 成都之音</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ error: `Failed to send verification code: ${errorMessage}` }, { status: 500 });
  }
}