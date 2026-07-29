'use client';
import { useState, useEffect } from 'react';
import { Mail, Lock, Package, Clock, CheckCircle, Truck, ChevronRight, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sentCode, setSentCode] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.email);
    }
  }, []);

  const fetchOrders = async (userEmail: string) => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const userOrders = data.filter((order: any) => order.email.toLowerCase() === userEmail.toLowerCase());
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setError('');
    setIsSending(true);
    
    try {
      // First, wake up the server (it might be sleeping on Render free tier)
      try {
        await fetch('/api/products', { method: 'GET', cache: 'no-store' });
      } catch (e) {
        // Ignore, just a warmup attempt
      }
      
      const controller = new abortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `服务器错误: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setSentCode(true);
        setError('');
      } else {
        setError(data.error || '发送验证码失败');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('请求超时，服务器可能正在重启。请等待1分钟后重试');
      } else {
        setError(error.message || '发送验证码失败，请重试');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !code) {
      setError('Please enter email and verification code');
      return;
    }

    setError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        fetchOrders(data.user.email);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setOrders([]);
    setEmail('');
    setCode('');
    setSentCode(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'paid':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-amber-100 text-amber-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="pt-24 pb-12">
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-secondary mb-2">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-600">
                {isLoginMode ? 'Sign in to view your orders' : 'Create an account to track your orders'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {sentCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter verification code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {sentCode && !error && (
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm">
                    ✓ 验证码已发送到你的邮箱，请查收
                  </div>
                )}

                {!sentCode ? (
                  <button
                    onClick={handleSendCode}
                    disabled={isSending}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Verification Code
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyCode}
                    disabled={isVerifying}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>
                )}

                {!sentCode && (
                  <div className="pt-4 text-center">
                    <p className="text-sm text-gray-600">
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                )}

                {sentCode && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => {
                        setSentCode(false);
                        setCode('');
                      }}
                      className="text-primary hover:underline text-sm"
                    >
                      Resend verification code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-secondary">My Account</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name || user.email.split('@')[0]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-secondary mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  My Orders
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't placed any orders yet</p>
                    <Link
                      href="/shop"
                      className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-secondary">{order.id}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusStyle(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-2">{getStatusLabel(order.status)}</span>
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-gray-600">{item.name} x {item.quantity}</span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-gray-600">Total:</span>
                          <span className="text-xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button className="flex items-center gap-1 text-primary hover:underline text-sm">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-secondary mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-secondary">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-secondary">{user.name || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium text-secondary">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-medium text-secondary">{orders.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-amber-500 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-white/80 text-sm mb-4">
                  If you have any questions about your orders, please contact our support team.
                </p>
                <a
                  href="mailto:hello@chengduvoice.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}