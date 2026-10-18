import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'chengdu-voice-secret-key';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    return payload?.role === 'admin' || payload?.username !== undefined;
  } catch {
    return false;
  }
}

type RangeKey = 'yesterday' | '7d' | '30d' | '365d';

const RANGE_DAYS: Record<RangeKey, number> = {
  yesterday: 1,
  '7d': 7,
  '30d': 30,
  '365d': 365,
};

/**
 * GET /api/admin/analytics/ai-crawlers?range=yesterday|7d|30d|365d
 *
 * Reports which AI / search crawlers (GPTBot, PerplexityBot, etc.) hit the site.
 * Time range is exclusive of today (UTC day boundary), same as the stats route.
 *
 * Response shape:
 * {
 *   range, startIso, endIso,
 *   botHitsInRange, botHitsPrev,
 *   byBot: [{bot, count, firstSeen, lastSeen}],   // in range, sorted by count desc
 *   everSeen: [{bot, firstSeen}],                 // all time
 *   topPaths: [{path, count}]                     // top 5 in range
 * }
 *
 * Any query error degrades to zeros / empty arrays so the dashboard never breaks.
 */
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

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
  const endIso = todayStartUtc.toISOString();                     // exclusive upper bound
  const startIso = new Date(todayStartUtc.getTime() - days * 86400_000).toISOString();
  const prevEndIso = startIso;
  const prevStartIso = new Date(todayStartUtc.getTime() - 2 * days * 86400_000).toISOString();

  // Count bot hits (bot_name not null) in [start, end), excluding is_test rows.
  async function countBotHits(start: string, end: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('is_test', false)
      .not('bot_name', 'is', null)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) console.error('[ai-crawlers] count error:', error);
    return count || 0;
  }

  // Fetch bot rows in [start, end), excluding is_test.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchBotRows(start: string, end: string): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('bot_name, target_id, created_at')
      .eq('is_test', false)
      .not('bot_name', 'is', null)
      .gte('created_at', start)
      .lt('created_at', end);
    if (error) {
      console.error('[ai-crawlers] rows error:', error);
      return [];
    }
    return data || [];
  }

  // All-time bot rows (ignore range) to know which crawlers ever reached the site.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchEverSeenRows(): Promise<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('analytics_events')
      .select('bot_name, created_at')
      .eq('is_test', false)
      .not('bot_name', 'is', null);
    if (error) {
      console.error('[ai-crawlers] everSeen error:', error);
      return [];
    }
    return data || [];
  }

  const [botHitsInRange, botHitsPrev, botRows, everRows] = await Promise.all([
    countBotHits(startIso, endIso),
    countBotHits(prevStartIso, prevEndIso),
    fetchBotRows(startIso, endIso),
    fetchEverSeenRows(),
  ]);

  // byBot: per-bot count + first/last seen, within the range; sorted by count desc
  const byBotMap = new Map<string, { bot: string; count: number; firstSeen: string; lastSeen: string }>();
  for (const r of botRows) {
    const bot = r.bot_name as string;
    const ts = r.created_at as string;
    const cur = byBotMap.get(bot);
    if (cur) {
      cur.count++;
      if (ts < cur.firstSeen) cur.firstSeen = ts;
      if (ts > cur.lastSeen) cur.lastSeen = ts;
    } else {
      byBotMap.set(bot, { bot, count: 1, firstSeen: ts, lastSeen: ts });
    }
  }
  const byBot = [...byBotMap.values()].sort((a, b) => b.count - a.count);

  // everSeen: earliest sighting per bot across all time
  const everMap = new Map<string, string>();
  for (const r of everRows) {
    const bot = r.bot_name as string;
    const ts = r.created_at as string;
    const cur = everMap.get(bot);
    if (!cur || ts < cur) everMap.set(bot, ts);
  }
  const everSeen = [...everMap.entries()]
    .map(([bot, firstSeen]) => ({ bot, firstSeen }))
    .sort((a, b) => a.bot.localeCompare(b.bot));

  // topPaths: most-crawled targets within the range
  const pathMap = new Map<string, number>();
  for (const r of botRows) {
    const t = r.target_id as string | null;
    if (!t) continue;
    pathMap.set(t, (pathMap.get(t) || 0) + 1);
  }
  const topPaths = [...pathMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));

  return NextResponse.json({
    range,
    startIso,
    endIso,
    botHitsInRange,
    botHitsPrev,
    byBot,
    everSeen,
    topPaths,
  }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
