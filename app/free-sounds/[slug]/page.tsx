import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SoundDetail {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  description: string;
  culturalStory?: string;
  duration?: string;
  audio: string;
  isPremium?: boolean;
  createdAt?: string;
}

export const revalidate = 0;

export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'}/api/free-sounds?limit=200&page=1`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return (data.data || [])
    .filter((s: SoundDetail) => s.slug)
    .map((s: SoundDetail) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sound = await getSound(slug);
  if (!sound) return { title: 'Sound Not Found — Voice Culture' };
  const desc = sound.culturalStory
    ? sound.culturalStory.replace(/<[^>]+>/g, '').slice(0, 140)
    : sound.description.replace(/<[^>]+>/g, '').slice(0, 140);
  return {
    title: `${sound.titleEn || sound.title} — Chengdu Field Recording`,
    description: desc,
    keywords: ['Chengdu sounds', 'Sichuan audio', 'field recording', sound.titleEn || ''],
    alternates: { canonical: `/free-sounds/${sound.slug}` },
  };
}

async function getSound(slug: string): Promise<SoundDetail | null> {
  try {
    const supabase = await import('@supabase/supabase-js').then((m) =>
      m.createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
    );
    const { data } = await supabase
      .from('free_sounds')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return null;
    if (data.scheduled_at && new Date(data.scheduled_at) > new Date()) return null;
    return {
      id: data.id,
      title: data.title,
      titleEn: data.title_en,
      slug: data.slug,
      description: data.description || '',
      culturalStory: data.cultural_story || '',
      duration: data.duration,
      audio: data.audio,
      isPremium: data.is_premium || false,
    };
  } catch {
    return null;
  }
}

export default async function SoundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sound = await getSound(slug);
  if (!sound) notFound();

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: sound.titleEn || sound.title,
    description: sound.culturalStory?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
    contentUrl: sound.audio,
    duration: sound.duration ? `PT${sound.duration.replace(':', 'M')}S` : undefined,
    description_en: 'Chengdu field recording — a sound from the studio',
    keywords: 'Chengdu, Sichuan, field recording, Chinese culture',
  };

  return (
    <>
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <div className="min-h-screen bg-white pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/free-sounds"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all sounds
          </Link>

          {sound.isPremium && (
            <div className="mb-6 text-xs font-medium uppercase tracking-widest text-primary">
              Chengdu Sound Library
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
            {sound.titleEn || sound.title}
          </h1>
          {sound.titleEn && sound.title !== sound.titleEn && (
            <p className="text-gray-500 text-lg mb-4">{sound.title}</p>
          )}

          {sound.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4" />
              <span>{sound.duration}</span>
              <span className="text-gray-300">·</span>
              <span>Field recording</span>
            </div>
          )}

          {/* Audio Player — or locked CTA for premium */}
          {sound.isPremium ? (
            <div className="bg-black text-white border border-gray-200 rounded-xl p-8 mb-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Part of the Chengdu Sound Library
              </h3>
              <p className="text-white/60 text-sm mb-5 max-w-md mx-auto">
                45 field recordings captured across Chengdu — teahouses, opera houses, dialect, markets.
                Unlock every track with one purchase.
              </p>
              <Link
                href="/shop/chengdu-sound-map"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get the Album — $9.99 →
              </Link>
              <p className="text-white/40 text-xs mt-4">One-time purchase · 62 tracks · MP3 320kbps · Forever yours</p>
            </div>
          ) : (
            <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-6 mb-10">
              <audio
                controls
                preload="metadata"
                className="w-full [&::-webkit-media-controls-panel]:bg-white"
                src={sound.audio}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {/* Description */}
          {sound.description && (
            <div className="prose prose-lg text-gray-700 leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: sound.description }}
            />
          )}

          {/* Cultural Story */}
          {sound.culturalStory && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="font-serif text-xl font-bold text-black mb-4">The Story Behind the Sound</h2>
              <div className="prose prose-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sound.culturalStory }}
              />
            </div>
          )}

          {/* Premium note */}
          {sound.isPremium && (
            <div className="mt-10 bg-black text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white mb-1">Part of the Chengdu Sound Library</h3>
                <p className="text-white/60 text-sm">All 45 studio-recorded tracks — $9.99 forever.</p>
              </div>
              <Link
                href="/shop/chengdu-sound-map"
                className="px-6 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Get the Album →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
