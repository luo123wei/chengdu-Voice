import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Hear Chengdu | Chengdu Craft Studio - Listen to Authentic Chengdu',
  description: 'Free authentic Chengdu sounds - teahouses, rain streets, local markets. Experience the rhythm of Chengdu through immersive audio.',
  keywords: ['Chengdu sounds', '成都声音', 'free audio', 'teahouse sounds', 'Chinese soundscape', 'ASMR Chengdu'],
  alternates: {
    canonical: '/free-sounds',
  },
  openGraph: {
    title: 'Hear Chengdu | Chengdu Craft Studio',
    description: 'Listen to authentic Chengdu sounds - teahouses, rain streets, local markets.',
    url: `${siteUrl}/free-sounds`,
    siteName: 'Chengdu Craft Studio',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hear Chengdu | Chengdu Craft Studio',
    description: 'Listen to authentic Chengdu sounds.',
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
