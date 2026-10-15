import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubscribeForm from '@/components/SubscribeForm';
import ProductCard from '@/components/ProductCard';
import HeroProductGrid from '@/components/HeroProductGrid';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Absolute image URL for structured data (product images may be relative or absolute)
const absImage = (src?: string) =>
  src ? (src.startsWith('http') ? src : `${siteUrl}${src}`) : `${siteUrl}/og-image.jpg`;

// Homepage FAQ copy — the same array feeds the visible section and the FAQPage JSON-LD
const homeFaqs = [
  {
    q: 'What is Voice Culture?',
    a: 'Voice Culture is a small design studio based in Chengdu, China. We design small-batch objects and gifts inspired by the city’s culture, everyday life and visual language, and ship them worldwide.',
  },
  {
    q: 'What does Voice Culture sell?',
    a: 'Two kinds of things. Physical pieces made in small batches from our Chengdu studio — enamel pins and brooches, stationery and small objects for the home — and digital Chengdu sound recordings, including a full Sound Library you can download instantly.',
  },
  {
    q: 'How does the voting model work?',
    a: 'New designs are published as open concepts before they are made. Visitors vote for the ones they want, and when a concept reaches its vote goal we open pre-orders and put it into small-batch production. You decide what we make next.',
  },
  {
    q: 'Do you ship worldwide?',
    a: 'Yes. Physical orders ship from Chengdu, China, to addresses worldwide. Pre-orders ship first as soon as a piece goes into production.',
  },
  {
    q: 'What is the Chengdu Sound Library?',
    a: 'It is a collection of sounds recorded in Chengdu — teahouses, mahjong tables, street life and Sichuan opera percussion — delivered as an instant download after purchase. Selected recordings are also free to listen to on the site.',
  },
  {
    q: 'How do I get 10% off my first order?',
    a: 'Join the studio list with your email address. You will see a welcome code for 10% off your first order, plus votes on new designs and early access to pre-orders.',
  },
];

export const metadata: Metadata = {
  title: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture',
  description: "Voice Culture creates small-batch objects inspired by Chengdu's culture, everyday life and visual language. From panda-inspired objects to Chengdu postcards and tea culture gifts, each piece is designed to offer a different way to remember the city.",
  keywords: ['Chengdu', '成都', 'cultural gifts', 'souvenirs', 'Voice Culture', 'panda design', '熊猫周边', 'Chengdu gifts', 'Chengdu souvenirs', 'tea culture gifts', 'Chengdu postcards'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture',
    description: "Small-batch objects inspired by Chengdu's culture, everyday life and visual language.",
    url: siteUrl,
    siteName: 'Voice Culture',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture',
    description: "Small-batch objects inspired by Chengdu's culture, designed in Chengdu, shipped worldwide.",
    images: ['/og-image.jpg'],
  },
};

export default async function HomePage() {
  const [products, blogs] = await Promise.all([db.products.getAll(), db.blogs.getAll()]);

  const voteProducts = products.filter(p => p.status === 'design');
  const onSaleProducts = products.filter(p => !p.status || p.status === 'on-sale').slice(0, 8);
  const preorderProducts = products.filter(p => p.status === 'preorder');
  const latestPosts = blogs.slice(0, 3);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const inStockJsonLd = onSaleProducts.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'In Stock Now — Voice Culture',
        itemListElement: onSaleProducts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.nameEn || p.name,
            url: `${siteUrl}/shop/${p.id}`,
            image: absImage(p.images?.[0]),
          },
        })),
      }
    : null;

  // Serialize product data for client component
  const preorderData = preorderProducts.map(p => ({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn,
    images: p.images,
    status: p.status,
  }));

  return (
    <div className="min-h-screen bg-white text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {inStockJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(inStockJsonLd) }}
        />
      )}

      <Header />

      {/* ===== Hero ===== */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-6">
                Voice Culture · Chengdu
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[52px] leading-[1.2] font-bold tracking-tight mb-4">
                Chengdu Cultural Gifts &amp; Souvenirs
              </h1>
              <p className="font-serif text-lg md:text-xl mb-5 border-b-4 border-black inline-block pb-0.5">
                Everyday objects, designed in Chengdu.
              </p>
              <p className="text-base md:text-lg text-gray-700 font-medium mb-3">
                Discover unique Chengdu gifts, cultural souvenirs and everyday objects inspired by life in Chengdu.
              </p>
              <p className="text-base md:text-lg text-gray-500 max-w-lg mb-9">
                We&apos;re a small design studio turning Chengdu&apos;s laid-back charm and panda cuteness into everyday objects you can hold. Every piece goes into production only after you vote for it.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-sm font-medium border border-black hover:bg-gray-800 transition-colors"
                >
                  Explore Works <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/shop?tab=design"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors"
                >
                  Vote for the Next Drop
                </Link>
              </div>
            </div>

            <HeroProductGrid products={preorderData} />
          </div>
        </div>
      </section>

      {/* ===== 理念条 ===== */}
      <section className="border-b border-gray-200" aria-label="How Voice Culture works">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 list-none">
          {[
            { n: '01', t: 'We design', d: 'Original studio designs — every piece carries a Chengdu story' },
            { n: '02', t: 'You vote', d: 'Concepts go on display first; production starts once the votes are in' },
            { n: '03', t: 'We make', d: 'Small-batch craftsmanship. Pre-orders ship first' },
          ].map((item, i) => (
            <li
              key={item.n}
              className={`py-9 px-6 text-center ${i < 2 ? 'md:border-r border-b md:border-b-0 border-gray-200' : ''}`}
            >
              <div className="font-serif text-xs text-gray-400 mb-2">{item.n}</div>
              <div className="font-serif text-xl font-bold mb-1.5">{item.t}</div>
              <div className="text-[13px] text-gray-500">{item.d}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== 新品投票 ===== */}
      <section className="py-16 md:py-20" aria-labelledby="vote-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
            <div>
              <h2 id="vote-heading" className="font-serif text-2xl md:text-3xl font-bold">What should we make next?</h2>
              <p className="text-sm text-gray-500 mt-1.5">You decide what we make next — when a concept hits its vote goal, the pre-order opens.</p>
            </div>
            <Link href="/shop?tab=design" className="text-[13px] border-b border-black pb-0.5 hover:text-gray-600">
              View all open votes →
            </Link>
          </div>
          {voteProducts.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none">
              {voteProducts.map(p => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No open votes right now.</p>
          )}
        </div>
      </section>

      {/* ===== 三入口 ===== */}
      <section className="pb-16 md:pb-20" aria-label="Explore Voice Culture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/shop" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">WORKS</div>
              <h3 className="font-serif text-2xl mb-2">Works</h3>
              <p className="text-[13px] text-gray-500 mb-5">Everything we make — in stock, on pre-order and in design</p>
              <span className="text-[13px] border-b border-black pb-0.5">Shop all works →</span>
            </Link>
            <Link href="/blog" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">STORIES</div>
              <h3 className="font-serif text-2xl mb-2">Stories</h3>
              <p className="text-[13px] text-gray-500 mb-5">Sketches, prototypes and Chengdu inspiration behind every piece</p>
              <span className="text-[13px] border-b border-black pb-0.5">Read the stories →</span>
            </Link>
            <Link href="/about" className="block border border-gray-200 p-9 hover:border-black hover:bg-cream transition-all group">
              <div className="font-serif text-[13px] text-gray-400 tracking-[0.2em] mb-4">ABOUT</div>
              <h3 className="font-serif text-2xl mb-2">About</h3>
              <p className="text-[13px] text-gray-500 mb-5">A small studio in Chengdu and how we make things</p>
              <span className="text-[13px] border-b border-black pb-0.5">Get to know us →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 在售精选 ===== */}
      <section className="pb-16 md:pb-20" aria-labelledby="stock-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
            <div>
              <h2 id="stock-heading" className="font-serif text-2xl md:text-3xl font-bold">In Stock Now</h2>
              <p className="text-sm text-gray-500 mt-1.5">In production · shipped worldwide from Chengdu</p>
            </div>
            <Link href="/shop?tab=on-sale" className="text-[13px] border-b border-black pb-0.5 hover:text-gray-600">
              Shop all in-stock →
            </Link>
          </div>
          {onSaleProducts.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none">
              {onSaleProducts.map(p => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ===== 最新故事 ===== */}
      {latestPosts.length > 0 && (
        <section className="pb-16 md:pb-20" aria-labelledby="journal-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-9 gap-4 flex-wrap">
              <div>
                <h2 id="journal-heading" className="font-serif text-2xl md:text-3xl font-bold">From the Journal</h2>
                <p className="text-sm text-gray-500 mt-1.5">Chengdu culture, craft and the stories behind what we make.</p>
              </div>
              <Link href="/blog" className="text-[13px] border-b border-black pb-0.5 hover:text-gray-600">
                Read all stories →
              </Link>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none">
              {latestPosts.map(post => (
                <li key={post.id}>
                  <article>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <div className="aspect-[4/3] overflow-hidden bg-cream mb-4">
                        {post.images?.[0] ? (
                          <img
                            src={post.images[0]}
                            alt={post.titleEn}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <h3 className="font-serif text-lg mb-2 group-hover:text-gray-600 transition-colors">
                        {post.titleEn}
                      </h3>
                      {post.contentEn && (
                        <p className="text-[13px] text-gray-500 line-clamp-2">
                          {post.contentEn.replace(/<[^>]*>/g, '').slice(0, 110)}
                        </p>
                      )}
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ===== 常见问题 ===== */}
      <section className="border-t border-gray-200 py-16 md:py-20" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="font-serif text-2xl md:text-3xl font-bold mb-2">
            Frequently asked questions
          </h2>
          <p className="text-sm text-gray-500 mb-10">
            Who we are, what we make and how ordering works.
          </p>
          <dl className="border-t border-gray-200">
            {homeFaqs.map(f => (
              <div key={f.q} className="border-b border-gray-200 py-5">
                <dt className="font-medium mb-2">{f.q}</dt>
                <dd className="text-[14px] text-gray-600 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== 订阅 ===== */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
            Get 10% off your first order
          </h2>
          <p className="text-white/60 text-sm md:text-base mb-8">
            Join the studio list for your welcome code, plus votes on new designs and early pre-order access.
          </p>
          <SubscribeForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
