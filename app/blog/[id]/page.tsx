'use client';
import { useParams } from 'next/navigation';
import { ArrowLeft, Music, Video, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categoryLabels } from '@/data/mockData';
import { useBlogs } from '@/hooks/useDataStore';

export default function BlogDetailPage() {
  const params = useParams();
  const { blogs } = useBlogs();
  const post = blogs.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-secondary mb-4">Post Not Found</h1>
            <Link href="/blog" className="text-primary hover:underline">
              Return to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            Back to Blog
          </Link>

          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
            {categoryLabels[post.category].en}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            {post.titleEn}
          </h1>
          <p className="text-lg text-gray-500 mb-6">{post.title}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post.publishDate}
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
                <Music className="w-6 h-6 text-bamboo" />
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
                <Video className="w-6 h-6 text-chinese-red" />
                <h3 className="font-bold text-secondary">Video Content</h3>
              </div>
              <video controls className="w-full rounded-lg">
                <source src={post.video} type="video/mp4" />
              </video>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-secondary mb-4">English</h2>
            <div className="text-gray-600 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: post.contentEn || '<p>No content available</p>' }} />
            
            <h2 className="text-2xl font-bold text-secondary mb-4">中文</h2>
            <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content || '<p>暂无内容</p>' }} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
