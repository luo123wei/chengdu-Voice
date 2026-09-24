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
  async function countType(eventType: string, start: string, end: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', eventType)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) console.error('[analytics] count error:', error);
    return count || 0;
  }

  // Helper: unique visitors (distinct session_id, excludes null)
  async function countVisitors(eventType: string, start: string, end: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('session_id')
      .eq('event_type', eventType)
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

  // Helper: top targets by views in [start, end)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function topTargets(eventType: string, start: string, end: string, limit = 5): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('target_id')
      .eq('event_type', eventType)
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

  // Daily breakdown for trend chart (per-day buckets across the period)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dailyRows } = await (supabase as any)
    .from('analytics_events')
    .select('event_type, created_at')
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
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
