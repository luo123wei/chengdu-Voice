import type { Metadata } from 'next'
import { db } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const blog = await db.blogs.getBySlug(slug)

  if (!blog) {
    return {
      title: 'Story Not Found · 故事不存在',
    }
  }

  return {
    title: blog.titleEn,
    description: blog.contentEn?.replace(/<[^>]*>/g, '').slice(0, 160) || blog.titleEn,
    keywords: [blog.category, 'Chengdu', '成都', 'culture', 'story'],
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.titleEn,
      description: blog.contentEn?.replace(/<[^>]*>/g, '').slice(0, 160) || blog.titleEn,
      url: `${siteUrl}/blog/${blog.slug}`,
      type: 'article',
      publishedTime: blog.publishDate,
      images: blog.images?.[0] ? [{ url: blog.images[0] }] : [{ url: '/og-image.jpg' }],
      siteName: 'Chengdu Craft Studio',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.titleEn,
      description: blog.contentEn?.replace(/<[^>]*>/g, '').slice(0, 160) || blog.titleEn,
      images: blog.images?.[0] ? [blog.images[0]] : ['/og-image.jpg'],
    },
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
