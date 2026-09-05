import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import ProductCard from '@/components/ProductCard';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Chengdu Craft Studio | 成都造物 - Panda-themed Designer Crafts from Chengdu',
  description: 'Everyday objects, designed in Chengdu. A small craft studio making panda-themed designer objects — vote for what we make next, pre-order, shop worldwide.',
  keywords: ['Chengdu', 'panda', 'craft studio', 'designer crafts', '文创', 'cultural creative', 'cross-border e-commerce'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Chengdu Craft Studio | 成都造物',
    description: 'Everyday objects, designed in Chengdu. Vote for what we make next.',
    url: siteUrl,
    siteName: 'Chengdu Craft Studio',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chengdu Craft Studio | 成都造物',
    description: 'Everyday objects, designed in Chengdu.',
    images: ['/og-image.jpg'],
  },
};

export default async function HomePage() {
  const [products] = await Promise.all([db.products.getAll()]);

  const voteProducts = products.filter(p => p.status === 'design');
  const onSaleProducts = products.filter(p => !p.status || p.status === 'on-sale').slice(0, 4);
  const heroProduct = products.find(p => p.status === 'preorder') || products[0];

  return (
    <div className="min-h-screen bg-white text-ink">
      <Header />

      {/* ===== Hero ===== */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-6">
                Chengdu Craft Studio · 成都造物
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[52px] leading-[1.2] font-bold tracking-tight mb-6">
                Everyday objects,
                <br />
                <span className="border-b-4 border-black pb-0.5">designed in Chengdu.</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 max-w-lg mb-9">
                我们是一间小型文创设计工作室,把成都的松弛与熊猫的可爱,做成你握在手里的日常物件。每一款,都先由你投票,再投入生产。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-sm font-medium border border-black hover:bg-gray-800 transition-colors"
                >
                  Explore Works 逛作品 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/shop?tab=design"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors"
                >
                  Vote for Next 投票新品
                </Link>
              </div>
            </div>

            <div className="relative">
              {heroProduct && (
                <img
                  src={heroProduct.images[0]}
                  alt={heroProduct.nameEn}
                  className="w-full aspect-[4/3] object-cover"
                />
              )}
              <div className="absolute left-4 bottom-4 bg-white border border-gray-200 px-3.5 py-2 text-xs">
                ① 首款作品 · {heroProduct?.nameEn} {heroProduct?.name} · 预售中
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 理念条 ===== */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3">
          {[
            { n: '01', t: 'We design', d: '工作室原创设计,每件都有成都故事' },
            { n: '02', t: 'You vote', d: '概念稿先展出,票数达标才开模生产' },
            { n: '03', t: 'We make', d: '小批量手作,预售订单优先发货' },
          ].map((item, i) => (
            <div
              key={item.n}
              className={`py-9 px-6 text-center ${i < 2 ? 'md:border-r border-b md:border-b-0 border-gray-200' : ''}`}
            >
              <div className="font-serif text-xs text-gray-400 mb-2">{item.n}</div>
              <div className="font-serif text-xl font-bold mb-1.5">{item.t}</div>
              <div className="text-[13px] text-gray-500">{item.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 新品投票 ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold">What should we make next?</h2>
              <p className="text-sm text-gray-500 mt-1.5">下一款做什么,你说了算 · 投票达标即开启预售</p>
            </div>
            <Link href="/shop?tab=design" className="text-[13px] border-b border-black pb-0.5 hover:text-gray-600">
              查看全部投票 →
            </Link>
          </div>
          {voteProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {voteProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无投票中的作品。</p>
          )}
        </div>
      </section>

      {/* ===== 三入口 ===== */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/shop" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">WORKS</div>
              <h3 className="font-serif text-2xl mb-2">作品</h3>
              <p className="text-[13px] text-gray-500 mb-5">在售、预售与设计中的全部文创作品</p>
              <span className="text-[13px] border-b border-black pb-0.5">进入作品店 →</span>
            </Link>
            <Link href="/blog" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">STORIES</div>
              <h3 className="font-serif text-2xl mb-2">故事</h3>
              <p className="text-[13px] text-gray-500 mb-5">每件作品背后的设计草图、打样与成都灵感</p>
              <span className="text-[13px] border-b border-black pb-0.5">读设计故事 →</span>
            </Link>
            <Link href="/about" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">ABOUT</div>
              <h3 className="font-serif text-2xl mb-2">关于</h3>
              <p className="text-[13px] text-gray-500 mb-5">一间成都的小工作室,和它的造物方法论</p>
              <span className="text-[13px] border-b border-black pb-0.5">了解我们 →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 在售精选 ===== */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold">In Stock Now</h2>
              <p className="text-sm text-gray-500 mt-1.5">已投产在售 · 跨境直邮全球</p>
            </div>
            <Link href="/shop?tab=on-sale" className="text-[13px] border-b border-black pb-0.5 hover:text-gray-600">
              全部在售 →
            </Link>
          </div>
          {onSaleProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== 订阅 ===== */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
            新作品开售,第一时间通知你
          </h2>
          <p className="text-white/60 text-sm md:text-base mb-8">
            Subscribe to get first access to pre-orders and new drops from the studio.
          </p>
          <SubscribeForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
