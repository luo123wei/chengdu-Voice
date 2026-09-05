'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw, Check, BookOpen, Globe, ChefHat, FileText } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import { VoteButton, PreorderBlock } from '@/components/IntentButtons';
import { productCategoryLabels } from '@/data/mockData';
import { statusBadge } from '@/lib/productStatus';
import { useProducts } from '@/hooks/useDataStore';

function formatRichText(text: string): string {
  if (!text) return '';
  
  if (text.includes('<p>') || text.includes('<h') || text.includes('<ul') || text.includes('<ol')) {
    return text;
  }
  
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.match(/^\d+\.\s/)) {
      const items = p.split(/\n/).filter(item => item.trim());
      return `<ol>${items.map(item => `<li>${item.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
    }
    if (p.match(/^[\-\*•]\s/)) {
      const items = p.split(/\n/).filter(item => item.trim());
      return `<ul>${items.map(item => `<li>${item.replace(/^[\-\*•]\s*/, '')}</li>`).join('')}</ul>`;
    }
    return `<p>${p}</p>`;
  }).join('');
}

export default function ProductDetailPage() {
  const params = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === params.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-secondary mb-4">Product Not Found</h1>
            <Link href="/shop" className="text-primary hover:underline">
              Return to Taste
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        alert(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Taste
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-cream">
                <img
                  src={product.images[selectedImage]}
                  alt={product.nameEn}
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.nameEn} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="bg-cream/30 rounded-xl p-6">
                <h4 className="font-bold text-secondary mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Origin
                </h4>
                <p className="text-gray-600 text-sm">
                  Chengdu, Sichuan Province, China
                </p>
              </div>

              {product.descriptionEn && (
                <div className="bg-cream/30 rounded-xl p-6 mt-6">
                  <h4 className="font-bold text-secondary mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Product Details
                  </h4>
                  <div
                    className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatRichText(product.descriptionEn) }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {productCategoryLabels[product.category as keyof typeof productCategoryLabels]?.en || product.category}
                </span>
                {product.status && product.status !== 'on-sale' && (
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${statusBadge(product).cls}`}>
                    {statusBadge(product).label}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                {product.nameEn}
              </h1>
              <p className="text-lg text-gray-500 mb-4">{product.name}</p>

              {product.reviews > 0 && (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-gold fill-gold' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">{product.rating}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{product.reviews} reviews</span>
                </div>
              )}

              {product.story && product.status === 'design' && (
                <div className="border-l-2 border-gray-200 pl-4 mb-6">
                  <p className="text-gray-600 text-sm leading-relaxed italic">{product.story}</p>
                </div>
              )}

              {/* ===== 投票中:无价格无加购,投票决定生产 ===== */}
              {product.status === 'design' && (
                <div className="mb-6">
                  <VoteButton productId={product.id} initialVotes={product.votesCount || 0} size="detail" />
                </div>
              )}

              {/* ===== 预售:价格 + 预订意向 ===== */}
              {product.status === 'preorder' && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl font-bold text-primary">${product.price}</span>
                    <span className="text-sm text-gray-400">预售价格 · Pre-order price</span>
                  </div>
                  <PreorderBlock product={product} />
                </div>
              )}

              {/* ===== 在售:常规购买流程 ===== */}
              {(!product.status || product.status === 'on-sale') && (
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl font-bold text-primary">${product.price}</span>
                    {product.unit && product.unitType && (
                      <span className="text-lg text-gray-500">/ {product.unit}{product.unitType}</span>
                    )}
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                  </div>

                  <div className="bg-cream/50 rounded-xl p-6 mb-6">
                    <p className="text-gray-700 font-medium italic text-lg">
                      Bring a piece of Chengdu craft home.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div>
                      <span className="text-gray-600 mb-2 block">Quantity</span>
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-6 py-3 font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 mb-2 block">Stock</span>
                      <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-accent'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 ${
                      addedSuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    } disabled:opacity-70`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-6 h-6" />
                        Added to Cart!
                      </>
                    ) : isAdding ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        Add to Cart - ${(product.price * quantity).toFixed(2)}
                      </>
                    )}
                  </button>
                </>
              )}

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-8 h-8 text-primary mx-auto mb-2" />
                  <span className="text-sm text-gray-600">30 Day Return</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 mb-12 bg-cream/30 rounded-xl p-8">
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6 text-center">Discover the Story</h2>
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('story')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'story'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                The Story
              </button>
              <button
                onClick={() => setActiveTab('culture')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'culture'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Globe className="w-5 h-5" />
                Cultural Significance
              </button>
              <button
                onClick={() => setActiveTab('use')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'use'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChefHat className="w-5 h-5" />
                How to Use
              </button>
            </div>
            
            <div className="py-6">
              {activeTab === 'story' && (
                <div className="max-w-3xl mx-auto">
                  <div className="prose prose-lg">
                    {product.story ? (
                      <div 
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatRichText(product.story) }}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {product.descriptionEn}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'culture' && (
                <div className="max-w-3xl mx-auto">
                  <div className="prose prose-lg">
                    {product.culture ? (
                      <div 
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatRichText(product.culture) }}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        This piece is designed in Chengdu and carries the city&apos;s everyday warmth — the slow mornings, the tea houses, the lightness of a panda&apos;s afternoon. It is made in small batches by local makers, and every one is checked by hand before it reaches you.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'use' && (
                <div className="max-w-3xl mx-auto">
                  <div className="prose prose-lg">
                    {product.howToUse ? (
                      <div 
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatRichText(product.howToUse) }}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Use it every day — that&apos;s what it is made for. Keep it on your desk, carry it in your bag, or give it to someone who misses Chengdu. Small marks and imperfections from hand-making are part of the piece, and part of the city it comes from.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <ProductReviews
          productId={product.id}
          productRating={product.rating}
          productReviewsCount={product.reviews}
        />
      </section>

      <Footer />
    </div>
  );
}
