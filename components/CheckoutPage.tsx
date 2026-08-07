'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, Truck, Shield, Check, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [countdown, setCountdown] = useState(10);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paypalOrderId, setPaypalOrderId] = useState('');

  const { rates: shippingRates } = useShippingRates();
  const { addOrder, updateOrderStatus } = useOrders();
  const [currentOrderId, setCurrentOrderId] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const success = searchParams.get('success');
    const cancel = searchParams.get('cancel');
    const token = searchParams.get('token');

    if (success === 'true' && token) {
      handlePayPalSuccess(token);
    } else if (cancel === 'true') {
      setError('Payment was cancelled. Please try again.');
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (isPaymentComplete && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 60000);
      return () => clearTimeout(timer);
    } else if (isPaymentComplete && countdown === 0 && !emailSent) {
      sendOrderConfirmation();
    }
  }, [isPaymentComplete, countdown, emailSent]);

  const sendOrderConfirmation = async () => {
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
          orderNumber,
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

  const createPendingOrder = () => {
    const orderId = `order-${Date.now()}`;
    setCurrentOrderId(orderId);
    
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
    
    return orderId;
  };

  const handlePaymentSuccess = async (newOrderNumber: string) => {
    setOrderNumber(newOrderNumber);
    setIsPaymentComplete(true);
    setIsSubmitted(true);

    await createUserOnOrder(formData.email, `${formData.firstName} ${formData.lastName}`);
    await clearCart();

    if (currentOrderId) {
      updateOrderStatus(currentOrderId, 'paid');
    }
  };

  const handlePayPalSuccess = async (token: string) => {
    try {
      const response = await fetch('/api/payment/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: token }),
      });

      const data = await response.json();

      if (data.success && data.order) {
        const orderNumber = data.order.purchase_units[0].reference_id;
        handlePaymentSuccess(orderNumber);
      } else {
        setError('Payment capture failed. Please contact support.');
      }
    } catch (error) {
      console.error('Failed to capture PayPal payment:', error);
      setError('Payment capture failed. Please contact support.');
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      createPendingOrder();

      const items = cartItems.map(item => ({
        name: item.name,
        nameEn: item.nameEn,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          email: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingMethod: formData.shippingMethod,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Payment creation failed');
        setIsProcessing(false);
        return;
      }

      setPaypalOrderId(data.orderId);

      const approveLink = data.links.find((link: { rel: string }) => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      } else {
        setError('Failed to get PayPal approval link');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Error during payment');
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-secondary mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase!
          </p>
          <div className="bg-amber-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Order Number / 订单号</p>
            <p className="text-xl font-bold text-secondary">{orderNumber}</p>
          </div>

          {!emailSent ? (
            <div className="flex items-center justify-center space-x-2 text-amber-600 mb-6">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Sending confirmation email in {countdown} minutes...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
              <Check className="w-5 h-5" />
              <span>Confirmation email sent!</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-bold mb-2">📦 Shipping Notice / 配送通知</p>
            <p className="text-sm text-blue-600">
              We have received your order and will begin processing within 24 hours. Your package will be shipped via cross-border logistics.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              我们已收到您的订单，将在24小时内开始处理。您的包裹将通过跨境物流发出。
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
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
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
                Payment Method
              </h2>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayPalPayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-6 py-4 bg-[#FFC439] text-[#253B80] rounded-xl font-medium hover:bg-[#F5B800] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <span className="font-bold mr-2">PP</span>
                    Pay with PayPal ${total.toFixed(2)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-gray-500 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                Secure payment with PayPal
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}