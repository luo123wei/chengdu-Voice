'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
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
  created_at?: string;
}

export default function FreeSoundsPage() {
  const [sounds, setSounds] = useState<FreeSound[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 6;
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    fetch(`/api/free-sounds?page=${currentPage}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort by created_at descending (newest first)
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
        if (playingId === id) {
          setPlayingId(null);
        }
      });
      audioRefs.current[id] = audio;
    }
    return audioRefs.current[id];
  }, [playingId]);

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
      // Pause all other audios
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
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Free Chengdu Sounds
            <br />
            <span className="text-cream">Experience China Through Your Ears</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Listen to authentic Chengdu sounds - from traditional teahouses to rain-soaked streets. Experience the soul of Chengdu through your ears.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Volume2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => togglePlay(sound.id)}
                        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors flex-shrink-0"
                      >
                        {playingId === sound.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-secondary text-lg">{sound.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{sound.titleEn}</p>
                        
                        {sound.location && (
                          <div className="flex items-center gap-2 text-sm text-primary mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{sound.location}</span>
                          </div>
                        )}
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: sound.description }}></p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{sound.duration}</span>
                          <button
                            onClick={() => togglePlay(sound.id)}
                            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all text-sm"
                          >
                            <Volume2 className="w-4 h-4" />
                            {playingId === sound.id ? 'Pause' : 'Listen'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sounds.length === 0 && (
                <div className="text-center py-12 bg-cream rounded-xl">
                  <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无声音内容</p>
                </div>
              )}
              
              {total > limit && (
                <div className="flex items-center justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
