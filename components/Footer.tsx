import { Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-serif text-xl font-bold">成</span>
              </div>
              <div>
                <span className="text-xl font-serif font-bold">Chengdu Voice</span>
                <p className="text-sm text-gray-400 font-serif">成都之音</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Experience the authentic voice of Chengdu. We bring the best of Chinese traditional culture to the world, blending Eastern elegance with Western aesthetics.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-primary transition-colors">Discover</Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors">Taste</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">About</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Chengdu, Sichuan, China</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4 text-primary" />
                <span>kylw02@outlook.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>2026 Chengdu Voice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
