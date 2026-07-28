import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveCodeToDatabase(email: string, code: string): Promise<void> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('verification_codes').delete().ilike('email', email.toLowerCase());
    const { error } = await supabase.from('verification_codes').insert({
      email,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    
    if (error) {
      console.error('[Auth] Failed to save code to database:', error.message);
    } else {
      console.log('[Auth] Verification code saved to database');
    }
  } catch (err: any) {
    console.error('[Auth] Database error:', err.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = generateCode();
    console.log(`[Auth] Generating code for: ${email}`);
    
    // Save to database with timeout (5 seconds)
    const dbPromise = saveCodeToDatabase(email, code);
    const dbTimeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
    await Promise.race([dbPromise, dbTimeout]);
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com';

    console.log(`[Auth] Sending email to: ${email}`);
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

    console.log(`[Auth] Email sent successfully to: ${email}`);
    return NextResponse.json({ success: true, message: 'Verification code sent', code });
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ error: `Failed to send verification code: ${errorMessage}` }, { status: 500 });
  }
}