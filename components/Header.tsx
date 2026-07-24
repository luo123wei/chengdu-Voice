'use client';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Search, Globe, User } from 'lucide-react';
import Link from 'next/link';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchCartCount();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      const count = (data.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const navLinks = [
    { name: { en: 'Home', zh: '首页' }, href: '/' },
    { name: { en: 'Discover', zh: '探索' }, href: '/blog' },
    { name: { en: 'Taste', zh: '品味' }, href: '/shop' },
    { name: { en: 'Free Sounds', zh: '免费声音' }, href: '/free-sounds' },
    { name: { en: 'About', zh: '关于' }, href: '/about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-serif text-xl font-bold">成</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold text-secondary">Chengdu Voice</span>
              <span className="text-xs text-primary/80 font-serif hidden sm:block">成都之音</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink hover:text-primary font-medium transition-colors relative group"
              >
                {link.name[language]}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5 text-secondary" />
            </button>
            
            <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors relative">
              <Search className="w-5 h-5 text-secondary" />
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium text-secondary hidden sm:block">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-secondary hidden sm:block">Sign In</span>
              </Link>
            )}
            
            <button
              onClick={() => {
                setIsCartOpen(true);
                fetchCartCount();
              }}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-secondary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <Link href="/admin" className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors hidden sm:block">
              Admin
            </Link>

            <button
              className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-cream border-t border-primary/20">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-ink hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name[language]}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block py-2 text-white bg-secondary rounded-lg text-center font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}