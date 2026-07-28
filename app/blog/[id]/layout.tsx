import type { Metadata } from 'next'
import { db } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const blog = await db.blogs.getById(id)
  
  if (!blog) {
    return {
      title: 'Blog Not Found | Chengdu Voice',
    }
  }

  return {
    title: `${blog.titleEn} | Chengdu Voice`,
    description: blog.contentEn?.slice(0, 160) || blog.titleEn,
    keywords: [blog.category, 'Chengdu', '成都', 'culture', 'story'],
    alternates: {
      canonical: `/blog/${id}`,
    },
    openGraph: {
      title: blog.titleEn,
      description: blog.contentEn?.slice(0, 160) || blog.titleEn,
      url: `${siteUrl}/blog/${id}`,
      type: 'article',
      publishedTime: blog.publishDate,
      images: blog.images?.[0] ? [{ url: blog.images[0] }] : [{ url: '/og-image.jpg' }],
      siteName: 'Chengdu Voice',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.titleEn,
      description: blog.contentEn?.slice(0, 160) || blog.titleEn,
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
