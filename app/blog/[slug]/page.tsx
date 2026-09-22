import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { categoryLabels } from '@/data/mockData';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const blog = await db.blogs.getBySlug(slug);

  if (!blog) {
    return { title: 'Post Not Found' };
  }

  // Strip HTML tags from content for description
  const textOnly = (blog.contentEn || blog.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const desc = textOnly.slice(0, 160) || blog.titleEn || blog.title;

  return {
    title: blog.titleEn || blog.title,
    description: desc,
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const post = await db.blogs.getBySlug(slug);

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

  const relatedProducts = await db.products.getAll();
  const filteredProducts = relatedProducts
    .filter((p: any) => p.status !== 'design')
    .slice(0, 2);

  const catLabel = categoryLabels[post.category]?.en || post.category || 'Culture';

  return (
    <div className="min-h-screen">
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
            {post.titleEn}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            {post.publishDate && (
              <span>{post.publishDate.split('T')[0]}</span>
            )}
            {post.views != null && (
              <span>{post.views.toLocaleString()} views</span>
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
                alt={post.titleEn}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: (post.contentEn || post.content || '') as string,
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
