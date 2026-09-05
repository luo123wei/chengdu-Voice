'use client';
import { useParams } from 'next/navigation';
import { ArrowLeft, Music, Video, Calendar, Eye, ShoppingBag, Utensils, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categoryLabels } from '@/data/mockData';
import { useBlogs, useProducts } from '@/hooks/useDataStore';

export default function BlogDetailPage() {
  const params = useParams();
  const { blogs } = useBlogs();
  const { products } = useProducts();
  const post = blogs.find((p) => p.slug === params.slug);

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

  const relatedProducts = products.filter(p => p.status !== 'design').slice(0, 2);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Discover
          </Link>

          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
            {categoryLabels[post.category].en}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            {post.titleEn}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post.publishDate.split('T')[0]}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {post.views.toLocaleString()} views
            </span>
            <span>{post.author}</span>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src={post.images[0]}
              alt={post.titleEn}
              className="w-full h-80 sm:h-96 object-cover"
            />
          </div>

          {post.audio && (
            <div className="bg-cream rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-6 h-6 text-black" />
                <h3 className="font-bold text-secondary">Audio Content</h3>
              </div>
              <audio controls className="w-full">
                <source src={post.audio} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {post.video && (
            <div className="bg-cream rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Video className="w-6 h-6 text-accent" />
                <h3 className="font-bold text-secondary">Video Content</h3>
              </div>
              <div
                className="w-full rounded-lg overflow-hidden bg-black"
                style={{
                  aspectRatio: '16 / 9',
                  maxHeight: '450px',
                }}
              >
                <video
                  controls
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '450px' }}
                >
                  <source src={post.video} type="video/mp4" />
                </video>
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-600 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: post.contentEn || '<p>No content available</p>' }} />
          </div>
        </div>
      </section>

      <section className="py-12 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-serif font-bold text-secondary mb-2">Continue your Chengdu journey</h3>
          <p className="text-gray-600 mb-8">Vote on new designs and explore works made in Chengdu</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/shop?tab=design"
              className="bg-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-secondary group-hover:text-primary transition-colors">Vote for the next work</h4>
                <p className="text-sm text-gray-500">Designs in progress — decide what we make next</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </Link>
            
            {relatedProducts.length > 0 && (
              <Link
                href={`/shop/${relatedProducts[0].id}`}
                className="bg-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-all">
                  <Utensils className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary group-hover:text-primary transition-colors">Taste the original flavor</h4>
                  <p className="text-sm text-gray-500">{relatedProducts[0].nameEn}</p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-primary group-hover:translate-x-2 transition-all" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
