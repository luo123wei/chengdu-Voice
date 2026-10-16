import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categoryLabels } from '@/data/mockData';
import { trackEvent } from '@/lib/analytics';
import { getVideoEmbed, getYouTubeId } from '@/lib/videoEmbed';

export const dynamic = 'force-dynamic';

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url || '', key || '');
}

async function getBlogBySlug(slug: string): Promise<any | null> {
  const supabase = makeSupabase();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[BlogDetail] query error:', error);
    return null;
  }
  // Respect schedule: future posts are invisible even via direct URL
  if (data && data.scheduled_at && new Date(data.scheduled_at) > new Date()) {
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return { title: 'Post Not Found' };
  }

  const textOnly = (blog.content_en || blog.contentEn || blog.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const desc = textOnly.slice(0, 160) || blog.title_en || blog.titleEn || blog.title;

  return {
    title: blog.title_en || blog.titleEn || blog.title,
    description: desc,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-secondary mb-4">Post Not Found</h1>
            <Link href="/blog" className="text-primary hover:underline">
              Return to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const supabase = makeSupabase();
  const { data: products } = await supabase
    .from('products')
    .select('*');
  const relatedProducts = products || [];
  const filteredProducts = relatedProducts
    .filter((p: any) => p.status !== 'design')
    .slice(0, 2);

  const catLabel = categoryLabels[post.category as keyof typeof categoryLabels]?.en || post.category || 'Culture';

  // Normalize raw Supabase snake_case fields (with camelCase fallbacks)
  const title = post.title_en || post.titleEn || post.title || '';
  const publishDate = post.publish_date || post.publishDate;
  const contentHtml = post.content_en || post.contentEn || post.content || '';

  // Track blog view for analytics (fire-and-forget, never blocks render)
  void trackEvent('blog_view', slug, null);

  // JSON-LD structured data for AI/search engines
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
  const postUrl = `${siteUrl}/blog/${slug}`;
  const textOnly = contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstImage = post.images?.[0];
  const imageUrl = firstImage
    ? (firstImage.startsWith('http') ? firstImage : `${siteUrl}${firstImage}`)
    : `${siteUrl}/og-image.jpg`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: textOnly.slice(0, 160),
    image: imageUrl,
    datePublished: publishDate,
    dateModified: publishDate,
    author: { '@type': 'Person', name: post.author || 'Chengdu-Voice' },
    publisher: {
      '@type': 'Organization',
      name: 'Voice Culture',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.jpg` },
    },
    mainEntityOfPage: postUrl,
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Stories', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: postUrl },
    ],
  };

  // Video: a hand-shot clip hosted on YouTube / Bilibili, or an uploaded file.
  // getVideoEmbed() returns null for anything we cannot play, so the section
  // simply disappears when the field is empty or unsupported.
  const videoUrl = post.video || '';
  const videoEmbed = getVideoEmbed(videoUrl);
  const youtubeId = getYouTubeId(videoUrl);
  const videoJsonLd = videoEmbed && {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: textOnly.slice(0, 200),
    // maxresdefault is not guaranteed to exist for every upload, but YouTube
    // serves a fallback, so this is the safest thumbnail to reference.
    thumbnailUrl: youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg` : imageUrl,
    uploadDate: publishDate,
    contentUrl: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : videoUrl,
    embedUrl: videoEmbed.type === 'iframe' ? videoEmbed.src : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Voice Culture',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/og-image.jpg` },
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      <Header />

      <section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
          >
            ← Back to Discover
          </Link>

          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
            {catLabel}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            {publishDate && (
              <span>{String(publishDate).split('T')[0]}</span>
            )}
            {post.author && <span>{post.author}</span>}
          </div>
        </div>
      </section>

      {post.images && post.images[0] && (
        <section className="pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-xl overflow-hidden mb-8">
              <img
                src={post.images[0]}
                alt={title}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {videoEmbed && (
        <section className="pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              {videoEmbed.type === 'iframe' ? (
                <iframe
                  src={videoEmbed.src}
                  title={`${title} — video`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <video
                  src={videoEmbed.src}
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>
          </div>
        </section>
      )}

      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: contentHtml as string,
            }}
          />
        </div>
      </section>

      {filteredProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
              Pieces You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all"
                >
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-secondary">{product.name}</h3>
                    <p className="text-primary font-bold">${product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
