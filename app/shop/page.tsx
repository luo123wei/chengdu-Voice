'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productCategoryLabels } from '@/data/mockData';
import { useProducts } from '@/hooks/useDataStore';
import type { Product } from '@/data/mockData';

const ITEMS_PER_PAGE = 12;

type StatusKey = 'design' | 'preorder' | 'on-sale';

const statusTabs: { key: StatusKey; zh: string; en: string }[] = [
  { key: 'design', zh: '投票中 · 设计中', en: 'Voting' },
  { key: 'preorder', zh: '预售', en: 'Pre-order' },
  { key: 'on-sale', zh: '在售', en: 'In Stock' },
];

const categories = ['stationery', 'home', 'decor', 'toy'] as const;

function ShopPageInner() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as StatusKey) || 'on-sale';

  const [activeStatus, setActiveStatus] = useState<StatusKey>(
    statusTabs.some(t => t.key === initialTab) ? initialTab : 'on-sale'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating' | 'name'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  const statusOf = (p: Product) => p.status || 'on-sale';

  const counts = {
    design: products.filter(p => statusOf(p) === 'design').length,
    preorder: products.filter(p => statusOf(p) === 'preorder').length,
    'on-sale': products.filter(p => statusOf(p) === 'on-sale').length,
  };

  const filteredProducts = products
    .filter(p => statusOf(p) === activeStatus)
    .filter((product) => {
      const matchesSearch =
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.nameEn.localeCompare(b.nameEn);
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetPagination = () => setCurrentPage(1);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 页头 */}
      <section className="pt-28 pb-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold mb-2">
            Works <span className="text-xl text-gray-400 font-normal">作品</span>
          </h1>
          <p className="text-gray-500 text-[15px]">投票中的概念 · 预售中的新作 · 已投产的在售款</p>
        </div>
      </section>

      {/* 状态 Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveStatus(tab.key); resetPagination(); }}
              className={`px-6 py-4 text-sm border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeStatus === tab.key
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {tab.zh}
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                activeStatus === tab.key
                  ? 'bg-black text-white border-black'
                  : 'bg-cream text-gray-500 border-gray-200'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* 搜索 + 分类 */}
        <div className="flex flex-col lg:flex-row gap-4 py-5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products... 搜索作品"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); resetPagination(); }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => { setSelectedCategory(null); resetPagination(); }}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                !selectedCategory
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); resetPagination(); }}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  selectedCategory === category
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                }`}
              >
                {productCategoryLabels[category].en} {productCategoryLabels[category].zh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 产品网格 */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-500">
              Showing {filteredProducts.length} products · 共 {filteredProducts.length} 件
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); resetPagination(); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">该分区暂无作品。No products in this section yet.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一页</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopPageInner />
    </Suspense>
  );
}
