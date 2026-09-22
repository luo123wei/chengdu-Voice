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
  // mark-digital 落库存的是原始小写邮箱（@ 不编码），查询必须保持一致
  const normalizedEmail = String(email).toLowerCase().trim();

  // 1. 验证用户是否真的买过（查 purchased_albums）
  const { data: purchases } = await supabase
    .from('purchased_albums')
    .select('order_number, album_slug')
    .eq('email', normalizedEmail);

  let rows = purchases || [];
  if (rows.length === 0 && orderNumber) {
    // fallback: 兼容历史数据里可能存的编码邮箱
    const { data: pa } = await supabase
      .from('purchased_albums')
      .select('order_number, album_slug')
      .eq('email', encodeURIComponent(normalizedEmail))
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (pa) rows = [pa];
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'No purchase found for this email.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  // 2. 计算该用户可下载的曲目范围
  //    - 买过整库（track_slugs 为空的数字商品，如 chengdu-sound-map）→ 全部已发布 premium 曲目
  //    - 只买过主题包 → 各包曲目合集，立即交付（不受定时发布限制，因为用户已付费）
  const albumSlugs = Array.from(new Set(rows.map((r: { album_slug: string }) => r.album_slug).filter(Boolean)));

  let slugFilter: string[] | null = null;
  if (albumSlugs.length > 0) {
    const { data: prods } = await supabase
      .from('products')
      .select('slug, track_slugs')
      .in('slug', albumSlugs);
    const packRows = prods || [];
    const hasFullLibrary = packRows.some((p: { track_slugs: unknown }) => !p.track_slugs || (Array.isArray(p.track_slugs) && p.track_slugs.length === 0));
    if (!hasFullLibrary) {
      const union = new Set<string>();
      for (const p of packRows) {
        if (Array.isArray(p.track_slugs)) {
          for (const s of p.track_slugs) union.add(String(s));
        }
      }
      slugFilter = Array.from(union);
    }
  }

  // 3. 查询曲目
  let query = supabase
    .from('free_sounds')
    .select('id, slug, title, title_en, duration, audio, description')
    .eq('is_premium', true);

  if (slugFilter && slugFilter.length > 0) {
    query = query.in('slug', slugFilter);
  } else {
    // 整库买家：只返回已到定时发布时间的曲目
    query = query.or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`);
  }

  const { data: sounds, error } = await query.order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ ok: true, count: sounds?.length || 0, sounds: sounds || [] }, { headers: { 'Cache-Control': 'no-store' } });
}
