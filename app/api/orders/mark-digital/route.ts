import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { email, orderNumber, albumSlug } = await request.json();
    if (!email || !orderNumber || !albumSlug) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const { error } = await supabase.from('purchased_albums').insert({
      email: String(email).toLowerCase().trim(),
      order_number: orderNumber,
      album_slug: albumSlug,
    });

    if (error && error.code !== '23505') {
      console.error('mark-digital insert error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
