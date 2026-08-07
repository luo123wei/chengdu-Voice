import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

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
    console.log(`[Auth] Generating code for: ${email}`);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log(`[Auth] Sending verification email to: ${email}`);
    await sendVerificationEmail(email, code);
    console.log(`[Auth] Verification email sent successfully to: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json({ error: `Failed to send email: ${errorMessage}` }, { status: 500 });
  }
}
