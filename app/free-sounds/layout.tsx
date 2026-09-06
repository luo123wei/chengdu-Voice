import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Free Chengdu Sounds: Teahouse Ambience & White Noise · 成都声音礼物',
  description: 'Free ambient Chengdu soundscapes — teahouse murmur, rain on old tiles, bamboo wind, morning birds, night market hum and temple bell. Stream free, for sleep & focus. 成都声音礼物:六段免费氛围音景,助眠专注。',
  keywords: ['Chengdu sounds', 'free Chengdu sounds', '成都声音', 'teahouse sounds', 'Chinese white noise', 'ambient soundscape', 'rain sounds for sleep', 'Chinese soundscape ASMR', '成都白噪音'],
  alternates: {
    canonical: '/free-sounds',
  },
  openGraph: {
    title: 'Free Chengdu Sounds · 成都声音礼物 | Chengdu Craft Studio',
    description: 'Six free ambient Chengdu soundscapes — teahouse, rain, bamboo, birds, market, temple bell. For sleep and focus.',
    url: `${siteUrl}/free-sounds`,
    siteName: 'Chengdu Craft Studio',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Chengdu Sounds · 成都声音礼物',
    description: 'Six free ambient Chengdu soundscapes for sleep & focus.',
    images: ['/og-image.jpg'],
  },
}

export default function FreeSoundsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
