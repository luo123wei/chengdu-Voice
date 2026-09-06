import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export const metadata: Metadata = {
  title: 'Works · 作品 — 投票中、预售与在售文创',
  description: 'Chengdu Craft Studio 的文创作品:投票决定下一件做什么,预售作品限量登记,在售作品全球直邮。文具、家居、摆件与潮玩,成都设计、小批量手作。',
  keywords: ['Chengdu design', '文创', '成都文创', 'panda stationery', '熊猫周边', 'Chinese design studio', 'pre-order craft', 'handmade Chengdu'],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Works · 作品 | Chengdu Craft Studio',
    description: 'Vote on what we make next, pre-order new pieces, or shop in-stock crafts. Designed in Chengdu, shipped worldwide.',
    url: `${siteUrl}/shop`,
    siteName: 'Chengdu Craft Studio',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Works · 作品 | Chengdu Craft Studio',
    description: 'Vote, pre-order or shop — small-batch crafts designed in Chengdu.',
    images: ['/og-image.jpg'],
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
