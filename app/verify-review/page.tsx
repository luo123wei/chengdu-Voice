'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function ReviewVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyReview = async () => {
      try {
        const res = await fetch('/api/reviews/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewId: token }),
        });

        if (res.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push('/shop');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verifyReview();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          {status === 'loading' && (
            <div>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">验证中...</h1>
              <p className="text-gray-500">正在验证您的评价，请稍候</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">验证成功！</h1>
              <p className="text-gray-500 mb-6">您的评价已正式发布，感谢您的反馈！</p>
              <p className="text-sm text-gray-400">3秒后将自动跳转...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">验证失败</h1>
              <p className="text-gray-500 mb-6">链接无效或已过期，请重新提交评价</p>
              <button
                onClick={() => router.push('/shop')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                返回商店
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function VerifyReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ReviewVerificationContent />
    </Suspense>
  );
}