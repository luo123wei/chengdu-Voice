'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
}

export default function FreeSoundsPage() {
  const [sounds, setSounds] = useState<FreeSound[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    fetch('/api/free-sounds')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSounds(data.data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch sounds:', error);
      });
  }, []);

  const createAudio = useCallback((id: string, audioUrl: string) => {
    if (!audioRefs.current[id]) {
      const audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      audio.addEventListener('ended', () => {
        if (playingId === id) {
          setPlayingId(null);
        }
      });
      audio.addEventListener('error', (e) => {
        console.error(`Audio error for ${id}:`, e);
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

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Free Sounds
            <br />
            <span className="text-cream">免费声音</span>
          </h1>
          <p className="text-white/80 text-lg">
            聆听成都的声音，感受这座城市的脉搏
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {sounds.map((sound) => (
              <div
                key={sound.id}
                className="bg-cream rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
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
                  <div className="min-w-0">
                    <h3 className="font-bold text-secondary text-lg truncate">{sound.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: sound.description }}></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">{sound.duration}</span>
                  <Volume2 className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}

            {sounds.length === 0 && (
              <div className="text-center py-12 bg-cream rounded-xl">
                <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无声音内容</p>
              </div>
            )}
          </div>

          <div className="mt-12 bg-secondary/10 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif font-bold text-secondary mb-4">
              Want more sounds of Chengdu?
            </h3>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter and get the full Chengdu Sound Map white noise album.
            </p>
            
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Subscribed! Check your email for the download link</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'For free'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
