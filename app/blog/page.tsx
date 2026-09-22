import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { categoryLabels } from '@/data/mockData';

export const dynamic = 'force-dynamic';

async function getPublishedBlogs(): Promise<any[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
    const res = await fetch(`${base}/api/blogs`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.error('[BlogPage] /api/blogs returned', res.status);
      return [];
    }
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data?.data || [];
    return arr;
  } catch (e) {
    console.error('[BlogPage] fetch blogs failed:', e);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string; page?: string };
}) {
  const allBlogs = await getPublishedBlogs();
  const rawQ = searchParams.q;
  const rawCat = searchParams.cat;
  const rawPage = searchParams.page;
  const q = (typeof rawQ === 'string' ? rawQ : '').toLowerCase();
  const cat = typeof rawCat === 'string' && rawCat ? rawCat : undefined;
  const currentPage = Math.max(1, parseInt(typeof rawPage === 'string' ? rawPage : '1', 10) || 1);
  const ITEMS_PER_PAGE = 12;

  const filtered = allBlogs.filter((post) => {
    const matchesSearch =
      !q ||
      (post.titleEn?.toLowerCase().includes(q) ||
        (post.title && post.title.toLowerCase().includes(q)));
    const matchesCat = !cat || post.category === cat;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const buildUrl = (params: { q?: string; cat?: string; page?: string }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.cat) sp.set('cat', params.cat);
    if (params.page && params.page !== '1') sp.set('page', params.page);
    const s = sp.toString();
    return s ? `?${s}` : '';
  };

  const categories = [
    { id: undefined, name: "All" },
    { id: 'culture', name: 'Culture' },
    { id: 'food', name: 'Food' },
    { id: 'travel', name: 'Travel' },
    { id: 'art', name: 'Art' },
    { id: 'gift', name: 'Gift Guide' },
    { id: 'craft', name: 'Craft' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-to-br from-secondary to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Voice Culture Stories</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Discover Chengdu through sounds, stories and flavors. Your guide to experiencing the soul of Chengdu.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + categories — simple links so bots follow them */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((c) => {
              const active = cat === c.id;
              const url = buildUrl({
                q,
                cat: c.id || '',
                page: '1',
              });
              return (
                <Link
                  key={c.id || 'all'}
                  href={`/blog${url}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>

          {paginatedPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No posts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-cream rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-48">
                    {post.images && post.images[0] ? (
                      <img
                        src={post.images[0]}
                        alt={post.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary/50">
                        Voice Culture
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 bg-primary/90 text-white text-xs rounded-full">
                        {(categoryLabels[post.category]?.en || post.category || 'Culture')}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors mb-2">
                      {post.titleEn}
                    </h3>
                    {post.contentEn && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {post.contentEn.replace(/<[^>]*>/g, '').slice(0, 100)}
                      </p>
                    )}
                    <div className="mt-3 flex items-center text-xs text-gray-400">
                      {post.publishDate && (
                        <span className="mr-3">{post.publishDate.split('T')[0]}</span>
                      )}
                      {post.views != null && (
                        <span>{post.views.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog${buildUrl({ q, cat, page: String(p) })}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    p === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
