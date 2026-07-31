'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, MapPin, X, ChevronRight, Volume2, Clock, Headphones } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  location?: string;
  culturalStory?: string;
  created_at?: string;
}

export default function FreeSoundsPage() {
  const [sounds, setSounds] = useState<FreeSound[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSound, setSelectedSound] = useState<FreeSound | null>(null);
  const limit = 6;
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    fetch(`/api/free-sounds?page=${currentPage}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const sortedSounds = [...data.data].sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          setSounds(sortedSounds);
          setTotal(data.total || 0);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch sounds:', error);
        setLoading(false);
      });
  }, [currentPage, limit]);

  const createAudio = useCallback((id: string, audioUrl: string) => {
    if (!audioRefs.current[id]) {
      const audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      audio.addEventListener('ended', () => {
        setPlayingId(null);
      });
      audioRefs.current[id] = audio;
    }
    return audioRefs.current[id];
  }, []);

  const togglePlay = useCallback((id: string) => {
    const sound = sounds.find((s) => s.id === id);
    if (!sound) return;

    const audio = createAudio(id, sound.audio);
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingId(null);
    } else {
      Object.values(audioRefs.current).forEach((a) => {
        if (a) {
          a.pause();
          a.currentTime = 0;
        }
      });
      audio.play().catch((error) => {
        console.error('播放失败:', error);
      });
      setPlayingId(id);
    }
  }, [sounds, playingId, createAudio]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Hero Section - 沉浸式氛围 */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary-dark to-ink"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #C59B6D 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 40%)'
        }}></div>

        {/* 声波装饰 */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-20 h-32">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full"
              style={{
                height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 40}%`,
                animation: `soundwave ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-6">
            <Headphones className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Listen & Discover</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Free Chengdu
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold">Sounds</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Close your eyes. Listen to the authentic sounds of Chengdu —
            from ancient teahouses to rain-soaked alleys. Experience the soul of the city through your ears.
          </p>
        </div>

        <style>{`
          @keyframes soundwave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </section>

      {/* Sound List - 精致卡片设计 */}
      <section className="py-20 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-5 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sounds.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No sounds available yet</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for new content</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {sounds.map((sound, index) => {
                  const isPlaying = playingId === sound.id;
                  return (
                    <div
                      key={sound.id}
                      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                        isPlaying ? 'ring-2 ring-primary/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 p-5 md:p-6">
                        {/* 序号 + 播放按钮 */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => togglePlay(sound.id)}
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isPlaying
                                ? 'bg-gradient-to-br from-primary to-primary-dark scale-105 shadow-lg shadow-primary/30'
                                : 'bg-gradient-to-br from-secondary to-secondary-dark hover:from-primary hover:to-primary-dark hover:scale-105'
                            }`}
                          >
                            {isPlaying ? (
                              <Pause className="w-7 h-7 md:w-8 md:h-8 text-white" />
                            ) : (
                              <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-0.5" />
                            )}
                          </button>
                          <span className="absolute -top-1 -right-1 w-6 h-6 bg-cream text-secondary text-xs font-bold rounded-full flex items-center justify-center border border-primary/20">
                            {String(index + 1 + (currentPage - 1) * limit).padStart(2, '0')}
                          </span>
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-secondary text-lg md:text-xl mb-1.5 truncate">
                            {sound.titleEn}
                          </h3>
                          <div className="flex items-center gap-3 text-sm flex-wrap">
                            {sound.location && (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-medium">{sound.location}</span>
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sound.duration}</span>
                            </span>
                          </div>
                          {/* 播放时的声波动画 */}
                          {isPlaying && (
                            <div className="flex items-end gap-0.5 h-4 mt-2">
                              {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-primary/60 rounded-full"
                                  style={{
                                    height: '100%',
                                    animation: `soundwave ${0.8 + (i % 4) * 0.3}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.08}s`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* More 按钮 */}
                        <button
                          onClick={() => setSelectedSound(sound)}
                          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary border border-secondary/20 rounded-full hover:bg-secondary hover:text-white transition-all duration-300 flex-shrink-0"
                        >
                          <span className="hidden sm:inline">More</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 分页指示器 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        currentPage === i + 1
                          ? 'w-10 h-2.5 bg-primary'
                          : 'w-2.5 h-2.5 bg-secondary/20 hover:bg-secondary/40'
                      }`}
                      aria-label={`第${i + 1}页`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Explore Links - 优雅引导 */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-2">Continue Your Journey</p>
            <h2 className="text-3xl font-serif font-bold text-secondary">Explore More of Chengdu</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/blog"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark p-8 hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">Explore More Chengdu Culture</h3>
                <p className="text-gray-400 text-sm mb-4">Dive deeper into stories, traditions, and cultural insights</p>
                <span className="inline-flex items-center gap-1 text-primary font-medium text-sm">
                  Discover
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </a>
            <a
              href="/shop"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark to-primary p-8 hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌶️</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">Taste Chengdu</h3>
                <p className="text-white/80 text-sm mb-4">Experience authentic flavors with Hanyuan Sichuan Pepper</p>
                <span className="inline-flex items-center gap-1 text-white font-medium text-sm">
                  Hanyuan Sichuan Pepper
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Detail Modal - 沉浸式详情 */}
      {selectedSound && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSound(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部 - 渐变背景 */}
            <div className="relative bg-gradient-to-br from-secondary to-secondary-dark p-8">
              <button
                onClick={() => setSelectedSound(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => togglePlay(selectedSound.id)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    playingId === selectedSound.id
                      ? 'bg-gradient-to-br from-primary to-primary-dark scale-110 shadow-lg shadow-primary/40'
                      : 'bg-white/10 hover:bg-primary'
                  }`}
                >
                  {playingId === selectedSound.id ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-2xl font-bold text-white mb-2">{selectedSound.titleEn}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    {selectedSound.location && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedSound.location}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{selectedSound.duration}</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* 声波装饰 */}
              {playingId === selectedSound.id && (
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-8 opacity-30">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      style={{
                        height: '100%',
                        animation: `soundwave ${1 + (i % 3) * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 内容区 */}
            <div className="p-8 overflow-y-auto flex-1">
              {/* Description */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-primary"></div>
                  <h3 className="text-sm font-bold text-primary tracking-wider uppercase">Description</h3>
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedSound.description }}
                />
              </div>

              {/* Cultural Story */}
              {selectedSound.culturalStory && selectedSound.culturalStory !== '<p></p>' && (
                <div className="bg-cream rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-px bg-primary"></div>
                    <h3 className="text-sm font-bold text-primary tracking-wider uppercase">Cultural Story · 文化故事</h3>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedSound.culturalStory }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}