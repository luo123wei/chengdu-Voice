import { MapPin, Mail, Award, Globe, Heart, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const stats = [
    { icon: Globe, value: '50+', label: 'Countries Served' },
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Award, value: '500+', label: 'Products' },
    { icon: Heart, value: '10+', label: 'Years Experience' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm mb-6">
                About Us
              </span>
              <h1 className="text-4xl font-serif font-bold text-secondary mb-6">
                Chengdu Voice
                <br />
                <span className="text-primary">成都之音</span>
              </h1>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                We believe the most honest way to know a city is through its sounds.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Here, you'll hear the gentle clink of tea bowls in a traditional Chengdu teahouse, 
                the rain tapping on the bluestone alleys of Kuanzhai, and the sizzle of Sichuan 
                peppercorns hitting hot oil in a bustling market.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Through these real, unfiltered sounds, we share the unhurried rhythm and the warmth 
                of Chengdu's culture with the world.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                And when those sounds make you curious — when you want to taste the city for yourself — 
                Hanyuan Sichuan Pepper becomes the natural next step. It's the soul of the numbing 
                flavor, a gift from the mountains of Sichuan.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                From sound to taste, from Chengdu to your home.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed font-serif font-medium">
                Chengdu Voice. Hear the city. Taste the story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
                >
                  Shop Now
                </a>
                <a
                  href="/blog"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-secondary text-secondary rounded-xl font-medium hover:bg-secondary hover:text-white transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://picsum.photos/id/1000/1200/675"
                  alt="Chengdu Voice"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary">Authentic Quality</p>
                    <p className="text-sm text-gray-500">100% Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-secondary mb-4">Our Story</h2>
            <p className="text-gray-600">From a small teahouse to a global brand</p>
          </div>
          
          <div className="bg-cream rounded-2xl p-8 mb-8">
            <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
              "我生长在成都，小时候最深的记忆是茶馆里盖碗茶碰撞的声音。后来去了国外，发现最想念的不是火锅，而是成都的声音。于是我决定把成都的声音带给世界。"
            </blockquote>
            <p className="text-right mt-4 text-primary font-serif font-medium">— 创始人</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2015</span>
              </div>
              <h3 className="font-serif font-bold text-secondary text-xl mb-2">Our Beginning</h3>
              <p className="text-gray-600">Started as a small teahouse in Chengdu, sharing local tea culture with visitors.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2018</span>
              </div>
              <h3 className="font-serif font-bold text-secondary text-xl mb-2">Expansion</h3>
              <p className="text-gray-600">Expanded to include traditional crafts and food products from Sichuan.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2026</span>
              </div>
              <h3 className="font-serif font-bold text-secondary text-xl mb-2">Global Reach</h3>
              <p className="text-gray-600">Serving customers in over 50 countries, sharing Chinese culture worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-cream to-white">
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
              <p className="text-gray-600">hello@chengduvoice.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
