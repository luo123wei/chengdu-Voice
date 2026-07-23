import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import { db } from '@/lib/db';

export default async function HomePage() {
  const [blogs, products, settings] = await Promise.all([
    db.blogs.getAll(),
    db.products.getAll(),
    db.settings.get(),
  ]);
  const featuredPosts = blogs.slice(0, 3);
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
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Chengdu Voice
            <br />
            <span className="text-primary">成都之音</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            闭上眼，听成都
          </p>
          
          <button className="group inline-flex items-center justify-center gap-4 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full text-lg font-medium transition-all mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span>免费收听成都声音</span>
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/20 transition-all"
            >
              探索博客
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-secondary rounded-lg hover:bg-gray-100 transition-all"
            >
              浏览商店
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600">Discover authentic Chinese treasures</p>
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

      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Latest Blog Posts</h2>
            <p className="text-gray-300">Explore Chinese culture, food, travel and art</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt={post.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full mb-3 inline-block">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-gray-800 mb-2">{post.titleEn}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.contentEn}</p>
                  <span className="text-xs text-gray-500">{post.publishDate}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            订阅我们，免费获取《成都声音地图》白噪音专辑
          </h2>
          <p className="text-white/80 mb-8">
            输入您的邮箱，立即免费获得价值$9.99的白噪音专辑下载链接
          </p>
          
          <SubscribeForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}