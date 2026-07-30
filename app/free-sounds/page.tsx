'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FreeSoundCarousel from '@/components/FreeSoundCarousel';
import { Volume2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/free-sounds?page=1&limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort by created_at descending (newest first) and take max 6
          const sortedSounds = [...data.data].sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          setSounds(sortedSounds.slice(0, 6));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch sounds:', error);
        setLoading(false);
      });
  }, []);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <Volume2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <FreeSoundCarousel sounds={sounds} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
