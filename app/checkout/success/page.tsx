'use client';

import { useEffect, useState } from 'react';
import { Check, Download, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PremiumSound {
  slug: string;
  title: string;
  title_en?: string;
  duration?: string;
  audio: string;
  description?: string;
}

export default function CheckoutSuccess() {
  const [sounds, setSounds] = useState<PremiumSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email') || '';
    const on = params.get('orderNumber') || '';
    setEmail(e);
    setOrderNumber(on);

    if (!e) {
      setLoading(false);
      return;
    }

    fetch(`/api/premium-sounds?email=${encodeURIComponent(e)}&orderNumber=${encodeURIComponent(on)}`, {
      headers: { 'Cache-Control': 'no-store' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.sounds)) {
          setSounds(data.sounds);
        } else {
          setError(data.error || 'Could not verify your purchase.');
        }
      })
      .catch(() => setError('Could not load downloads.'))
      .finally(() => setLoading(false));
  }, []);

  // 按 slug 前缀（01-/02-...）归类，否则平铺
  const grouped = sounds.reduce<Record<string, PremiumSound[]>>((acc, s) => {
    const m = s.slug.match(/^(\d{2})-/);
    const cat = m ? m[1] : 'xx';
    (acc[cat] ||= []).push(s);
    return acc;
  }, {});
  const labelForGroup = (key: string) => {
    const map: Record<string, string> = {
      '01': 'Sichuan Opera',
      '02': 'Dialect & Speech',
      '03': 'Teahouse & Food',
      '04': 'Daily Life & Culture',
      '05': 'Soundscapes & Urban',
    };
    return map[key] || 'All Tracks';
  };

  const totalMB = sounds.reduce((sum) => sum + 2.5, 0);

  return (
    <div className="min-h-screen bg-white pt-10 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-3">
            Thank you — your download is ready
          </h1>
          <p className="text-gray-500 text-sm">
            Order <span className="font-mono text-black">{orderNumber}</span> &middot; sent to{' '}
            <span className="text-black">{email}</span>
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Fetching your downloads...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Hmm, we couldn't find your purchase.</p>
            <p className="text-red-600/70 text-sm mb-4">
              {error} This can happen if the payment hasn't fully settled yet.
            </p>
            <p className="text-gray-500 text-sm">
              Email <a href="mailto:hello@voiceculture.world" className="text-black underline">hello@voiceculture.world</a> with your PayPal receipt and we'll fix it.
            </p>
          </div>
        )}

        {!loading && !error && sounds.length > 0 && (
          <>
            {/* Download Summary */}
            <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-5 mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <Gift className="w-4 h-4" />
                  Chengdu Sound Library
                </div>
                <p className="text-sm text-gray-500">
                  {sounds.length} tracks &middot; ~{totalMB.toFixed(0)} MB total &middot; MP3 320kbps
                </p>
              </div>
              <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">
                Tap each track to download
              </span>
            </div>

            {/* Tracks by category */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, list]) => (
                <div key={cat}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    {labelForGroup(cat)} ({list.length})
                  </h2>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                    {list.map((s) => (
                      <a
                        key={s.slug}
                        href={s.audio}
                        download={`${s.title_en || s.title}.mp3`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-black truncate">
                            {s.title_en || s.title}
                          </p>
                          {s.duration && (
                            <p className="text-xs text-gray-400 mt-0.5">{s.duration}</p>
                          )}
                        </div>
                        <Download className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm mb-5">
                Lost this page? Any future device can re-download using the link we sent to {email}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/free-sounds"
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-black/80 transition-colors text-sm"
                >
                  Browse Free Sounds →
                </Link>
                <Link
                  href="/blog"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Read the Blog
                </Link>
              </div>
            </div>
          </>
        )}

        {!loading && !error && sounds.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-800 font-medium mb-2">No downloads yet.</p>
            <p className="text-yellow-700/80 text-sm">
              Your payment might still be settling. Try refreshing in a minute. If nothing appears, email{' '}
              <a href="mailto:hello@voiceculture.world" className="underline">hello@voiceculture.world</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
