import { MapPin, Mail, Award, Globe, Heart, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com'

export const metadata: Metadata = {
  title: 'About | Chengdu Voice - Our Story & Mission',
  description: 'Learn about Chengdu Voice\'s mission to share authentic Chengdu culture with the world. From sound to taste, from Chengdu to your home.',
  keywords: ['about Chengdu Voice', 'Chengdu culture mission', 'founder story', 'Chengdu to the world'],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | Chengdu Voice',
    description: 'Our mission to share authentic Chengdu culture with the world.',
    url: `${siteUrl}/about`,
    siteName: 'Chengdu Voice',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Chengdu Voice',
    description: 'Our mission to share authentic Chengdu culture.',
    images: ['/og-image.jpg'],
  },
};

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

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-8 leading-tight">
              Experience Chengdu
              <br />
              <span className="text-primary">Through Sound & Flavor</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Chengdu Voice is a cultural lifestyle brand sharing Chengdu's sounds, stories, flavors, and traditions with the world.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              Chengdu is a city that is experienced slowly.
              <br />
              Through authentic sounds, cultural stories, and meaningful products, we invite people around the world to discover the everyday beauty of Chengdu and Chinese regional culture.
            </p>
          </div>
        </div>
      </section>

      {/* What is Chengdu Voice? */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-secondary mb-8 text-center">What is Chengdu Voice?</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg">
              Chengdu Voice is a cultural platform that connects people with Chengdu through the senses of sound, taste, and storytelling.
            </p>
            
            <p>
              We believe culture is not only found in museums or historical places. It lives in everyday moments:
            </p>
            
            <ul className="list-none space-y-4 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">▸</span>
                <span>The gentle clink of tea bowls in traditional teahouses.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">▸</span>
                <span>The sound of rain falling on old stone streets.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">▸</span>
                <span>The conversations around a hot pot table.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">▸</span>
                <span>The aroma of Sichuan pepper meeting hot oil in a local kitchen.</span>
              </li>
            </ul>
            
            <p className="italic text-gray-600 text-lg">
              These small moments reveal the true rhythm of Chengdu life.
            </p>
          </div>
        </div>
      </section>

      {/* Why "Voice"? */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-secondary mb-8 text-center">Why "Voice"?</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg">
              Voice is more than what we hear.
            </p>
            
            <p>
              A culture has many voices.
              <br />
              It speaks through:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-serif font-bold text-primary text-xl mb-2">Sounds</h3>
                <p className="text-gray-600">the atmosphere of streets, markets, teahouses, and daily life.</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-serif font-bold text-primary text-xl mb-2">Flavors</h3>
                <p className="text-gray-600">the ingredients and dishes that carry memories across generations.</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-serif font-bold text-primary text-xl mb-2">Stories</h3>
                <p className="text-gray-600">the people, traditions, and experiences behind every cultural symbol.</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-serif font-bold text-primary text-xl mb-2">Lifestyle</h3>
                <p className="text-gray-600">the unique way people live, connect, and enjoy life.</p>
              </div>
            </div>
            
            <p className="text-lg font-medium text-secondary text-center pt-4">
              Chengdu Voice shares these cultural expressions with the world.
            </p>
          </div>
        </div>
      </section>

      {/* Discover the Slow Rhythm */}
      <section className="py-16 bg-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">Discover the Slow Rhythm of Chengdu</h2>
          
          <div className="prose prose-lg max-w-none text-white/90 leading-relaxed space-y-6">
            <p className="text-lg">
              Chengdu is known for its relaxed pace, rich food culture, traditional teahouses, and warm social connections.
            </p>
            
            <p>
              Unlike cities that are only defined by landmarks, Chengdu is experienced through everyday life.
              <br />
              It can be found in:
            </p>
            
            <ul className="list-none space-y-3 pl-6 text-white/95">
              <li className="flex items-start gap-3">
                <span className="text-cream mt-1">•</span>
                <span>a morning tea ceremony;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cream mt-1">•</span>
                <span>a neighborhood restaurant;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cream mt-1">•</span>
                <span>a family meal;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cream mt-1">•</span>
                <span>a conversation between friends;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cream mt-1">•</span>
                <span>the flavors passed down through generations.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* From Sound to Flavor */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-secondary mb-8 text-center">From Sound to Flavor</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg">
              Our journey begins with understanding.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 not-prose my-8">
              <div className="text-center p-6 bg-gradient-to-b from-primary/5 to-transparent rounded-xl">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <p className="font-medium text-secondary mb-2">The sounds of Chengdu</p>
                <p className="text-gray-500 text-sm">inspire curiosity</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-b from-primary/5 to-transparent rounded-xl">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📖</span>
                </div>
                <p className="font-medium text-secondary mb-2">The stories behind its traditions</p>
                <p className="text-gray-500 text-sm">create connection</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-b from-primary/5 to-transparent rounded-xl">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌶️</span>
                </div>
                <p className="font-medium text-secondary mb-2">The flavors of Chengdu</p>
                <p className="text-gray-500 text-sm">allow people to experience the culture themselves</p>
              </div>
            </div>
            
            <p className="bg-cream p-6 rounded-xl border-l-4 border-primary not-prose">
              One of these cultural symbols is <strong className="text-primary">Hanyuan Sichuan Pepper</strong> — a traditional ingredient from Sichuan known for its unique aroma and numbing sensation.
              <br /><br />
              More than a spice, Sichuan pepper represents the hospitality, creativity, and social spirit found in Chengdu's food culture.
            </p>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-16 bg-gradient-to-br from-cream to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-secondary mb-8">Our Philosophy</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-xl">
              We believe cultural products are more than objects.
            </p>
            
            <p className="text-lg text-gray-600">
              They are stories people can experience, share, and remember.
              <br />
              Through sounds, flavors, and traditions, Chengdu Voice brings the spirit of Chengdu closer to people around the world.
            </p>
            
            <div className="pt-8 space-y-2">
              <p className="text-2xl font-serif font-bold text-primary">From sound to taste.</p>
              <p className="text-2xl font-serif font-bold text-primary">From Chengdu to your home.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
            >
              Bring Chengdu Home
            </a>
            <a
              href="/free-sounds"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-secondary text-secondary rounded-xl font-medium hover:bg-secondary hover:text-white transition-all"
            >
              Hear Chengdu Sounds
            </a>
          </div>
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
              <p className="text-gray-600">hello@chengduvoice.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
