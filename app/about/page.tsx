'use client';

import { useState, useEffect } from 'react';
import { MapPin, Mail, PenTool, Vote, Package } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setAboutContent(data.aboutContent || '');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch about content:', error);
        setLoading(false);
      });
  }, []);

  const steps = [
    { icon: PenTool, num: '01', title: 'We design', text: '工作室围绕成都的日常记忆画草图、打样,一只熊猫、一段竹节,都可能是下一件作品。' },
    { icon: Vote, num: '02', title: 'You vote', text: '设计稿公开投票,票数最高的进入预售。你不只是顾客,也是产品策划。' },
    { icon: Package, num: '03', title: 'We make', text: '预售达标后小批量制作,成都本地手工团队完成,成品直达你手边。' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 border-b border-[#EEEEEE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6">ABOUT THE STUDIO</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-black leading-tight mb-6">
            成都造物
          </h1>
          <p className="font-serif italic text-lg md:text-xl text-gray-600">
            Everyday objects, designed in Chengdu.
          </p>
        </div>
      </section>

      {/* 工作室故事(后台可编辑) */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : aboutContent ? (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed about-content"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          ) : (
            <div className="space-y-6 text-lg leading-loose text-gray-700">
              <p>
                成都造物是一间独立文创设计工作室。我们相信,城市的气质不只在景点里,
                也在盖碗茶冒出的热气、熊猫懒懒散散的午后、和竹匠手边一根磨亮的尺子上。
              </p>
              <p>
                我们把这些日常片段做成文具、家居和小摆件。每一件作品都从一张设计稿开始,
                交给来到这里的你投票决定——得票最多的设计才会进入生产。
              </p>
              <p>
                小批量、慢制作,成都本地手工团队完成。愿你桌上的日常,也有一点成都。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 工作方式 */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#EEEEEE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-px bg-[#EEEEEE] border border-[#EEEEEE]">
            {steps.map((s) => (
              <div key={s.num} className="bg-white p-8">
                <s.icon className="w-6 h-6 text-black mb-4" strokeWidth={1.5} />
                <p className="text-xs tracking-[0.25em] text-gray-400 mb-2">{s.num}</p>
                <h3 className="font-serif font-bold text-xl text-black mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-3">CONTACT</p>
            <h2 className="font-serif text-3xl font-bold text-black mb-4">与我们联系</h2>
            <p className="text-gray-600">合作、定制或单纯打个招呼,都欢迎来信。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-8 border border-[#EEEEEE]">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">工作室</h3>
              <p className="text-gray-600 text-sm">Chengdu, Sichuan, China</p>
            </div>
            <div className="text-center p-8 border border-[#EEEEEE]">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">邮箱</h3>
              <p className="text-gray-600 text-sm">kylw02@outlook.com</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop?tab=design"
              className="inline-block px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-[#B54A32] transition-colors"
            >
              去投票决定下一件作品
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .about-content h1,
        .about-content h2,
        .about-content h3 {
          font-family: serif;
          font-weight: bold;
          color: #111111;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        .about-content h1 { font-size: 2.5rem; }
        .about-content h2 { font-size: 2rem; }
        .about-content h3 { font-size: 1.5rem; }

        .about-content p {
          margin-bottom: 1em;
          line-height: 1.8;
        }

        .about-content ul,
        .about-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }

        .about-content ul { list-style-type: disc; }
        .about-content ol { list-style-type: decimal; }
        .about-content li { margin-bottom: 0.5em; }

        .about-content blockquote {
          border-left: 3px solid #111111;
          padding-left: 1em;
          margin: 1em 0;
          color: #555;
          font-style: italic;
        }

        .about-content a {
          color: #B54A32;
          text-decoration: underline;
        }

        .about-content strong { font-weight: bold; }
        .about-content em { font-style: italic; }

        .about-content hr {
          border: none;
          border-top: 1px solid #EEEEEE;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
