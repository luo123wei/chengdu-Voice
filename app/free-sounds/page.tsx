'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, X, ChevronRight, ChevronLeft, Check, Volume2, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ITEMS_PER_PAGE = 12;

interface DbSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  culturalStory?: string;
  createdAt?: string;
}

export default function FreeSoundsPage() {
  const [sounds, setSounds] = useState<DbSound[]>([]);
  const [selected, setSelected] = useState<DbSound | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 拉取后台「声音管理」发布的实录音频（API 按 created_at 倒序返回）
  useEffect(() => {
    fetch('/api/free-sounds?limit=100&page=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setSounds(data.data);
      })
      .catch((err) => console.error('Failed to load sounds:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(sounds.length / ITEMS_PER_PAGE);
  const pageItems = sounds.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudioPlayingId(null);
  }, []);

  const toggleAudio = useCallback((item: DbSound) => {
    if (audioPlayingId === item.id) {
      stopAudio();
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(item.audio);
    a.loop = true;
    audioRef.current = a;
    a.play().catch(() => setAudioPlayingId(null));
    setAudioPlayingId(item.id);
  }, [audioPlayingId, stopAudio]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    stopAudio();
    setCurrentPage(page);
  };

  // 关闭弹层时停止播放
  useEffect(() => {
    if (!selected) stopAudio();
  }, [selected, stopAudio]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubscribed(true);
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasStory = (item: DbSound) =>
    !!(item.description?.replace(/<[^>]*>/g, '').trim() || item.culturalStory?.replace(/<[^>]*>/g, '').trim());

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ===== Hero(黑) ===== */}
      <section className="bg-black text-white pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.35em] text-gray-400 mb-6">FREE SOUNDSCAPES</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-5">
            Free Chengdu Sounds
            <span className="block text-2xl md:text-3xl font-normal text-gray-300 mt-3">Soundscapes from Chengdu</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            Sounds recorded on the streets of Chengdu — teahouses, rainy nights, bamboo groves, night markets.
            For sleep, focus, or simply missing the city. Headphones on.
          </p>
          <p className="text-gray-500 text-sm">
            Ambient Chengdu soundscapes for sleep, focus and nostalgia.
          </p>
          <p className="mt-6 inline-block text-[11px] tracking-wider text-gray-500 border border-gray-700 px-3 py-1.5">
            FIELD RECORDINGS · NO ADS · FREE FOREVER
          </p>
        </div>
      </section>

      {/* ===== 声音列表 ===== */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-20">
                <Volume2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Sounds are being curated — check back soon.</p>
              </div>
            ) : (
              pageItems.map((item, i) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
                const isPlaying = audioPlayingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border p-5 flex items-center gap-5 transition-colors ${
                      isPlaying ? 'border-black bg-[#FAFAFA]' : 'border-[#EEEEEE] hover:border-black/40'
                    }`}
                  >
                    <button
                      onClick={() => toggleAudio(item)}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isPlaying ? 'bg-black scale-105' : 'bg-black hover:bg-[#B54A32]'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xs text-gray-400 font-mono">{String(globalIndex + 1).padStart(2, '0')}</span>
                        <h3 className="font-serif font-bold text-lg text-black">{item.title}</h3>
                        {item.titleEn && item.titleEn !== item.title && (
                          <h4 className="text-sm text-gray-500">{item.titleEn}</h4>
                        )}
                      </div>
                      {item.duration && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {item.duration}
                          <span className="text-gray-300">·</span>
                          <span>Field recording</span>
                        </p>
                      )}
                      {isPlaying && (
                        <div className="flex items-end gap-[3px] h-4 mt-2">
                          {[0, 1, 2, 3, 4].map(b => (
                            <span
                              key={b}
                              className="w-[3px] bg-black animate-[eq_0.9s_ease-in-out_infinite]"
                              style={{ height: `${40 + ((b * 17) % 60)}%`, animationDelay: `${b * 0.12}s` }}
                            />
                          ))}
                          <span className="text-[11px] text-gray-400 ml-2">Now playing · ∞ loop</span>
                        </div>
                      )}
                    </div>

                    {hasStory(item) && (
                      <button
                        onClick={() => setSelected(item)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white border border-black transition-colors flex-shrink-0"
                      >
                        Story
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-[#EEEEEE] text-sm hover:border-black/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'border border-[#EEEEEE] text-gray-600 hover:border-black/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 border border-[#EEEEEE] text-sm hover:border-black/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 专辑邮箱领取(黑) ===== */}
      <section className="bg-black text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Volume2 className="w-8 h-8 mx-auto mb-5 stroke-[1.25]" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">
            "The Sound Map of Chengdu" — full album · coming soon
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            We&apos;re recording a real sound album on the streets of Chengdu — teahouses, markets,
            cicadas and mahjong tiles. Leave your email and we&apos;ll send it to you the day it drops.
            You&apos;ll also get voting and pre-order updates, and help decide what we make next.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <Check className="w-5 h-5" />
              <span className="font-medium">Registered. We&apos;ll write to you the day the album is ready.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/20 px-4 focus-within:border-white">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent py-3 text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-white text-black font-medium hover:bg-[#B54A32] hover:text-white transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : 'Sign up free'}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-600 mt-4">No ads. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ===== 软桥接:去工作室逛逛 ===== */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#EEEEEE]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-3">FROM EARS TO DESK</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-4">
            Listen to Chengdu — take its everyday life home
          </h2>
          <p className="text-gray-600 mb-8">
            We turned these sound memories into small desk objects — you vote on what we make next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop?tab=design" className="px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-[#B54A32] transition-colors">
              Vote on the next piece
            </Link>
            <Link href="/shop" className="px-8 py-3 border border-black text-black text-sm tracking-widest hover:bg-black hover:text-white transition-colors">
              Shop in-stock works
            </Link>
            <Link href="/blog" className="px-8 py-3 text-black text-sm tracking-widest underline underline-offset-4 hover:text-[#B54A32] transition-colors">
              Design stories
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 详情弹层 ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-[#EEEEEE] sticky top-0 bg-white">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">{selected.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selected.titleEn} · {selected.duration} · Field recording
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <button
                onClick={() => toggleAudio(selected)}
                className={`w-full py-4 flex items-center justify-center gap-3 text-sm tracking-widest font-medium transition-colors mb-6 ${
                  audioPlayingId === selected.id
                    ? 'bg-[#B54A32] text-white'
                    : 'bg-black text-white hover:bg-[#B54A32]'
                }`}
              >
                {audioPlayingId === selected.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {audioPlayingId === selected.id ? 'Pause' : 'Play recording'}
                <span className="text-xs opacity-70">∞ loop</span>
              </button>

              <div className="space-y-5">
                {selected.description?.replace(/<[^>]*>/g, '').trim() && (
                  <div
                    className="text-gray-800 leading-relaxed [&_p]:mt-2"
                    dangerouslySetInnerHTML={{ __html: selected.description }}
                  />
                )}

                {selected.culturalStory?.replace(/<[^>]*>/g, '').trim() && (
                  <>
                    <div className="border-t border-dashed border-[#DDDDDD]" />
                    <div>
                      <p className="text-xs tracking-[0.25em] text-gray-400 mb-2">Sound notes</p>
                      <div
                        className="text-gray-700 leading-relaxed [&_p]:mt-2"
                        dangerouslySetInnerHTML={{ __html: selected.culturalStory }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
