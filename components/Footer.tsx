import { Mail, MapPin, Instagram } from 'lucide-react';
import Link from 'next/link';

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 12.017.026z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-serif text-xl font-bold">V</span>
            </div>
            <div>
              <span className="text-xl font-serif font-bold">Voice Culture</span>
              <p className="text-sm text-gray-400 font-serif">Chengdu Design Studio</p>
            </div>
          </div>
          <p className="text-gray-400 mb-4 max-w-md">
            A small craft design studio in Chengdu. We turn everyday Chengdu moments into objects on your desk. Designed in Chengdu, shipped worldwide.
          </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/voiceculture.studio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 bg-white/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.pinterest.com/source/voiceculture.world/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="p-2 bg-white/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <PinterestIcon className="w-5 h-5" />
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
                <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors">Works</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-primary transition-colors">Stories</Link>
              </li>
              <li>
                <Link href="/free-sounds" className="text-gray-400 hover:text-primary transition-colors">Sounds</Link>
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
                <span>hello@voiceculture.world</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mb-4">
            <Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
            <span className="text-gray-600">·</span>
            <Link href="/return-refund-policy" className="hover:text-primary transition-colors">Return &amp; Refund Policy</Link>
            <span className="text-gray-600">·</span>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-gray-600">·</span>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span className="text-gray-600">·</span>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <span className="text-gray-600">·</span>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p>© 2026 Voice Culture. All rights reserved.</p>
          <span className="text-gray-500">Chengdu, Sichuan, China · Worldwide shipping · <Link href="/admin" className="text-gray-600 hover:text-gray-400 transition-colors">Admin</Link></span>
        </div>
      </div>
    </footer>
  );
}
