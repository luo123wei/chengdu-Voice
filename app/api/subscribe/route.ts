import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDownloadLinkEmail } from '@/lib/email';

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

    // 先入库（重复邮箱忽略），失败不阻断流程
    try {
      const { error: dbError } = await supabase
        .from('sound_waitlist')
        .upsert(
          { email: String(email).toLowerCase().trim(), source: source || 'sound-map' },
          { onConflict: 'email', ignoreDuplicates: true }
        );
      if (dbError) console.error('Failed to save waitlist email:', dbError);
    } catch (dbErr) {
      console.error('Waitlist insert error:', dbErr);
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
