'use client';
import { useState } from 'react';
import { Star, Send, Check, User, Mail, Clock, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const mockReviews = [
  {
    id: '1',
    nickname: 'Sarah Chen',
    email: 'sarah@example.com',
    rating: 4.5,
    content: '这款白噪音专辑太棒了！每个场景都让我仿佛身临其境，尤其是茶馆的声音，让我想起了在成都的美好时光。音质非常清晰，强烈推荐！',
    verified: true,
    date: '2026-07-20',
  },
  {
    id: '2',
    nickname: 'Michael Wang',
    email: 'michael@example.com',
    rating: 5,
    content: '完美的产品！10个场景各有特色，雨天的宽窄巷子那个场景特别适合助眠。下载方便，价格合理。',
    verified: true,
    date: '2026-07-18',
  },
  {
    id: '3',
    nickname: 'Lisa Zhang',
    email: 'lisa@example.com',
    rating: 4,
    content: '整体不错，声音很真实。建议可以增加更多场景，比如火锅店里的声音。',
    verified: false,
    date: '2026-07-15',
  },
  {
    id: '4',
    nickname: 'David Liu',
    email: 'david@example.com',
    rating: 5,
    content: '作为一个经常失眠的人，这个专辑改变了我的生活。每晚听着成都的声音入睡，感觉特别安心。',
    verified: true,
    date: '2026-07-12',
  },
  {
    id: '5',
    nickname: 'Emma Li',
    email: 'emma@example.com',
    rating: 4.5,
    content: '非常喜欢这个概念！把成都的声音带到了世界各地。每个场景30分钟刚刚好，可以循环播放。',
    verified: true,
    date: '2026-07-10',
  },
];

export default function ReviewsSketchPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-8 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-secondary mb-4">评价系统设计草图</h1>
          <p className="text-gray-600">产品页面评价系统 - 无需注册 · 邮箱验证 · 订单关联</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">商品评价区域</h2>
                <p className="text-sm text-gray-500">产品详情页底部展示</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-8 h-8 ${i < Math.floor(4.7) ? 'text-black fill-amber-500' : 'text-gray-300'} transition-all`}
                      />
                    ))}
                    <span className="text-2xl font-bold text-secondary">4.7</span>
                  </div>
                  <p className="text-gray-600">基于 128 条评价</p>
                </div>
                <div className="flex gap-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{star}星</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full"
                          style={{ width: star === 5 ? '85%' : star === 4 ? '12%' : star === 3 ? '2%' : '1%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">展示近20天的评价 · 横向滚动</span>
              </div>

              <div className="relative overflow-hidden">
                <div className="flex animate-scroll gap-4 pb-4">
                  {[...mockReviews, ...mockReviews].map((review) => (
                    <div
                      key={review.id + Math.random()}
                      className="flex-shrink-0 w-72 bg-white rounded-xl p-5 shadow-md border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-black" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{review.nickname}</p>
                            {review.verified && (
                              <span className="flex items-center text-xs text-green-600">
                                <Check className="w-3 h-3 mr-1" />
                                已验证购买者
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(review.rating)
                                  ? 'text-black fill-amber-500'
                                  : i < review.rating
                                  ? 'text-black fill-amber-500'
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
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {review.content}
                      </p>
                      <p className="text-xs text-gray-400">{review.date}</p>
                    </div>
                  ))}
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">提交评价表单</h2>
                <p className="text-sm text-gray-500">无需注册，仅需邮箱验证</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户昵称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="请输入您的昵称"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    电子邮箱 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="用于验证评价"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    评分 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 py-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            (hoverRating || rating) >= star
                              ? 'text-black fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评价内容 <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-2">({content.length}/300)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 300))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows={4}
                  placeholder="分享您的使用体验（最多300字符）..."
                  maxLength={300}
                  required
                />
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-black flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">评价流程说明：</p>
                  <p>1. 提交评价后，系统将发送验证邮件到您的邮箱</p>
                  <p>2. 点击邮件中的链接完成验证</p>
                  <p>3. 系统将自动检查该邮箱是否有购买记录，有则显示"已验证购买者"标签</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                提交评价
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">系统流程设计</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">用户提交评价</h3>
              <p className="text-white/80 text-sm">用户填写昵称、邮箱、评分和评价内容，无需注册账号</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">邮箱验证</h3>
              <p className="text-white/80 text-sm">系统发送验证邮件，用户点击链接完成验证后评价才会显示</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">订单关联检查</h3>
              <p className="text-white/80 text-sm">系统自动检查该邮箱是否有购买记录，有则显示"已验证购买者"标签</p>
            </div>
          </div>

          <div className="mt-8 bg-green-600/30 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">购买后自动邀请</h3>
                <p className="text-white/80">用户完成购买后7天，系统自动发送邮件邀请用户写评价，提升评价率</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
