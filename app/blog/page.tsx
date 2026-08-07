'use client';
import { useState } from 'react';
import { Search, Music, Video, ChevronLeft, ChevronRight, Utensils, BookOpen, Plane, Palette } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categoryLabels } from '@/data/mockData';
import { useBlogs } from '@/hooks/useDataStore';

const ITEMS_PER_PAGE = 12;

const chengduCategories = [
  { id: 'culture', name: 'Culture', icon: BookOpen, color: 'bg-primary' },
  { id: 'food', name: 'Food', icon: Utensils, color: 'bg-gold' },
  { id: 'travel', name: 'Travel', icon: Plane, color: 'bg-secondary' },
  { id: 'art', name: 'Art', icon: Palette, color: 'bg-chinese-red' },
];

export default function BlogPage() {
  const { blogs } = useBlogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = blogs.filter((post) => {
    const matchesSearch =
      post.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-to-br from-secondary to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Chengdu Encyclopedia</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Discover Chengdu through sounds, stories and flavors. Your guide to experiencing the soul of Chengdu.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPagination();
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  resetPagination();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {chengduCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      resetPagination();
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-cream rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={post.images[0]}
                    alt={post.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/90 text-white text-xs rounded-full">
                      {categoryLabels[post.category].en}
                    </span>
                    {post.audio && (
                      <span className="px-3 py-1 bg-bamboo/90 text-white text-xs rounded-full flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        Audio
                      </span>
                    )}
                    {post.video && (
                      <span className="px-3 py-1 bg-chinese-red/90 text-white text-xs rounded-full flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {post.contentEn.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{post.author}</span>
                    <span className="text-xs text-gray-500">{post.publishDate.split('T')[0]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No blog posts found matching your criteria.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一页</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {filteredPosts.length > 0 && totalPages > 1 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              显示 {startIndex + 1} - {Math.min(endIndex, filteredPosts.length)} 条，共 {filteredPosts.length} 条
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
