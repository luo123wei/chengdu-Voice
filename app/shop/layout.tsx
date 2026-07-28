import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com'

export const metadata: Metadata = {
  title: 'Taste | Chengdu Voice - Authentic Sichuan Products & Flavors',
  description: 'Bring authentic Chengdu flavors home. Premium Sichuan pepper, traditional teas, and cultural crafts sourced directly from local producers.',
  keywords: ['Sichuan pepper', '四川花椒', 'tea', '茶叶', 'Chengdu products', 'buy Chengdu', 'authentic Chinese', 'traditional Sichuan'],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Taste | Chengdu Voice',
    description: 'Bring authentic Chengdu flavors home. Premium Sichuan pepper, traditional teas.',
    url: `${siteUrl}/shop`,
    siteName: 'Chengdu Voice',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taste | Chengdu Voice',
    description: 'Bring authentic Chengdu flavors home.',
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
