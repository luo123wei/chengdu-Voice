import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'

export const metadata: Metadata = {
  title: 'Chengdu Gifts & Souvenirs',
  description: "Voice Culture creates small-batch objects inspired by Chengdu's culture, everyday life and visual language. From panda-inspired objects to Chengdu postcards and tea culture gifts, each piece is designed to offer a different way to remember the city.",
  keywords: ['Chengdu gifts', 'Chengdu souvenirs', 'panda gifts', 'Chengdu cultural products', 'Chengdu postcards', 'tea culture gifts', 'Voice Culture'],
  openGraph: {
    title: 'Chengdu Gifts & Souvenirs | Voice Culture',
    description: "Small-batch objects inspired by Chengdu's culture, everyday life and visual language.",
    url: `${siteUrl}/shop`,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
