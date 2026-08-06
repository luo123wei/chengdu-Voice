'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/data/mockData';

interface BlogCarouselProps {
  posts: BlogPost[];
}

export default function BlogCarousel({ posts }: BlogCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  }, [posts.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (isPaused || posts.length <= 1) return;
    const timer = setInterval(goToNext, 4000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, posts.length]);

  if (posts.length === 0) return null;

  if (posts.length === 1) {
    const post = posts[0];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <Link href={`/blog/${post.slug}`}>
            <div className="rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
              <img
                src={post.images[0]}
                alt={post.titleEn}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
          <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded-xl shadow-lg">
            <p className="text-sm opacity-80">Featured Story</p>
            <p className="text-xl font-bold capitalize">{post.category}</p>
          </div>
        </div>
        <div>
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm mb-6">
            {post.category}
          </span>
          <h2 className="text-3xl font-serif font-bold text-secondary mb-6">
            {post.titleEn}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {post.contentEn.replace(/<[^>]*>/g, '').substring(0, 300)}...
          </p>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-4 transition-all"
          >
            <span>Read Full Story</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-full flex-shrink-0"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
                      <img
                        src={post.images[0]}
                        alt={post.titleEn}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded-xl shadow-lg">
                    <p className="text-sm opacity-80">Featured Story</p>
                    <p className="text-xl font-bold capitalize">{post.category}</p>
                  </div>
                </div>
                <div>
                  <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm mb-6">
                    {post.category}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-secondary mb-6">
                    {post.titleEn}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {post.contentEn.replace(/<[^>]*>/g, '').substring(0, 300)}...
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-4 transition-all"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      <div className="flex justify-center items-center gap-2 mt-8">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className="transition-all duration-300 h-2 rounded-full"
            style={{
              width: index === currentIndex ? '32px' : '16px',
              backgroundColor: index === currentIndex ? '#8B4513' : '#D1D5DB',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
