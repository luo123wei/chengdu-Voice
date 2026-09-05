'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/data/mockData';
import { getVisitorId } from '@/lib/visitorId';
import { getPreorderState, formatDate, countdown } from '@/lib/productStatus';

/* ================= 投票按钮 ================= */
export function VoteButton({ productId, initialVotes = 0, size = 'card' }: {
  productId: string;
  initialVotes?: number;
  size?: 'card' | 'detail';
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const vid = getVisitorId();
        const res = await fetch(`/api/intents?productId=${productId}&visitorId=${vid}&type=vote`);
        const data = await res.json();
        if (!mounted) return;
        setVotes(data.votes ?? initialVotes);
        setVoted(!!data.hasVoted);
      } catch {
        // 静默失败,保留初始票数
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  const handleVote = async () => {
    if (voted) return;
    setVoted(true);
    setVotes(v => v + 1); // 乐观更新
    try {
      const res = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, visitorId: getVisitorId(), type: 'vote' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (typeof data.votes === 'number') setVotes(data.votes);
      if (!data.counted) setVoted(true); // 已投过
    } catch {
      setVoted(false);
      setVotes(v => Math.max(0, v - 1));
      alert('投票失败,请稍后重试');
    }
  };

  const big = size === 'detail';

  return (
    <div className={big ? '' : 'w-full'}>
      {big && (
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-4xl font-bold text-black">{votes}</span>
          <span className="text-sm text-gray-500">人想要</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        {!big && (
          <span className="text-sm text-gray-500">
            <b className="font-serif text-lg text-black">{votes}</b> 人想要
          </span>
        )}
        <button
          onClick={handleVote}
          disabled={voted || loading}
          className={`${big ? 'w-full py-4 text-base' : 'px-4 py-2 text-sm'} font-medium border border-black transition-all ${
            voted
              ? 'bg-cream text-gray-400 border-gray-200 cursor-default'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {voted ? '✓ 已想拥有' : '🤍 我想要它'}
        </button>
      </div>
      {big && (
        <p className="text-xs text-gray-400 text-center mt-3">
          无需付费 · 开票预售时邮件提醒 · 每人每款限投一票
        </p>
      )}
    </div>
  );
}

/* ================= 预售块(按钮 + 邮箱登记 + 时间信息) ================= */
export function PreorderBlock({ product }: { product: Product }) {
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 每分钟刷新倒计时
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const state = getPreorderState(product, now);

  const submit = async () => {
    setError('');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('邮箱格式不正确');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          visitorId: getVisitorId(),
          type: 'preorder',
          email: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || '提交失败,请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {state === 'open' && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="w-full px-4 py-2 text-sm font-medium bg-black text-white border border-black hover:bg-gray-800 transition-all"
          >
            {open ? '收起' : `预订意向 · 剩${countdown(product.preorderEnd, now)}`}
          </button>

          {open && !submitted && (
            <div className="mt-2 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="留邮箱,开售优先通知(可选)"
                className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-black"
              />
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? '提交中…' : '提交预订意向'}
              </button>
              {error && <span className="text-xs text-accent">{error}</span>}
              <span className="text-xs text-gray-400">无需付费 · 可留空直接提交</span>
            </div>
          )}
          {open && submitted && (
            <div className="mt-2 text-sm text-center py-1.5 border border-black">
              ✓ 已登记,开售时邮件通知你
            </div>
          )}

          <PreorderMeta product={product} state={state} now={now} />
        </>
      )}

      {state === 'waiting' && (
        <>
          <button disabled className="w-full px-4 py-2 text-sm font-medium bg-cream text-gray-400 border border-gray-200 cursor-default">
            预售已截止
          </button>
          <PreorderMeta product={product} state={state} now={now} />
        </>
      )}

      {state === 'onsale' && (
        <div className="text-sm text-gray-500 border-t border-gray-100 pt-2 mt-2">
          已开售,可直接下单
        </div>
      )}
    </div>
  );
}

function PreorderMeta({ product, state, now }: { product: Product; state: string; now: number }) {
  return (
    <div className="border-t border-gray-100 mt-3 pt-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>预售截止</span>
        <span>
          <b className="text-gray-900 font-medium">{formatDate(product.preorderEnd)}</b>
          {state === 'open' && <em className="not-italic text-accent ml-1.5">剩{countdown(product.preorderEnd, now)}</em>}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>正式开售</span>
        <span>
          <b className="text-gray-900 font-medium">{formatDate(product.onSaleAt)}</b>
          {state === 'waiting' && <em className="not-italic text-accent ml-1.5">{countdown(product.onSaleAt, now)}</em>}
        </span>
      </div>
    </div>
  );
}
