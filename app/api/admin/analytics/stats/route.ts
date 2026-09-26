import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type RangeKey = 'yesterday' | '7d' | '30d';

const RANGE_DAYS: Record<RangeKey, number> = {
  yesterday: 1,
  '7d': 7,
  '30d': 30,
};

/**
 * GET /api/admin/analytics/stats?range=yesterday|7d|30d
 *
 * Returns aggregated analytics for the requested time range.
 * Time range is exclusive of today (UTC day boundary), as required.
 *
 * Response shape:
 * {
 *   range, periodStart, periodEnd,
 *   blogViews, blogVisitors, blogTop: [{slug, views, prevViews}],
 *   productViews, productVisitors, productTop: [{slug, views, prevViews}],
 *   addToCart, addToCartPrev, orders, ordersRevenue, ordersPrev,
 *   conversionRate, conversionRatePrev,
 *   daily: [{date, blogViews, productViews, addToCart, orders}]
 * }
 */
export async function GET(request: NextRequest) {
  const rangeParam = (request.nextUrl.searchParams.get('range') || '7d') as RangeKey;
  const range = RANGE_DAYS[rangeParam] ? rangeParam : '7d';
  const days = RANGE_DAYS[range];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 });
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Time boundaries (UTC). "Today" is excluded from both current and previous period.
  const now = new Date();
  const todayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const periodEnd = todayStartUtc.toISOString();                  // exclusive upper bound
  const periodStart = new Date(todayStartUtc.getTime() - days * 86400_000).toISOString();
  const prevPeriodEnd = periodStart;
  const prevPeriodStart = new Date(todayStartUtc.getTime() - 2 * days * 86400_000).toISOString();

  // Helper: run a count query for an event type within [start, end)
  // Excludes is_test events (admin's own test data).
  async function countType(eventType: string, start: string, end: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', eventType)
      .eq('is_test', false)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) console.error('[analytics] count error:', error);
    return count || 0;
  }

  // Helper: unique visitors (distinct session_id, excludes null and is_test)
  async function countVisitors(eventType: string, start: string, end: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('session_id')
      .eq('event_type', eventType)
      .eq('is_test', false)
      .gte('created_at', start)
      .lt('created_at', end)
      .not('session_id', 'is', null);
    if (error) {
      console.error('[analytics] visitors error:', error);
      return 0;
    }
    const uniq = new Set((data || []).map((r: { session_id: string }) => r.session_id));
    return uniq.size;
  }

  // Helper: top targets by views in [start, end) (excludes is_test)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function topTargets(eventType: string, start: string, end: string, limit = 5): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('target_id')
      .eq('event_type', eventType)
      .eq('is_test', false)
      .gte('created_at', start)
      .lt('created_at', end)
      .not('target_id', 'is', null);
    if (error) {
      console.error('[analytics] topTargets error:', error);
      return [];
    }
    const counts = new Map<string, number>();
    for (const r of data || []) {
      const t = r.target_id as string;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
    // For each top target, also fetch previous period views for delta calc
    const withPrev = await Promise.all(sorted.map(async ([slug, views]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .eq('target_id', slug)
        .eq('is_test', false)
        .gte('created_at', prevPeriodStart)
        .lt('created_at', prevPeriodEnd);
      return { slug, views, prevViews: count || 0 };
    }));
    return withPrev;
  }

  // Run all queries in parallel
  const [
    blogViews, blogViewsPrev,
    blogVisitors, blogVisitorsPrev,
    productViews, productViewsPrev,
    productVisitors, productVisitorsPrev,
    addToCart, addToCartPrev,
    orders, ordersPrev,
    blogTop, productTop,
  ] = await Promise.all([
    countType('blog_view', periodStart, periodEnd),
    countType('blog_view', prevPeriodStart, prevPeriodEnd),
    countVisitors('blog_view', periodStart, periodEnd),
    countVisitors('blog_view', prevPeriodStart, prevPeriodEnd),
    countType('product_view', periodStart, periodEnd),
    countType('product_view', prevPeriodStart, prevPeriodEnd),
    countVisitors('product_view', periodStart, periodEnd),
    countVisitors('product_view', prevPeriodStart, prevPeriodEnd),
    countType('add_to_cart', periodStart, periodEnd),
    countType('add_to_cart', prevPeriodStart, prevPeriodEnd),
    countType('order_created', periodStart, periodEnd),
    countType('order_created', prevPeriodStart, prevPeriodEnd),
    topTargets('blog_view', periodStart, periodEnd, 5),
    topTargets('product_view', periodStart, periodEnd, 5),
  ]);

  // --- Product intents (votes + preorders) ---
  // Total counts (current snapshot, not time-bounded — reflects current products.status)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: productsRows } = await (supabase as any)
    .from('products')
    .select('id, slug, name_en, status, votes_count');
  const allProducts = productsRows || [];
  const votingProducts = allProducts.filter((p: any) => p.status === 'design');
  const preorderProducts = allProducts.filter((p: any) => p.status === 'preorder');
  const votingProductCount = votingProducts.length;
  const preorderProductCount = preorderProducts.length;
  const votingTotalVotes = votingProducts.reduce(
    (sum: number, p: any) => sum + (Number(p.votes_count) || 0), 0,
  );
  // TOP 5 voting products by votes_count, with system boost split
  const votingTopBase = votingProducts
    .slice()
    .sort((a: any, b: any) => (Number(b.votes_count) || 0) - (Number(a.votes_count) || 0))
    .slice(0, 5);

  // For each top voting product, fetch cumulative system boost count from vote_boost_logs
  const votingTop = await Promise.all(votingTopBase.map(async (p: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: boostRows } = await (supabase as any)
      .from('vote_boost_logs')
      .select('boost_count')
      .eq('product_id', p.id);
    const systemBoosted = (boostRows || []).reduce(
      (sum: number, r: { boost_count?: number }) => sum + (Number(r.boost_count) || 0), 0,
    );
    const totalVotes = Number(p.votes_count) || 0;
    return {
      slug: p.slug || p.id,
      name: p.name_en || p.slug || p.id,
      votes: totalVotes,
      systemBoosted,
      realVotes: Math.max(0, totalVotes - systemBoosted),
    };
  }));

  // Intent events in the time range (from product_intents table, which has created_at)
  async function countIntents(type: 'vote' | 'preorder', start: string, end: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('product_intents')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) console.error('[analytics] intents count error:', error);
    return count || 0;
  }
  // TOP 5 preorder products by intent count in the period
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function topIntents(type: 'vote' | 'preorder', start: string, end: string, limit = 5): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('product_intents')
      .select('product_id')
      .eq('type', type)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) {
      console.error('[analytics] topIntents error:', error);
      return [];
    }
    const counts = new Map<string, number>();
    for (const r of data || []) {
      const pid = r.product_id as string;
      counts.set(pid, (counts.get(pid) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
    // Resolve product_id -> slug/name
    return sorted.map(([pid, n]) => {
      const p = allProducts.find((x: any) => x.id === pid);
      return { slug: p?.slug || pid, name: p?.name_en || p?.slug || pid, count: n };
    });
  }

  const [
    votesInPeriod, votesInPrev,
    preordersInPeriod, preordersInPrev,
    preorderTop,
  ] = await Promise.all([
    countIntents('vote', periodStart, periodEnd),
    countIntents('vote', prevPeriodStart, prevPeriodEnd),
    countIntents('preorder', periodStart, periodEnd),
    countIntents('preorder', prevPeriodStart, prevPeriodEnd),
    topIntents('preorder', periodStart, periodEnd, 5),
  ]);

  // Daily breakdown for trend chart (per-day buckets across the period)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dailyRows } = await (supabase as any)
    .from('analytics_events')
    .select('event_type, created_at')
    .eq('is_test', false)
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);
  const dailyMap = new Map<string, { blogViews: number; productViews: number; addToCart: number; orders: number }>();
  for (const r of dailyRows || []) {
    const day = (r.created_at as string).slice(0, 10);
    if (!dailyMap.has(day)) dailyMap.set(day, { blogViews: 0, productViews: 0, addToCart: 0, orders: 0 });
    const bucket = dailyMap.get(day)!;
    if (r.event_type === 'blog_view') bucket.blogViews++;
    else if (r.event_type === 'product_view') bucket.productViews++;
    else if (r.event_type === 'add_to_cart') bucket.addToCart++;
    else if (r.event_type === 'order_created') bucket.orders++;
  }
  const daily = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, ...v }));

  // Revenue from orders table for the same period
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderRows } = await (supabase as any)
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);
  const ordersRevenue = (orderRows || []).reduce(
    (sum: number, o: { total_amount?: number }) => sum + (typeof o.total_amount === 'number' ? o.total_amount : 0),
    0,
  );

  // Conversion rate: orders / add-to-cart * 100
  const conversionRate = addToCart > 0 ? (orders / addToCart) * 100 : 0;
  const conversionRatePrev = addToCartPrev > 0 ? (ordersPrev / addToCartPrev) * 100 : 0;

  return NextResponse.json({
    range,
    periodStart,
    periodEnd,
    blogViews,
    blogViewsPrev,
    blogVisitors,
    blogVisitorsPrev,
    productViews,
    productViewsPrev,
    productVisitors,
    productVisitorsPrev,
    addToCart,
    addToCartPrev,
    orders,
    ordersPrev,
    ordersRevenue,
    conversionRate,
    conversionRatePrev,
    blogTop,
    productTop,
    daily,
    votingProductCount,
    preorderProductCount,
    votingTotalVotes,
    votingTop,
    votesInPeriod,
    votesInPrev,
    preordersInPeriod,
    preordersInPrev,
    preorderTop,
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
