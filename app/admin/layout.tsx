'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, ShoppingBag, BarChart3, ArrowLeft, LogOut, Package, Settings, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const navLinks = [
    { name: '控制台', href: '/admin', icon: LayoutDashboard },
    { name: '博客管理', href: '/admin/blogs', icon: FileText },
    { name: '订单管理', href: '/admin/orders', icon: ShoppingBag },
    { name: '产品管理', href: '/admin/products', icon: Package },
    { name: '声音管理', href: '/admin/free-sounds', icon: Music },
    { name: '系统设置', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-secondary text-white fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 hover:text-amber-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>返回站点</span>
              </Link>
              <div className="w-px h-8 bg-white/20 mx-4" />
              <span className="text-lg font-serif font-bold">管理后台</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      pathname === link.href ? 'bg-black' : 'hover:bg-white/10'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <span className="hidden sm:block text-sm">{user.username}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
