'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {subscribed ? (
        <div className="flex items-center justify-center gap-2 text-green-300">
          <Check className="w-5 h-5" />
          <span className="font-medium">订阅成功！请查收邮件获取下载链接</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入您的邮箱地址"
            className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '发送中...' : '免费订阅'}
          </button>
        </form>
      )}
    </>
  );
}