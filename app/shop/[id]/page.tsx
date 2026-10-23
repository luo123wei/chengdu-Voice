import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { productCategoryLabels } from '@/data/mockData';
import ProductDetailClient from '@/components/ProductDetailClient';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await db.products.getBySlug(id) || await db.products.getById(id);
  if (!product) {
    return { title: 'Product Not Found | Voice Culture' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
  const slug = product.slug || product.id;
  const url = `${siteUrl}/shop/${slug}`;
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

  // Track product view for analytics (fire-and-forget, never blocks render)
  const _slug = product.slug || product.id;
  void trackEvent('product_view', _slug, null);

  // JSON-LD Product structured data for Google Merchant Center
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
  const slug = product.slug || product.id;
  const productUrl = `${siteUrl}/shop/${slug}`;
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

  // Breadcrumb structured data for search/AI engines
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Works', item: `${siteUrl}/shop` },
      { '@type': 'ListItem', position: 3, name: product.nameEn, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
