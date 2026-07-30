'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, MapPin } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Volume2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="bg-secondary/5 rounded-xl p-5 flex items-center gap-5 hover:bg-secondary/10 transition-colors"
                  >
                    <button
                      onClick={() => togglePlay(sound.id)}
                      className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        playingId === sound.id
                          ? 'bg-primary scale-105'
                          : 'bg-primary/80 hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {playingId === sound.id ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-secondary text-xl mb-1">{sound.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{sound.titleEn}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {sound.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{sound.location}</span>
                          </div>
                        )}
                        <span className="text-gray-400">·</span>
                        <span>{sound.duration}</span>
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
                  <div className="flex items-center gap-3">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`transition-all duration-300 ${
                          currentPage === i + 1
                            ? 'w-10 h-2 bg-primary rounded-full'
                            : 'w-6 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                        }`}
                        aria-label={`第${i + 1}页`}
                      />
                    ))}
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
