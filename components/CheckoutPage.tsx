'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, Truck, Shield, Check, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useShippingRates, useOrders } from '@/hooks/useDataStore';
import PayPalCheckout from './PayPalCheckout';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const IS_SANDBOX = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'sandbox';

interface CartItem {
  productId: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  type: 'physical' | 'digital';
  variantId?: string;
  skuName?: string;
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
  const [paymentResult, setPaymentResult] = useState<'paid' | 'pending'>('pending');
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const paypalOrderNumberRef = useRef('');

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

  const sendOrderConfirmation = async (newOrderNumber: string, paid: boolean) => {
    try {
      const items = cartItems.map(item => ({
        name: item.name,
        nameEn: item.nameEn,
        price: item.price,
        quantity: item.quantity,
        skuName: item.skuName,
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
          shippingMethod: hasPhysicalProducts ? formData.shippingMethod : 'digital',
          paid,
        }),
      });

      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      return 'Please fill in all personal information.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (hasPhysicalProducts && (!formData.address || !formData.city || !formData.country || !formData.postalCode)) {
      return 'Please fill in all shipping address fields.';
    }
    return '';
  };

  // PayPal 按钮点击：先校验表单，再请求后端创建 PayPal 订单
  const handleCreatePayPalOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }
    setError('');

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          nameEn: item.nameEn,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
        })),
        subtotal,
        shipping,
        tax,
        total,
        email: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        shippingMethod: hasPhysicalProducts ? formData.shippingMethod : 'digital',
        shippingAddress: hasPhysicalProducts
          ? {
              fullName: `${formData.firstName} ${formData.lastName}`,
              address: formData.address,
              city: formData.city,
              country: formData.country,
              postalCode: formData.postalCode,
            }
          : undefined,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.orderId) {
      const msg = json.error || 'Could not start PayPal checkout. Please try again.';
      setError(msg);
      throw new Error(msg);
    }

    paypalOrderNumberRef.current = json.orderNumber;
    return { orderId: json.orderId as string, orderNumber: json.orderNumber as string };
  };

  // PayPal 弹窗付款成功且后端已 capture：落库 paid 订单 → 建用户 → 清购物车 → 发邮件
  const handlePayPalPaid = async () => {
    setIsProcessing(true);
    setError('');
    const orderNumber = paypalOrderNumberRef.current || `ORD-${Date.now()}`;
    setCurrentOrderId(orderNumber);

    try {
      await addOrder({
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        country: formData.country,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.nameEn,
          quantity: item.quantity,
          price: item.price,
          skuName: item.skuName,
          variantId: item.variantId,
        })),
        totalAmount: total,
        status: 'paid',
        createdAt: new Date().toISOString(),
      });

      await createUserOnOrder(formData.email, `${formData.firstName} ${formData.lastName}`);
      await clearCart();

      setOrderNumber(orderNumber);
      setPaymentResult('paid');
      setIsSubmitted(true);

      sendOrderConfirmation(orderNumber, true);
    } catch (err) {
      console.error('Failed to finalize paid order:', err);
      // 钱已收但订单落库失败：提示用户联系客服，避免重复扣款
      setError('Your payment was completed, but we could not save the order. Please contact kylw02@outlook.com with your PayPal receipt.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 备选：Payoneer / 电汇等客服辅助结账（订单先挂 pending）
  const handlePlaceOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderNumber = `ORD-${Date.now()}`;
      setCurrentOrderId(orderNumber);

      await addOrder({
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        country: formData.country,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.nameEn,
          quantity: item.quantity,
          price: item.price,
          skuName: item.skuName,
          variantId: item.variantId,
        })),
        totalAmount: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      await createUserOnOrder(formData.email, `${formData.firstName} ${formData.lastName}`);
      await clearCart();

      setOrderNumber(orderNumber);
      setPaymentResult('pending');
      setIsSubmitted(true);

      // 提交订单后立即发送通知邮件
      sendOrderConfirmation(orderNumber, false);
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const countries = shippingRates.map(r => r.country);

  const isFormValid = Boolean(
    formData.firstName &&
    formData.lastName &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.phone &&
    (!hasPhysicalProducts || (formData.address && formData.city && formData.country && formData.postalCode))
  );

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
    const isPaid = paymentResult === 'paid';
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className={`w-20 h-20 ${isPaid ? 'bg-green-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {isPaid
              ? <Check className="w-10 h-10 text-green-600" />
              : <Clock className="w-10 h-10 text-black" />}
          </div>
          <h1 className="text-3xl font-serif font-bold text-secondary mb-4">
            {isPaid ? 'Payment Successful!' : 'Order Submitted!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isPaid
              ? 'Thank you! Your PayPal payment has been received.'
              : 'Thank you! We have received your order.'}
          </p>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Order Number</p>
            <p className="text-xl font-bold text-secondary">{orderNumber}</p>
          </div>

          {isPaid ? (
            <div className="bg-gray-50 border border-green-200 rounded-xl p-6 mb-6 text-left max-w-lg mx-auto">
              <h3 className="font-bold text-green-900 mb-3">✅ Payment Received</h3>
              {hasPhysicalProducts ? (
                <>
                  <p className="text-green-800 text-sm mb-3">
                    <strong>Step 1:</strong> We will prepare and ship your order within 24 hours.
                  </p>
                  <p className="text-green-800 text-sm mb-3">
                    <strong>Step 2:</strong> You will receive a shipping confirmation email with tracking information.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-800 text-sm mb-3">
                    Your digital order will be delivered to <strong>{formData.email}</strong> shortly.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-amber-200 rounded-xl p-6 mb-6 text-left max-w-lg mx-auto">
              <h3 className="font-bold text-amber-900 mb-3">⚠️ Payment Pending</h3>
              <p className="text-amber-800 text-sm mb-3">
                <strong>Step 1:</strong> Our customer service team will contact you via email within 24 hours to arrange payment details.
              </p>
              <p className="text-amber-800 text-sm mb-3">
                <strong>Step 2:</strong> After confirming payment, we will ship your order within 24 hours.
              </p>
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-sm text-amber-900">
                  📧 <strong>Contact Email:</strong><br />
                  <a href="mailto:kylw02@outlook.com" className="text-primary hover:underline font-medium">kylw02@outlook.com</a>
                </p>
              </div>
            </div>
          )}

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
            <p className="text-sm text-blue-800 font-bold mb-2">
              {isPaid ? '📧 What Happens Next' : '📦 Next Steps'}
            </p>
            <p className="text-sm text-blue-600">
              {isPaid
                ? 'Please check your email inbox (and spam folder) for the order confirmation.'
                : 'Please check your email inbox (and spam folder) for our message within 24 hours. If you do not hear from us, please contact us directly.'}
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
                  <div key={`${item.productId}-${item.variantId || ''}`} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-16 h-16 object-contain bg-cream rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-secondary">{item.nameEn}</p>
                      {item.skuName && (
                        <p className="text-xs text-gray-400">{item.skuName}</p>
                      )}
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
              <h2 className="text-xl font-serif font-bold text-secondary mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Payment
              </h2>

              {IS_SANDBOX && PAYPAL_CLIENT_ID && (
                <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-xs font-medium text-amber-800 text-center">
                  Sandbox mode — no real charge
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {PAYPAL_CLIENT_ID ? (
                <>
                  {isProcessing && (
                    <div className="flex items-center justify-center py-3 mb-4 text-black bg-gray-50 rounded-lg">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing your payment...
                    </div>
                  )}

                  <PayPalCheckout
                    createOrder={handleCreatePayPalOrder}
                    onPaid={handlePayPalPaid}
                    onError={setError}
                    disabled={!isFormValid || isProcessing}
                    disabledHint={
                      hasPhysicalProducts
                        ? 'Please complete your personal information and shipping address to enable PayPal.'
                        : 'Please complete your personal information to enable PayPal.'
                    }
                  />

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wide">
                        Other payment methods
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOtherMethods(v => !v)}
                    className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {showOtherMethods
                      ? 'Hide other payment methods'
                      : "Can't use PayPal? Pay via Payoneer / bank transfer"}
                  </button>

                  {showOtherMethods && (
                    <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-amber-200">
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
                      <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm">
                        <p className="text-amber-800">
                          📧 <strong>Contact Email:</strong><br />
                          <a href="mailto:kylw02@outlook.com" className="text-primary hover:underline font-medium">kylw02@outlook.com</a>
                        </p>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </div>
                  )}
                </>
              ) : (
                <>
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
                    <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm">
                      <p className="text-amber-800">
                        📧 <strong>Contact Email:</strong><br />
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
                </>
              )}

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