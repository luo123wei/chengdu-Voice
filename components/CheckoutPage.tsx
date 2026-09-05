'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, Truck, Shield, Check, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useShippingRates, useOrders } from '@/hooks/useDataStore';

interface CartItem {
  productId: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  type: 'physical' | 'digital';
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    shippingMethod: 'standard',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const { rates: shippingRates } = useShippingRates();
  const { addOrder } = useOrders();
  const [currentOrderId, setCurrentOrderId] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoadingCart(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'all' }),
      });
      await res.json();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const createUserOnOrder = async (email: string, name: string) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const hasPhysicalProducts = cartItems.some(item => item.type === 'physical');
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const countryRates = shippingRates.find(r => r.country === formData.country) || shippingRates.find(r => r.country === 'Other') || shippingRates[0];
  const baseShipping = formData.shippingMethod === 'standard' ? countryRates.standard : countryRates.express;
  const isFreeShipping = hasPhysicalProducts && subtotal >= countryRates.freeThreshold;
  const shipping = hasPhysicalProducts ? (isFreeShipping ? 0 : baseShipping) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOrderConfirmation = async (newOrderNumber: string) => {
    try {
      const items = cartItems.map(item => ({
        name: item.name,
        nameEn: item.nameEn,
        price: item.price,
        quantity: item.quantity,
      }));

      await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          orderNumber: newOrderNumber,
          items,
          total,
          shippingMethod: formData.shippingMethod,
        }),
      });

      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all personal information.');
      return;
    }
    if (hasPhysicalProducts && (!formData.address || !formData.city || !formData.country || !formData.postalCode)) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderNumber = `ORD-${Date.now()}`;
      setCurrentOrderId(orderNumber);

      addOrder({
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        country: formData.country,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.nameEn,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      await createUserOnOrder(formData.email, `${formData.firstName} ${formData.lastName}`);
      await clearCart();

      setOrderNumber(orderNumber);
      setIsSubmitted(true);

      // 提交订单后立即发送通知邮件
      sendOrderConfirmation(orderNumber);
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const countries = shippingRates.map(r => r.country);

  if (isLoadingCart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Please add some items to your cart before checking out</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-secondary mb-4">Order Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you! We have received your order.
          </p>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Order Number / 订单号</p>
            <p className="text-xl font-bold text-secondary">{orderNumber}</p>
          </div>

          <div className="bg-gray-50 border border-amber-200 rounded-xl p-6 mb-6 text-left max-w-lg mx-auto">
            <h3 className="font-bold text-amber-900 mb-3">⚠️ Payment Pending / 待付款</h3>
            <p className="text-amber-800 text-sm mb-3">
              <strong>Step 1:</strong> Our customer service team will contact you via email within 24 hours to arrange payment details.
            </p>
            <p className="text-amber-800 text-sm mb-3">
              <strong>Step 2:</strong> After confirming payment, we will ship your order within 24 hours.
            </p>
            <p className="text-amber-800 text-sm">
              <strong>支持付款方式：</strong>PayPal · Payoneer · 国际电汇
            </p>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-sm text-amber-900">
                📧 <strong>Contact / 联系邮箱:</strong><br />
                <a href="mailto:kylw02@outlook.com" className="text-primary hover:underline font-medium">kylw02@outlook.com</a>
              </p>
            </div>
          </div>

          {!emailSent ? (
            <div className="flex items-center justify-center space-x-2 text-black mb-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending order notification...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
              <Check className="w-5 h-5" />
              <span>Order notification has been sent to you and our team.</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-bold mb-2">📦 Next Steps / 后续流程</p>
            <p className="text-sm text-blue-600">
              Please check your email inbox (and spam folder) for our message within 24 hours.
              If you do not hear from us, please contact us directly.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              请在 24 小时内查收邮件（含垃圾箱）。如未收到请直接邮箱联系我们。
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Shop
        </Link>

        <h1 className="text-3xl font-serif font-bold text-secondary mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-secondary mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="+1 234 567 890"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-secondary mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Shipping Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    rows={3}
                    placeholder="123 Main Street, Apt 4B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors appearance-none bg-white cursor-pointer"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>

            {hasPhysicalProducts && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-serif font-bold text-secondary mb-6 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary" />
                  Shipping Method
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-secondary">Standard Shipping</p>
                      <p className="text-sm text-gray-500">5-7 business days</p>
                    </div>
                    <span className="ml-auto font-bold text-primary">${countryRates.standard.toFixed(2)}</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div className="ml-4">
                      <p className="font-medium text-secondary">Express Shipping</p>
                      <p className="text-sm text-gray-500">2-3 business days</p>
                    </div>
                    <span className="ml-auto font-bold text-primary">${countryRates.express.toFixed(2)}</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-secondary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">{item.nameEn}</p>
                      <p className="text-xs text-gray-500 font-serif">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">
                      {hasPhysicalProducts ? 'Free Shipping' : 'Digital Download - No Shipping'}
                    </span>
                  ) : (
                    <span>${shipping.toFixed(2)}</span>
                  )}
                </div>
                {!hasPhysicalProducts && (
                  <div className="text-xs text-black bg-gray-50 p-2 rounded">
                    💡 All items are digital downloads - no shipping required
                  </div>
                )}
                {hasPhysicalProducts && !isFreeShipping && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    🚚 Free shipping available when you spend ${countryRates.freeThreshold.toFixed(2)} or more
                  </div>
                )}
                {hasPhysicalProducts && isFreeShipping && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ Congratulations! You qualify for free shipping
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-secondary pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-secondary mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Payment / 付款方式
              </h2>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-amber-200">
                <p className="text-amber-800 font-medium flex items-start">
                  <Shield className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Customer Service Assisted Checkout</strong><br />
                    <span className="text-gray-800 text-sm">
                      After placing your order, we will contact you via email within 24 hours to arrange payment.
                      We support PayPal, Payoneer and international wire transfer.
                    </span>
                  </span>
                </p>
                <p className="mt-3 text-sm text-gray-800">
                  <strong>提交订单后，客服将在 24 小时内通过邮件与您联系完成付款。</strong><br />
                  支持：PayPal、Payoneer、国际电汇
                </p>
                <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm">
                  <p className="text-amber-800">
                    📧 <strong>Contact Email / 联系邮箱:</strong><br />
                    <a href="mailto:kylw02@outlook.com" className="text-primary hover:underline font-medium">kylw02@outlook.com</a>
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Order...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Place Order - ${total.toFixed(2)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-gray-500 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                Your information is secure and will only be used for order fulfillment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}