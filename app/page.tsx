import { ArrowRight, Star, Volume2, BookOpen, Utensils } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import BlogCarousel from '@/components/BlogCarousel';
import { db } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com'

export const metadata: Metadata = {
  title: 'Chengdu Voice | 成都之音 - Authentic Chengdu Culture & Products',
  description: 'Experience authentic Chengdu through sound, taste, and stories. Premium Sichuan pepper, tea, and cultural products delivered worldwide.',
  keywords: ['Chengdu', '成都', 'Sichuan pepper', 'tea', 'culture', 'cross-border e-commerce'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chengdu Voice | 成都之音',
    description: 'Experience authentic Chengdu through sound, taste, and stories.',
    url: siteUrl,
    siteName: 'Chengdu Voice',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chengdu Voice | 成都之音',
    description: 'Experience authentic Chengdu through sound, taste, and stories.',
    images: ['/og-image.jpg'],
  },
};

export default async function HomePage() {
  const [blogs, products, settings] = await Promise.all([
    db.blogs.getAll(),
    db.products.getAll(),
    db.settings.get(),
  ]);
  const featuredPosts = blogs.slice(0, 5);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.bannerImage || 'https://picsum.photos/id/1015/1920/1080'}
            alt="Chengdu Teahouse"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Experience Chengdu
            <br />
            <span className="text-primary">Through Sound & Flavor</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4">
            We share the hidden rhythm of Chengdu — from traditional teahouses to mountain-grown Sichuan flavors.
          </p>
          <p className="text-lg text-gray-300 mb-12">
            A gateway to experience Chengdu through sound, taste and stories.
          </p>
          
          <Link
            href="#explore"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full text-lg font-medium transition-all animate-bounce"
          >
            <span>Explore Chengdu</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section id="explore" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-secondary mb-4">Explore Chengdu</h2>
            <p className="text-gray-600">Discover the soul of Chengdu through our three pillars</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/free-sounds"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://picsum.photos/id/1025/800/600"
                  alt="Hear Chengdu"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Volume2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Hear Chengdu</h3>
                  <p className="text-white/80 text-sm mb-4">Listen to authentic Chengdu sounds - tea houses, rain streets, and local markets.</p>
                  <div className="inline-flex items-center gap-2 text-primary bg-white/90 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-white group-hover:scale-105 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/blog"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://picsum.photos/id/1035/800/600"
                  alt="Discover Stories"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-14 h-14 bg-secondary/90 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Discover Stories</h3>
                  <p className="text-white/80 text-sm mb-4">Explore Chengdu's rich culture, history, and way of life through our stories.</p>
                  <div className="inline-flex items-center gap-2 text-secondary bg-white/90 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-white group-hover:scale-105 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
            
            <Link
              href="/shop"
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://picsum.photos/id/1080/800/600"
                  alt="Taste Chengdu"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-14 h-14 bg-gold/90 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Utensils className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Taste Chengdu</h3>
                  <p className="text-white/80 text-sm mb-4">Bring authentic Chengdu flavors home - from Sichuan pepper to premium tea.</p>
                  <div className="inline-flex items-center gap-2 text-gold bg-white/90 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-white group-hover:scale-105 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogCarousel posts={featuredPosts} />
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600">Bring authentic Chengdu flavors home</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{product.nameEn}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.name}</p>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-amber-600">${product.price}</span>
                    {product.unit && product.unitType && (
                      <span className="text-sm text-gray-500">/ {product.unit}{product.unitType}</span>
                    )}
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg"
            >
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Want more sounds of Chengdu?
          </h2>
          <p className="text-white/80 mb-8">
            Subscribe to our newsletter and get the full Chengdu Sound Map white noise album for free.
          </p>
          
          <SubscribeForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}