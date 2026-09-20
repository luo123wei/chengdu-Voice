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
    { icon: PenTool, num: '01', title: 'We design', text: 'The studio sketches and prototypes around everyday memories of Chengdu — a panda, a segment of bamboo, anything can become the next piece.' },
    { icon: Vote, num: '02', title: 'You vote', text: 'Designs go to a public vote and the top-voted pieces move to pre-order. You are not just a customer — you are the product planner.' },
    { icon: Package, num: '03', title: 'We make', text: 'Once a pre-order hits its goal, we produce in small batches with local Chengdu artisans and ship straight to you.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 border-b border-[#EEEEEE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-6">ABOUT THE STUDIO</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-black leading-tight mb-6">
            Voice Culture
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
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : aboutContent ? (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed about-content"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          ) : (
            <div className="space-y-6 text-lg leading-loose text-gray-700">
              <p>
                Voice Culture is an independent design studio based in Chengdu. We believe a city&apos;s
                character lives not only in its landmarks, but in the steam rising from a bowl of
                covered tea, in a lazy panda afternoon, and in the bamboo ruler worn smooth by a craftsman&apos;s hands.
              </p>
              <p>
                We turn these everyday moments into stationery, home goods and desk objects. Every piece
                starts as a design draft and is put to a vote — only the designs with the most votes go into production.
              </p>
              <p>
                Small batches, slow craft, made by local artisans in Chengdu. May your desk carry a little bit of Chengdu too.
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
            <h2 className="font-serif text-3xl font-bold text-black mb-4">Contact Us</h2>
            <p className="text-gray-600">Collaborations, custom orders, or just to say hello — we&apos;d love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-8 border border-[#EEEEEE]">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">Studio</h3>
              <p className="text-gray-600 text-sm">Chengdu, Sichuan, China</p>
            </div>
            <div className="text-center p-8 border border-[#EEEEEE]">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">Email</h3>
              <p className="text-gray-600 text-sm">hello@voiceculture.world</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop?tab=design"
              className="inline-block px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-[#B54A32] transition-colors"
            >
              Vote on the next piece
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
