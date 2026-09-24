'use client';
import { useState, useEffect, useMemo } from 'react';
import { FileText, ShoppingBag, TrendingUp, Users, Package, Eye, ShoppingCart, DollarSign, Percent, ThumbsUp, BellRing } from 'lucide-react';
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
  votingTop: { slug: string; name: string; votes: number }[];
  votesInPeriod: number;
  votesInPrev: number;
  preordersInPeriod: number;
  preordersInPrev: number;
  preorderTop: { slug: string; name: string; count: number }[];
};

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/stats?range=${range}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setLoading(false));
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
                  {stats.votingTop.map((v, i) => (
                    <div key={v.slug} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
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
                      <span className="text-sm font-bold text-gray-800 ml-2">{v.votes} 票</span>
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
        </>
      )}
    </div>
  );
}

// Minimal SVG bar chart (no external chart lib)
function DailyChart({ data }: { data: { date: string; blogViews: number; productViews: number; addToCart: number; orders: number }[] }) {
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.blogViews, d.productViews, d.addToCart, d.orders)));
  const W = Math.min(900, data.length * 22);
  const H = 200;
  const barW = 5;
  const gap = 22;
  const series: { key: 'blogViews' | 'productViews' | 'addToCart' | 'orders'; color: string; label: string }[] = [
    { key: 'blogViews', color: '#0f172a', label: '博客 PV' },
    { key: 'productViews', color: '#3b82f6', label: '商品 PV' },
    { key: 'addToCart', color: '#f59e0b', label: '加购' },
    { key: 'orders', color: '#ef4444', label: '下单' },
  ];
  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} className="block">
        {data.map((d, i) => {
          const x = i * gap + 2;
          return (
            <g key={d.date}>
              {series.map((s, j) => {
                const v = d[s.key];
                const h = (v / maxVal) * (H - 30);
                const y = H - 20 - h;
                return (
                  <rect
                    key={s.key}
                    x={x + j * (barW + 1)}
                    y={y}
                    width={barW}
                    height={Math.max(0, h)}
                    fill={s.color}
                  />
                );
              })}
              {(i % Math.ceil(data.length / 8) === 0) && (
                <text x={x} y={H - 4} fontSize="9" fill="#9ca3af">{d.date.slice(5)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-3 text-xs">
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
