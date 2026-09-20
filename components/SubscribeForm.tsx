'use client';
import { useState } from 'react';
import { Check, Gift } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter-homepage' }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {subscribed ? (
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">You&apos;re on the list.</span>
          </div>
          <div className="inline-block border-2 border-dashed border-primary/70 rounded-lg px-8 py-5">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest text-white/60">Your welcome code</span>
            </div>
            <span className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-white">WELCOME10</span>
            <p className="text-white/50 text-xs mt-2">10% off your first order &middot; also sent to your inbox</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? 'Sending...' : 'Get 10% Off'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <p className="text-white/40 text-xs mt-3">
            New design votes, studio stories and pre-order access. No spam, unsubscribe anytime.
          </p>
        </form>
      )}
    </>
  );
}
