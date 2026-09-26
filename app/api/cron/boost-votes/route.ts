import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET/POST /api/cron/boost-votes
 *
 * Daily cron job: adds 1~10 random votes to every product that is
 *   - status = 'design'
 *   - on_sale_at is set
 *   - today is between day 6 and day 25 after on_sale_at (inclusive)
 *     (i.e. starts boosting from day 6, runs for 20 days)
 *
 * Boosts are idempotent per (product_id, boosted_date) — running
 * the cron twice on the same day will not double-boost.
 *
 * Secured by a shared secret:
 *   Authorization: Bearer <CRON_SECRET>
 * Set CRON_SECRET in env. Render cron / external cron uses this header.
 */
async function handler(request: NextRequest) {
  // --- Auth ---
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 });
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Today's UTC date
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayStr = todayUtc.toISOString().slice(0, 10);

  // Find candidate design products with on_sale_at in the boost window
  // Day 6 ~ day 25 from on_sale_at. Day counting: day 0 = on_sale_at date.
  //   Boosting starts when (today - on_sale_at_date) >= 5  → 6th day inclusive
  //   Boosting stops  when (today - on_sale_at_date) >  24 → 25th day inclusive
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products, error } = await (supabase as any)
    .from('products')
    .select('id, slug, name_en, on_sale_at, status, votes_count')
    .eq('status', 'design')
    .not('on_sale_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { productId: string; slug: string; boosted: boolean; boostCount?: number; reason?: string }[] = [];

  for (const p of products || []) {
    const onSale = new Date(p.on_sale_at as string);
    const onSaleDayUtc = new Date(Date.UTC(onSale.getUTCFullYear(), onSale.getUTCMonth(), onSale.getUTCDate()));
    const daysSinceOnSale = Math.floor((todayUtc.getTime() - onSaleDayUtc.getTime()) / 86400_000);

    if (daysSinceOnSale < 5) {
      results.push({ productId: p.id, slug: p.slug, boosted: false, reason: `day ${daysSinceOnSale + 1}, too early (need day 6+)` });
      continue;
    }
    if (daysSinceOnSale > 24) {
      results.push({ productId: p.id, slug: p.slug, boosted: false, reason: `day ${daysSinceOnSale + 1}, boost window ended (day 25+)` });
      continue;
    }

    const boostCount = Math.floor(Math.random() * 10) + 1; // 1..10

    // Idempotent insert into vote_boost_logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: logErr } = await (supabase as any)
      .from('vote_boost_logs')
      .insert({
        product_id: p.id,
        boost_count: boostCount,
        boosted_date: todayStr,
      });

    if (logErr) {
      // Unique constraint violation = already boosted today
      if (logErr.code === '23505') {
        results.push({ productId: p.id, slug: p.slug, boosted: false, reason: 'already boosted today' });
        continue;
      }
      results.push({ productId: p.id, slug: p.slug, boosted: false, reason: `log insert failed: ${logErr.message}` });
      continue;
    }

    // Atomic increment on products.votes_count via existing RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcErr } = await (supabase as any).rpc('increment_votes', { p_id: p.id });
    // increment_votes only adds 1. We need to add boostCount. Update directly.
    if (rpcErr || boostCount > 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updErr } = await (supabase as any)
        .from('products')
        .update({ votes_count: (Number(p.votes_count) || 0) + boostCount })
        .eq('id', p.id);
      if (updErr) {
        results.push({ productId: p.id, slug: p.slug, boosted: false, reason: `update votes_count failed: ${updErr.message}` });
        continue;
      }
    }

    results.push({ productId: p.id, slug: p.slug, boosted: true, boostCount });
  }

  return NextResponse.json({
    date: todayStr,
    boostedCount: results.filter((r) => r.boosted).length,
    results,
  });
}

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
