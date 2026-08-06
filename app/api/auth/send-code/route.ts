import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailWithTimeout(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const host = process.env.MAIL_HOST || 'smtp.qq.com';
    const port = parseInt(process.env.MAIL_PORT || '465');
    const secure = process.env.MAIL_SECURE === 'true';

    // Resolve DNS to get IPv4 address (force IPv4 to avoid ENETUNREACH on Render)
    let smtpHost = host;
    try {
      const { address } = await dnsLookup(host, { family: 4 });
      smtpHost = address;
      console.log(`[Email] Resolved ${host} to IPv4: ${address}`);
    } catch (dnsErr) {
      console.warn(`[Email] DNS resolution failed, using original host: ${dnsErr}`);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    // Verify SMTP connection first
    await transporter.verify();
    console.log('[Email] SMTP connection verified');

    const mailOptions = {
      from: `Chengdu Voice <${process.env.MAIL_USER || 'hello@chengduvoice.com'}>`,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Email sent successfully:', info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error('[Email] Send failed:', err?.message);
    return { success: false, error: err?.message || 'Failed to send email' };
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world';

    // Send email with proper error handling
    console.log(`[Auth] Sending email to: ${email}`);
    const emailResult = await sendEmailWithTimeout({
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

    console.log(`[Auth] Process completed for: ${email}, email success: ${emailResult.success}`);
    
    if (!emailResult.success) {
      // Email failed but code is generated - return error with code for debugging
      return NextResponse.json({ 
        error: `邮件发送失败：${emailResult.error}。请稍后重试或联系客服。`,
        debug_code: code  // Only for debugging, remove in production
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '验证码已发送到你的邮箱，请查收' 
    });
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ error: `系统错误：${errorMessage}` }, { status: 500 });
  }
}