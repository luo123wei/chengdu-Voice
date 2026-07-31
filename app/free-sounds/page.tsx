'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, X, ChevronRight, Music } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  culturalStory?: string;
  created_at?: string;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default function FreeSoundsPage() {
  const [sounds, setSounds] = useState<FreeSound[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSound, setSelectedSound] = useState<FreeSound | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const limit = 6;
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      audio.addEventListener('loadedmetadata', () => {
        if (selectedSound?.id === id) {
          setDuration(audio.duration);
        }
      });
      audio.addEventListener('timeupdate', () => {
        if (selectedSound?.id === id) {
          setProgress(audio.currentTime);
        }
      });
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setProgress(0);
      });
      audioRefs.current[id] = audio;
    }
    return audioRefs.current[id];
  }, [selectedSound]);

  const togglePlay = useCallback((id: string) => {
    const sound = sounds.find((s) => s.id === id);
    if (!sound) return;

    const audio = createAudio(id, sound.audio);
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
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

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSound) return;
    const audio = audioRefs.current[selectedSound.id];
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setProgress(newTime);
  }, [selectedSound, duration]);

  const openDetail = (sound: FreeSound) => {
    setSelectedSound(sound);
    setProgress(0);
    setDuration(0);
    setTimeout(() => {
      const audio = audioRefs.current[sound.id];
      if (audio) {
        setDuration(audio.duration);
        setProgress(audio.currentTime);
      }
    }, 100);
  };

  const closeDetail = () => {
    setSelectedSound(null);
    setProgress(0);
    setDuration(0);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
                {sounds.map((sound) => {
                  const isPlaying = playingId === sound.id;
                  const plainText = stripHtml(sound.description);
                  const truncatedDesc = truncateText(plainText, 50);
                  return (
                    <div
                      key={sound.id}
                      className="bg-secondary/5 rounded-xl p-5 flex items-center gap-5 hover:bg-secondary/10 transition-colors"
                    >
                      <button
                        onClick={() => togglePlay(sound.id)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isPlaying
                            ? 'bg-primary scale-105'
                            : 'bg-primary/80 hover:bg-primary hover:scale-105'
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-secondary text-xl mb-1 truncate">{sound.titleEn}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {truncatedDesc}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>·</span>
                          <span>{sound.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openDetail(sound)}
                        className="flex items-center gap-1 px-4 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <span>More</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
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

      {/* Explore Links */}
      <section className="py-12 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/blog"
              className="group flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-secondary text-lg">Explore More Chengdu Culture</h3>
                <p className="text-sm text-primary flex items-center gap-1 mt-1">
                  Discover
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </a>
            <a
              href="/shop"
              className="group flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌶️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-secondary text-lg">Taste Chengdu</h3>
                <p className="text-sm text-primary flex items-center gap-1 mt-1">
                  Hanyuan Sichuan Pepper
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedSound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDetail}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-secondary">{selectedSound.titleEn}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>{selectedSound.duration}</span>
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Player with progress bar */}
              <div className="flex flex-col items-center mb-8">
                <button
                  onClick={() => togglePlay(selectedSound.id)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all mb-6 ${
                    playingId === selectedSound.id
                      ? 'bg-primary scale-105'
                      : 'bg-primary/80 hover:bg-primary hover:scale-105'
                  }`}
                >
                  {playingId === selectedSound.id ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white ml-1" />
                  )}
                </button>

                {/* Progress Bar */}
                <div className="w-full flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono w-12 text-right">
                    {formatTime(progress)}
                  </span>
                  <div
                    className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-primary rounded-full relative"
                      style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono w-12">
                    {selectedSound.duration}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <div
                  className="about-content"
                  dangerouslySetInnerHTML={{ __html: selectedSound.description }}
                />
              </div>

              {/* Dashed Divider */}
              {selectedSound.culturalStory && selectedSound.culturalStory !== '<p></p>' && selectedSound.culturalStory !== '' && (
                <>
                  <div className="border-t border-dashed border-gray-300 my-8"></div>
                  
                  {/* Cultural Story */}
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <div
                      className="about-content"
                      dangerouslySetInnerHTML={{ __html: selectedSound.culturalStory }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}