import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'

export const metadata: Metadata = {
  title: 'About — Voice Culture',
  description: 'Voice Culture is a small design studio in Chengdu, turning everyday memories of the city into small-batch objects you can hold.',
  alternates: { canonical: `${siteUrl}/about` },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
