import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadLinkEmail, sendWelcomeDiscountEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 声音地图下载名单：入库 sound_waitlist + 发送下载链接邮件
    if (source === 'sound-map') {
      try {
        const { error: dbError } = await supabase
          .from('sound_waitlist')
          .upsert(
            { email: cleanEmail, source: 'sound-map' },
            { onConflict: 'email', ignoreDuplicates: true }
          );
        if (dbError) console.error('Failed to save waitlist email:', dbError);
      } catch (dbErr) {
        console.error('Waitlist insert error:', dbErr);
      }

      try {
        await sendDownloadLinkEmail(cleanEmail);
      } catch (emailError) {
        console.error('Failed to send download link email:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription successful. Check your email for the download link.'
      }, { status: 200 });
    }

    // 首页邮件订阅：入库 newsletter_subscribers + 发送 WELCOME10 欢迎邮件
    try {
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { email: cleanEmail, source: source || 'homepage' },
          { onConflict: 'email', ignoreDuplicates: true }
        );
      if (dbError) console.error('Failed to save newsletter subscriber:', dbError);
    } catch (dbErr) {
      console.error('Newsletter insert error:', dbErr);
    }

    try {
      await sendWelcomeDiscountEmail(cleanEmail);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      couponCode: 'WELCOME10',
      message: "You're in. Your 10% welcome code is WELCOME10 — also sent to your inbox."
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
