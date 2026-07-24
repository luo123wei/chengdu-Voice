'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw, Check, BookOpen, Globe, ChefHat } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import { productCategoryLabels } from '@/data/mockData';
import { useProducts } from '@/hooks/useDataStore';

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
              Return to Shop
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
            Back to Shop
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
                <p className="text-gray-600 text-sm mb-3">
                  {product.category === 'spice' 
                    ? 'Hanyuan, Sichuan Province, China'
                    : 'Chengdu, Sichuan Province, China'
                  }
                </p>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={product.category === 'spice' 
                      ? 'https://picsum.photos/id/29/600/300'
                      : 'https://picsum.photos/id/1035/600/300'
                    }
                    alt="Origin"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
                {productCategoryLabels[product.category].en}
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                {product.nameEn}
              </h1>
              <p className="text-lg text-gray-500 mb-4">{product.name}</p>

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

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>

              <div className="bg-cream/50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 font-medium italic text-lg">
                  Bring the authentic flavor of Chengdu home.
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

          <div className="mt-12 bg-cream/30 rounded-xl p-8">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {product.category === 'spice' 
                        ? 'From the mountains of Hanyuan, Sichuan pepper has been cultivated for generations. This unique spice carries the essence of Sichuan\'s mountainous terrain and rich culinary heritage. Hanyuan, known as the "home of Sichuan pepper," has ideal climate and soil conditions for growing this precious spice.'
                        : product.descriptionEn
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://picsum.photos/id/1040/400/400"
                      alt="Story"
                      className="rounded-xl w-full h-64 object-cover"
                    />
                  </div>
                </div>
              )}
              {activeTab === 'culture' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center justify-center">
                    <img
                      src="https://picsum.photos/id/1031/400/400"
                      alt="Culture"
                      className="rounded-xl w-full h-64 object-cover"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {product.category === 'spice'
                        ? 'Sichuan pepper is not only a spice. It is part of Chengdu\'s identity. The unique numbing sensation (ma la) is more than just taste - it represents home for people in Sichuan. In traditional Chinese medicine, Sichuan pepper is also valued for its warming properties.'
                        : 'This product embodies the rich cultural traditions of Chengdu, connecting you to centuries of Chinese heritage. Every piece tells a story of craftsmanship and dedication passed down through generations.'
                      }
                    </p>
                  </div>
                </div>
              )}
              {activeTab === 'use' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {product.category === 'spice'
                        ? 'Toast Sichuan pepper lightly before grinding for maximum aroma. Use in stir-fries, soups, and marinades. Pair with chili for the classic Sichuan "ma la" numbing-spicy flavor. For best results, grind just before use to preserve its unique fragrance.'
                        : 'Enjoy this authentic product as part of your daily routine or special occasions. Follow traditional preparation methods for the best experience. Each piece is hand-selected to ensure the highest quality.'
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src="https://picsum.photos/id/1080/400/400"
                      alt="Usage"
                      className="rounded-xl w-full h-64 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        productRating={product.rating}
        productReviewsCount={product.reviews}
      />

      <Footer />
    </div>
  );
}
