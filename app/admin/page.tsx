'use client';
import { useState, useEffect, useMemo } from 'react';
import { FileText, ShoppingBag, TrendingUp, Users, Package, Eye, ShoppingCart, DollarSign, Percent, ThumbsUp, BellRing, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type RangeKey = 'yesterday' | '7d' | '30d';

type Stats = {
  range: RangeKey;
  periodStart: string;
  periodEnd: string;
  blogViews: number;
  blogViewsPrev: number;
  blogVisitors: number;
  blogVisitorsPrev: number;
  productViews: number;
  productViewsPrev: number;
  productVisitors: number;
  productVisitorsPrev: number;
  addToCart: number;
  addToCartPrev: number;
  orders: number;
  ordersPrev: number;
  ordersRevenue: number;
  conversionRate: number;
  conversionRatePrev: number;
  blogTop: { slug: string; views: number; prevViews: number }[];
  productTop: { slug: string; views: number; prevViews: number }[];
  daily: { date: string; blogViews: number; productViews: number; addToCart: number; orders: number }[];
  // Product intents (voting + preorder)
  votingProductCount: number;
  preorderProductCount: number;
  votingTotalVotes: number;
  votingTop: { slug: string; name: string; votes: number; systemBoosted: number; realVotes: number }[];
  votesInPeriod: number;
  votesInPrev: number;
  preordersInPeriod: number;
  preordersInPrev: number;
  preorderTop: { slug: string; name: string; count: number }[];
};

type AiCrawlerStats = {
  range: RangeKey;
  startIso: string;
  endIso: string;
  botHitsInRange: number;
  botHitsPrev: number;
  byBot: { bot: string; count: number; firstSeen: string; lastSeen: string }[];
  everSeen: { bot: string; firstSeen: string }[];
  topPaths: { path: string; count: number }[];
};

// AI crawlers we track, in the order they are shown on the dashboard.
const KNOWN_BOTS: { key: string; label: string }[] = [
  { key: 'GPTBot', label: 'GPTBot (OpenAI)' },
  { key: 'OAI-SearchBot', label: 'OAI-SearchBot (ChatGPT 搜索)' },
  { key: 'PerplexityBot', label: 'PerplexityBot' },
  { key: 'ClaudeBot', label: 'ClaudeBot' },
  { key: 'CCBot', label: 'CCBot' },
  { key: 'Bytespider', label: 'Bytespider' },
  { key: 'Applebot', label: 'Applebot' },
  { key: 'Googlebot', label: 'Googlebot' },
  { key: 'Bingbot', label: 'Bingbot' },
];

function rangeToDays(range: RangeKey): number {
  if (range === 'yesterday') return 1;
  if (range === '30d') return 30;
  return 7;
}

function delta(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function DeltaBadge({ cur, prev }: { cur: number; prev: number }) {
  const d = delta(cur, prev);
  const up = d >= 0;
  return (
    <span className={`text-xs ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? '▲' : '▼'} {Math.abs(d)}% vs 上期
    </span>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>('7d');
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiStats, setAiStats] = useState<AiCrawlerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    // Check if test mode cookie is set (admin-only indicator)
    setTestMode(document.cookie.includes('cv_test_mode='));
  }, []);

  const toggleTestMode = () => {
    if (testMode) {
      // Clear cookie
      document.cookie = 'cv_test_mode=; path=/; max-age=0';
      setTestMode(false);
    } else {
      // Set cookie with a fixed marker value; server checks presence only
      document.cookie = `cv_test_mode=1; path=/; max-age=${30 * 86400}`;
      setTestMode(true);
    }
  };

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    fetch(`/api/admin/analytics/stats?range=${range}`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`stats ${r.status}`);
        return r.json();
      })
      .then((data) => setStats(data))
      .catch((err) => {
        console.error('Failed to fetch stats:', err);
        setStats(null);
      })
      .finally(() => setLoading(false));

    fetch(`/api/admin/analytics/ai-crawlers?range=${range}`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`ai-crawlers ${r.status}`);
        return r.json();
      })
      .then((data) => setAiStats(data))
      .catch((err) => {
        console.error('Failed to fetch AI crawler stats:', err);
        setAiStats(null);
      });
  }, [range]);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: '博客浏览 (PV)', value: stats.blogViews.toLocaleString(), icon: FileText, cur: stats.blogViews, prev: stats.blogViewsPrev },
      { label: '博客访客 (UV)', value: stats.blogVisitors.toLocaleString(), icon: Users, cur: stats.blogVisitors, prev: stats.blogVisitorsPrev },
      { label: '商品浏览 (PV)', value: stats.productViews.toLocaleString(), icon: Eye, cur: stats.productViews, prev: stats.productViewsPrev },
      { label: '商品访客 (UV)', value: stats.productVisitors.toLocaleString(), icon: Users, cur: stats.productVisitors, prev: stats.productVisitorsPrev },
      { label: '加购人数', value: stats.addToCart.toLocaleString(), icon: ShoppingCart, cur: stats.addToCart, prev: stats.addToCartPrev },
      { label: '下单人数', value: stats.orders.toLocaleString(), icon: Package, cur: stats.orders, prev: stats.ordersPrev },
      { label: '成交额', value: `$${stats.ordersRevenue.toFixed(2)}`, icon: DollarSign, cur: stats.ordersRevenue, prev: 0 },
      { label: '加购→下单转化率', value: `${stats.conversionRate.toFixed(1)}%`, icon: Percent, cur: stats.conversionRate, prev: stats.conversionRatePrev },
    ];
  }, [stats]);

  const rangeTabs: { key: RangeKey; label: string }[] = [
    { key: 'yesterday', label: '昨日' },
    { key: '7d', label: '近7日' },
    { key: '30d', label: '近30日' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">管理控制台</h1>
          <p className="text-gray-600 mt-1">欢迎回来, {user?.username}!</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTestMode}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              testMode
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-gray-300 text-gray-600 hover:border-black'
            }`}
            title={testMode ? '当前为测试模式，你的浏览/操作会被标记' : '开启后，你的浏览/操作会被标记为测试数据'}
          >
            {testMode ? '🧪 测试模式 ON' : '测试模式 OFF'}
          </button>
          <p className="text-sm text-gray-500 hidden sm:block">
            数据不含当日，UTC 0点起算
          </p>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {rangeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRange(tab.key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  range === tab.key ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : !stats ? (
        <div className="text-center py-20 text-red-500">数据加载失败</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-black" />
                  </div>
                  <DeltaBadge cur={card.cur} prev={card.prev} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Product Intents — Voting & Pre-order snapshot */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center">
                <ThumbsUp className="w-4 h-4 mr-2 text-black" />
                投票商品 (Voting)
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">在投商品数</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.votingProductCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">累计票数</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.votingTotalVotes}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">本期新增投票</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.votesInPeriod}</p>
                  <DeltaBadge cur={stats.votesInPeriod} prev={stats.votesInPrev} />
                </div>
              </div>
              {stats.votingTop.length === 0 ? (
                <p className="text-sm text-gray-400 py-3 text-center">暂无在投商品</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-2.5 pb-1 text-[10px] text-gray-400 uppercase">
                    <span>商品</span>
                    <span className="text-right">总票</span>
                    <span className="text-right">真实</span>
                    <span className="text-right">系统</span>
                  </div>
                  {stats.votingTop.map((v, i) => (
                    <div key={v.slug} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                        <a
                          href={`/shop/${v.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-primary truncate"
                        >
                          {v.name}
                        </a>
                      </div>
                      <span className="text-sm font-bold text-gray-800 text-right">{v.votes}</span>
                      <span className="text-sm text-green-700 font-medium text-right">{v.realVotes}</span>
                      <span className="text-sm text-gray-400 text-right">{v.systemBoosted}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center">
                <BellRing className="w-4 h-4 mr-2 text-black" />
                预订商品 (Pre-order)
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">在售预订商品数</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.preorderProductCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">本期新增预订</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.preordersInPeriod}</p>
                  <DeltaBadge cur={stats.preordersInPeriod} prev={stats.preordersInPrev} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">上期预订</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.preordersInPrev}</p>
                </div>
              </div>
              {stats.preorderTop.length === 0 ? (
                <p className="text-sm text-gray-400 py-3 text-center">本期暂无预订数据</p>
              ) : (
                <div className="space-y-2">
                  {stats.preorderTop.map((p, i) => (
                    <div key={p.slug} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                        <a
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-primary truncate"
                        >
                          {p.name}
                        </a>
                      </div>
                      <span className="text-sm font-bold text-gray-800 ml-2">{p.count} 人</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TOP Lists */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-black" />
                TOP 5 博客 (按 PV)
              </h2>
              {stats.blogTop.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">暂无数据</p>
              ) : (
                <div className="space-y-3">
                  {stats.blogTop.map((b, i) => (
                    <div key={b.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-primary truncate"
                        >
                          {b.slug}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 ml-2">
                        <span className="text-sm font-bold text-gray-800">{b.views}</span>
                        <DeltaBadge cur={b.views} prev={b.prevViews} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2 text-black" />
                TOP 5 商品 (按 PV)
              </h2>
              {stats.productTop.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">暂无数据</p>
              ) : (
                <div className="space-y-3">
                  {stats.productTop.map((p, i) => (
                    <div key={p.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                        <a
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-primary truncate"
                        >
                          {p.slug}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 ml-2">
                        <span className="text-sm font-bold text-gray-800">{p.views}</span>
                        <DeltaBadge cur={p.views} prev={p.prevViews} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend Chart (simple SVG sparkline-style) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-black" />
              每日趋势 ({stats.daily.length} 天)
            </h2>
            {stats.daily.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">暂无数据</p>
            ) : (
              <DailyChart data={stats.daily} />
            )}
          </div>

          {/* AI Visibility */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
            <h2 className="text-base font-serif font-bold text-gray-800 mb-1 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-black" />
              AI 可见度
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              AI 爬虫抓取是「被 AI 引用」的前置信号 — 抓到不代表已经引用，但抓不到就一定不会被引用。
            </p>
            {!aiStats ? (
              <p className="text-sm text-gray-400 py-6 text-center">加载中...</p>
            ) : (
              <div className="space-y-6">
                {/* Summary KPI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <DeltaBadge cur={aiStats.botHitsInRange} prev={aiStats.botHitsPrev} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{aiStats.botHitsInRange.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">近{rangeToDays(range)}日 AI 爬虫抓取</p>
                </div>

                {/* Known crawlers checklist */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">已知 AI 爬虫</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {KNOWN_BOTS.map((b) => {
                      const ever = aiStats.everSeen.find((e) => e.bot === b.key);
                      const inRange = aiStats.byBot.find((e) => e.bot === b.key);
                      return (
                        <div key={b.key} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                          <span className={`text-sm ${ever ? 'text-black font-medium' : 'text-gray-400'}`}>
                            {b.label}
                          </span>
                          {ever ? (
                            <span className="text-xs text-gray-500 ml-2 text-right">
                              首次 {ever.firstSeen.slice(0, 10)}
                              {inRange && inRange.count > 0 ? ` · 本期 ${inRange.count}` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 ml-2">尚未抓取</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top crawled paths */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">抓取最多的页面 TOP 5</h3>
                  {aiStats.topPaths.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3 text-center">暂无数据</p>
                  ) : (
                    <div className="space-y-2">
                      {aiStats.topPaths.map((p, i) => (
                        <div key={p.path} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                            <span className="text-sm font-medium text-gray-800 truncate">{p.path}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800 ml-2">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {aiStats.botHitsInRange === 0 && (
                  <p className="text-sm text-gray-400 text-center">
                    暂无 AI 爬虫抓取记录。数据从本次部署起开始累积，不做历史回填。
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Minimal SVG bar chart (no external chart lib).
// Bars live in a 1000-unit virtual space stretched to the card width, so the
// chart always fills the container; x-axis labels are plain HTML text so they
// stay crisp and never overlap.
function DailyChart({ data }: { data: { date: string; blogViews: number; productViews: number; addToCart: number; orders: number }[] }) {
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.blogViews, d.productViews, d.addToCart, d.orders)));
  const H = 200;
  const PAD_TOP = 16;
  const PLOT_H = H - PAD_TOP;
  const slotW = 1000 / Math.max(1, data.length);   // virtual units per day
  const groupW = slotW * 0.6;                      // width of the 4-bar group
  const barW = groupW / 4 - 1;
  const series: { key: 'blogViews' | 'productViews' | 'addToCart' | 'orders'; color: string; label: string }[] = [
    { key: 'blogViews', color: '#0f172a', label: '博客 PV' },
    { key: 'productViews', color: '#3b82f6', label: '商品 PV' },
    { key: 'addToCart', color: '#f59e0b', label: '加购' },
    { key: 'orders', color: '#ef4444', label: '下单' },
  ];
  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 1000 ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        className="block"
      >
        {data.map((d, i) => {
          const groupX = i * slotW + (slotW - groupW) / 2;
          return (
            <g key={d.date}>
              {series.map((s, j) => {
                const v = d[s.key];
                const h = (v / maxVal) * PLOT_H;
                return (
                  <rect
                    key={s.key}
                    x={groupX + j * (barW + 1)}
                    y={H - h}
                    width={Math.max(1, barW)}
                    height={Math.max(0, h)}
                    fill={s.color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="flex w-full mt-1">
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center text-[10px] text-gray-400 truncate">
            {d.date.slice(5)}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-xs">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 inline-block" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
