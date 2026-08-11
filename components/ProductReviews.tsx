'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Check, User, Lock } from 'lucide-react';
import { Review } from '@/data/mockData';

function maskEmail(email: string): string {
  if (!email || email.length < 3) return '*********';
  return email.slice(0, 3) + '******';
}

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  productReviewsCount: number;
}

interface ReviewFormData {
  nickname: string;
  email: string;
  rating: number;
  content: string;
}

export default function ProductReviews({ productId, productRating, productReviewsCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState<ReviewFormData>({
    nickname: '',
    email: '',
    rating: 0,
    content: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(prev => ({ ...prev, email: parsedUser.email || '' }));
    }
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    };
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (!user || !user.email) {
      setHasPurchase(false);
      setIsCheckingPurchase(false);
      return;
    }

    const checkPurchase = async () => {
      const res = await fetch(`/api/reviews?productId=${productId}&email=${encodeURIComponent(user.email)}&checkPurchase=true`);
      const data = await res.json();
      setHasPurchase(data.hasPurchase || false);
      setIsCheckingPurchase(false);
    };
    checkPurchase();
  }, [productId, user]);

  useEffect(() => {
    if (scrollRef.current && reviews.length > 1) {
      const container = scrollRef.current;
      let scrollPosition = 0;
      const scrollSpeed = 1;
      const cardWidth = 300;
      const gap = 20;
      const scrollAmount = cardWidth + gap;

      const scroll = () => {
        try {
          scrollPosition += scrollSpeed;
          if (scrollPosition >= scrollAmount) {
            scrollPosition = 0;
            setReviews((prev) => {
              if (prev.length <= 1) return prev;
              const [first, ...rest] = prev;
              return [...rest, first];
            });
          } else {
            container.scrollLeft = scrollPosition;
          }
        } catch (error) {
          console.error('Auto-scroll error:', error);
        }
      };

      const interval = setInterval(scroll, 50);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !formData.email || !formData.rating || !formData.content) return;

    const newReview: Review = {
      id: Date.now().toString(),
      productId,
      nickname: formData.nickname,
      email: formData.email,
      rating: formData.rating,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      verifiedEmail: false,
    };

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    });

    if (res.ok) {
      setReviews((prev) => [newReview, ...prev]);
      setFormData({ nickname: '', email: '', rating: 0, content: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to submit review');
    }
  };

  const calculateRatingDistribution = () => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(Math.floor(r.rating), 5) - 1;
      if (idx >= 0 && idx < 5) dist[idx]++;
    });
    const total = reviews.length || 1;
    return dist.map((count) => (count / total) * 100);
  };

  const ratingDist = calculateRatingDistribution();

  return (
    <section className="mt-12 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Reviews</h2>
          <p className="text-gray-500">Share your experience with this product</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="relative">
                    <Star
                      className={`w-6 h-6 ${
                        i < Math.floor(productRating)
                          ? 'text-amber-500 fill-amber-500'
                          : i < productRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }`}
                      style={{
                        clipPath:
                          i === Math.floor(productRating) && productRating % 1 !== 0
                            ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                            : 'none',
                      }}
                    />
                  </div>
                ))}
                <span className="text-2xl font-bold text-gray-800">{productRating}</span>
              </div>
              <p className="text-gray-500">Based on {productReviewsCount} reviews</p>
            </div>

            <div className="w-full md:w-80">
              <p className="text-sm text-gray-500 mb-3">Rating Distribution</p>
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${ratingDist[5 - star]}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {reviews.filter((r) => Math.floor(r.rating) === star).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Reviews</h3>
            <p className="text-sm text-gray-500">Scroll horizontally to view more</p>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-72 bg-white rounded-xl p-5 shadow-md border border-gray-100 snap-center"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{review.nickname}</p>
                      <p className="text-xs text-gray-400">{maskEmail(review.email)}</p>
                      {review.verified && (
                        <span className="flex items-center text-xs text-green-600 mt-0.5">
                          <Check className="w-3 h-3 mr-1" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating)
                            ? 'text-amber-500 fill-amber-500'
                            : i < review.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                        }`}
                        style={{
                          clipPath:
                            i === Math.floor(review.rating) && review.rating % 1 !== 0
                              ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                              : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">{review.content}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Write a Review</h3>

          {isCheckingPurchase ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500">Checking purchase history...</span>
            </div>
          ) : hasPurchase ? (
            <>
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700">Thank you for your review! A verification email has been sent to your inbox. Your review will appear once verified.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nickname *
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="Enter your nickname"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="For verification"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                          formData.rating === rating
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            formData.rating >= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                        <span className="text-sm font-medium">{rating}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Content * ({formData.content.length}/300)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: e.target.value.slice(0, 300),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                    rows={4}
                    placeholder="Share your experience (max 300 characters)..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors"
                >
                  Submit Review
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    <strong>Review Process:</strong> After submission, we will send a verification email to confirm your review.
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Review Privilege Required</h4>
              <p className="text-gray-500 mb-4 max-w-md">
                You must purchase this product before leaving a review. Only verified buyers can share their experiences.
              </p>
              {!user ? (
                <a
                  href="/account"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  Sign In to Check Purchase
                </a>
              ) : (
                <a
                  href="/shop"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  Shop Now
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
