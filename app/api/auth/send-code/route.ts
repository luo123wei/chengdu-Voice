import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailWithTimeout(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.MAIL_PORT || '465'),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || '',
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
    ...options,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = generateCode();
    console.log(`[Auth] Generating code for: ${email}`);

    // Try to save to database (with timeout, non-blocking)
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Use Promise.race for timeout
      const dbPromise = (async () => {
        await supabase.from('verification_codes').delete().ilike('email', email.toLowerCase());
        const { error } = await supabase.from('verification_codes').insert({
          email,
          code,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });
        if (error) console.error('[Auth] DB save error:', error.message);
        else console.log('[Auth] Code saved to database');
      })();
      
      const dbTimeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
      await Promise.race([dbPromise, dbTimeout]);
    } catch (err: any) {
      console.error('[Auth] Database error (non-fatal):', err.message);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com';

    // Send email with timeout
    console.log(`[Auth] Sending email to: ${email}`);
    const emailPromise = sendEmailWithTimeout({
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
    
    const emailTimeout = new Promise<void>((resolve) => setTimeout(resolve, 15000));
    await Promise.race([emailPromise, emailTimeout]).catch(err => {
      console.error('[Auth] Email error:', err?.message || 'timeout');
    });

    console.log(`[Auth] Process completed for: ${email}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent',
      code // Return code for testing
    });
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ error: `Failed to send verification code: ${errorMessage}` }, { status: 500 });
  }
}