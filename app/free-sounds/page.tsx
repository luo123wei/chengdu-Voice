'use client';

import { useState, useEffect } from 'react';
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

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

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
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                  >
                    {playingId === sound.id ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-bold text-secondary text-lg">{sound.title}</h3>
                    <p className="text-sm text-gray-500">{sound.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
              想要更多成都声音？
            </h3>
            <p className="text-gray-600 mb-6">
              订阅我们的邮件，免费获取完整的《成都声音地图》白噪音专辑
            </p>
            
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">订阅成功！请查收邮件获取下载链接</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱地址"
                  className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '发送中...' : '免费获取'}
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
