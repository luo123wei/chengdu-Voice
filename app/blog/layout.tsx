import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Stories · 设计故事 — 成都造物工作室',
  description: '成都造物的设计故事:一件作品从草图、投票、打样到小批量生产的全过程,以及一座城市教给我们的产品哲学。',
  keywords: ['Chengdu design stories', '设计故事', 'craft studio journal', '文创设计', 'Chengdu lifestyle', '产品设计过程'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Stories · 设计故事 | Chengdu Craft Studio',
    description: 'From sketch to vote to handmade object — stories from a small craft studio in Chengdu.',
    url: `${siteUrl}/blog`,
    siteName: 'Chengdu Craft Studio',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stories · 设计故事 | Chengdu Craft Studio',
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
