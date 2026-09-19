import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Stories · Design Stories — Voice Culture',
  description: 'Design stories from Voice Culture: how each piece goes from sketch to vote to prototype to small-batch production, and the product philosophy a city taught us.',
  keywords: ['Chengdu design stories', '设计故事', 'craft studio journal', '文创设计', 'Chengdu lifestyle', '产品设计过程'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Stories · Design Stories | Voice Culture',
    description: 'From sketch to vote to handmade object — stories from a small craft studio in Chengdu.',
    url: `${siteUrl}/blog`,
    siteName: 'Voice Culture',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stories · Design Stories | Voice Culture',
    description: 'Stories from a small craft design studio in Chengdu.',
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
