import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const orderNumber = searchParams.get('orderNumber');

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const nowIso = new Date().toISOString();
  const supabaseSafeEmail = encodeURIComponent(String(email).toLowerCase().trim());

  // 1. 验证用户是否真的买过（查 purchased_albums 或 orders）
  let verified = false;
  if (orderNumber) {
    const { data: pa } = await supabase
      .from('purchased_albums')
      .select('id')
      .eq('email', supabaseSafeEmail)
      .eq('order_number', orderNumber)
      .maybeSingle();
    verified = !!pa;
  }
  if (!verified) {
    const { count } = await supabase
      .from('purchased_albums')
      .select('id', { count: 'exact' })
      .eq('email', supabaseSafeEmail);
    verified = (count || 0) > 0;
  }

  if (!verified) {
    return NextResponse.json({ ok: false, error: 'No purchase found for this email.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  // 2. 返回所有已发布的 premium 声音
  const { data: sounds, error } = await supabase
    .from('free_sounds')
    .select('id, slug, title, title_en, duration, audio, description, category')
    .eq('is_premium', true)
    .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ ok: true, count: sounds?.length || 0, sounds: sounds || [] }, { headers: { 'Cache-Control': 'no-store' } });
}
