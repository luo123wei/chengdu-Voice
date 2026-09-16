import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { productCategoryLabels } from '@/data/mockData';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await db.products.getBySlug(id) || await db.products.getById(id);
  if (!product) {
    return { title: 'Product Not Found | Voice Culture' };
  }

  const slug = product.slug || product.id;
  const url = `https://www.voiceculture.world/shop/${slug}`;
  const description = (product.descriptionEn || product.nameEn).slice(0, 160);

  return {
    title: `${product.nameEn} | Voice Culture`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.nameEn,
      description,
      url,
      images: product.images?.length ? [{ url: product.images[0] }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.nameEn,
      description,
      images: product.images?.length ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.products.getBySlug(id) || await db.products.getById(id);

  if (!product) {
    notFound();
  }

  // JSON-LD Product structured data for Google Merchant Center
  const slug = product.slug || product.id;
  const productUrl = `https://www.voiceculture.world/shop/${slug}`;
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.nameEn,
    description: product.descriptionEn || product.name,
    image: product.images,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Voice Culture' },
    category: productCategoryLabels[product.category as keyof typeof productCategoryLabels]?.en || product.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: product.price,
      availability: (product.stock ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  // Aggregate rating (only if there are reviews)
  if (product.reviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
