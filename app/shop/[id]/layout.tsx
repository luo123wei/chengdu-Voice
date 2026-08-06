import type { Metadata } from 'next'
import { db } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voiceculture.world'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await db.products.getById(id)
  
  if (!product) {
    return {
      title: 'Product Not Found | Chengdu Voice',
    }
  }

  return {
    title: `${product.nameEn} | Chengdu Voice`,
    description: product.descriptionEn?.slice(0, 160) || `Buy authentic ${product.nameEn} from Chengdu, China. Premium quality, worldwide shipping.`,
    keywords: [product.nameEn, product.category, 'Chengdu', '成都', 'buy online', 'premium quality'],
    alternates: {
      canonical: `/shop/${id}`,
    },
    openGraph: {
      title: product.nameEn,
      description: product.descriptionEn?.slice(0, 160) || `Buy authentic ${product.nameEn} from Chengdu, China.`,
      url: `${siteUrl}/shop/${id}`,
      type: 'article',
      images: product.images?.[0] ? [{ url: product.images[0] }] : [{ url: '/og-image.jpg' }],
      siteName: 'Chengdu Voice',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.nameEn,
      description: product.descriptionEn?.slice(0, 160) || `Buy authentic ${product.nameEn} from Chengdu, China.`,
      images: product.images?.[0] ? [product.images[0]] : ['/og-image.jpg'],
    },
  }
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
