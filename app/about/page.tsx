'use client';

import { useState, useEffect } from 'react';
import { MapPin, Mail, Award, Globe, Heart, Users } from 'lucide-react';
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

  const stats = [
    { icon: Globe, value: '50+', label: 'Countries Served' },
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Award, value: '500+', label: 'Products' },
    { icon: Heart, value: '10+', label: 'Years Experience' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed about-content"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-secondary mb-4">Contact Us</h2>
            <p className="text-gray-600">We'd love to hear from you</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-secondary text-lg mb-2">Address</h3>
              <p className="text-gray-600">Chengdu, Sichuan, China</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-bamboo/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-bamboo" />
              </div>
              <h3 className="font-serif font-bold text-secondary text-lg mb-2">Email</h3>
              <p className="text-gray-600">kylw02@outlook.com</p>
            </div>
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
          color: #4A3728;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .about-content h1 {
          font-size: 2.5rem;
        }
        
        .about-content h2 {
          font-size: 2rem;
        }
        
        .about-content h3 {
          font-size: 1.5rem;
        }
        
        .about-content p {
          margin-bottom: 1em;
          line-height: 1.8;
        }
        
        .about-content ul,
        .about-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .about-content ul {
          list-style-type: disc;
        }
        
        .about-content ol {
          list-style-type: decimal;
        }
        
        .about-content li {
          margin-bottom: 0.5em;
        }
        
        .about-content blockquote {
          border-left: 4px solid #8B4513;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
          font-style: italic;
        }
        
        .about-content a {
          color: #8B4513;
          text-decoration: underline;
        }
        
        .about-content strong {
          font-weight: bold;
        }
        
        .about-content em {
          font-style: italic;
        }
        
        .about-content hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
