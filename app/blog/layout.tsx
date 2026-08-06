import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Discover | Chengdu Voice - Chengdu Culture, Stories & Insights',
  description: 'Explore Chengdu\'s rich culture, history, and way of life through our curated collection of articles. From traditional teahouses to modern Sichuan.',
  keywords: ['Chengdu culture', '成都文化', 'Sichuan stories', 'Chinese history', 'teahouse', 'Chengdu lifestyle'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Discover | Chengdu Voice',
    description: 'Explore Chengdu\'s rich culture, history, and way of life.',
    url: `${siteUrl}/blog`,
    siteName: 'Chengdu Voice',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover | Chengdu Voice',
    description: 'Explore Chengdu\'s rich culture, history, and way of life.',
    images: ['/og-image.jpg'],
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
