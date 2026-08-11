'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Package, Truck, CheckCircle, Clock, Eye, Download, Send, ExternalLink, AlertCircle, Mail, DollarSign, Loader2, MessageSquarePlus, Star } from 'lucide-react';
import { orderStatusLabels } from '@/data/mockData';
import type { Order } from '@/data/mockData';
import { useOrders } from '@/hooks/useDataStore';

const AUTO_DELIVER_DAYS = 20;

export default function AdminOrders() {
  const { orders: orderList, updateOrderStatus, updateOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 联系买家相关状态
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPaymentLink, setContactPaymentLink] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // 代发评论相关状态
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string>('');
  const [reviewNickname, setReviewNickname] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5.0);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    orderList.forEach(order => {
      if (order.status === 'shipped' && order.shippedAt) {
        const shippedDate = new Date(order.shippedAt);
        const autoDeliverDate = new Date(shippedDate.getTime() + AUTO_DELIVER_DAYS * 24 * 60 * 60 * 1000);
        if (currentTime >= autoDeliverDate) {
          updateOrderStatus(order.id, 'delivered');
        }
      }
    });
  }, [currentTime, orderList, updateOrderStatus]);

  const statusOptions = [
    { value: 'all', label: { en: '全部', zh: '全部' } },
    { value: 'pending', label: { en: '待处理', zh: '待处理' } },
    { value: 'paid', label: { en: '已付款', zh: '已付款' } },
    { value: 'shipped', label: { en: '已发货', zh: '已发货' } },
    { value: 'delivered', label: { en: '已送达', zh: '已送达' } },
  ];

  const carrierOptions = [
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'china-post', label: 'China Post' },
    { value: 'ems', label: 'EMS' },
    { value: 'other', label: 'Other' },
  ];

  const countries = ['all', ...new Set(orderList.map((o) => o.country))];

  const filteredOrders = orderList.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesCountry = selectedCountry === 'all' || order.country === selectedCountry;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'paid':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-amber-100 text-amber-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (shippedAt: string | undefined) => {
    if (!shippedAt) return 0;
    const shippedDate = new Date(shippedAt);
    const autoDeliverDate = new Date(shippedDate.getTime() + AUTO_DELIVER_DAYS * 24 * 60 * 60 * 1000);
    const diffTime = autoDeliverDate.getTime() - currentTime.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getCountdownStyle = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-50';
    if (days <= 7) return 'text-amber-600 bg-amber-50';
    return 'text-blue-600 bg-blue-50';
  };

  const handleShipOrder = (orderId: string) => {
    if (!trackingNumber.trim()) {
      alert('请填写物流单号');
      return;
    }

    updateOrder(orderId, {
      status: 'shipped',
      trackingNumber,
      carrier,
      shippedAt: new Date().toISOString(),
    });

    setSelectedOrder((prev) =>
      prev?.id === orderId
        ? { ...prev, status: 'shipped', trackingNumber, carrier, shippedAt: new Date().toISOString() }
        : prev
    );

    setTrackingNumber('');
    setCarrier('');
  };

  const handleMarkDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: 'delivered' } : prev
    );
  };

  const handleMarkPaid = async (orderId: string) => {
    setIsMarkingPaid(true);
    setEmailStatus({ type: '', msg: '' });
    try {
      await updateOrderStatus(orderId, 'paid');
      setSelectedOrder((prev) =>
        prev?.id === orderId ? { ...prev, status: 'paid' } : prev
      );
      setEmailStatus({ type: 'success', msg: '已确认收款，订单状态已更新为「已付款」，买家将收到付款确认邮件。' });
    } catch (err) {
      console.error('Failed to mark order as paid:', err);
      setEmailStatus({ type: 'error', msg: '确认收款失败，请重试。' });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleSendContactEmail = async () => {
    if (!selectedOrder) return;
    if (!contactSubject.trim() || !contactMessage.trim()) {
      setEmailStatus({ type: 'error', msg: '请填写邮件主题和内容' });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus({ type: '', msg: '' });
    try {
      const res = await fetch('/api/orders/contact-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          subject: contactSubject,
          message: contactMessage,
          paymentLink: contactPaymentLink.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '发送失败');
      }
      setEmailStatus({ type: 'success', msg: `邮件已发送至 ${selectedOrder.email}` });
      setContactSubject('');
      setContactMessage('');
      setContactPaymentLink('');
      setShowContactForm(false);
    } catch (err: any) {
      console.error('Failed to send contact email:', err);
      setEmailStatus({ type: 'error', msg: err.message || '邮件发送失败，请重试' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const openReviewForm = () => {
    setShowReviewForm(true);
    setReviewSubmitStatus({ type: '', msg: '' });
    // 默认选订单里的第一个产品
    if (selectedOrder && selectedOrder.items && selectedOrder.items.length > 0) {
      setReviewProductId(selectedOrder.items[0].productId);
    }
    // 默认用买家的用户名前几位做昵称
    if (selectedOrder?.customerName) {
      setReviewNickname(selectedOrder.customerName.split(' ')[0]);
    } else if (selectedOrder?.email) {
      setReviewNickname(selectedOrder.email.split('@')[0]);
    }
    setReviewRating(5.0);
    setReviewContent('');
  };

  const handleSubmitAdminReview = async () => {
    if (!selectedOrder) return;
    if (!reviewProductId.trim() || !reviewNickname.trim() || !reviewContent.trim()) {
      setReviewSubmitStatus({ type: 'error', msg: '请填写产品、昵称和评论内容' });
      return;
    }
    setIsSubmittingReview(true);
    setReviewSubmitStatus({ type: '', msg: '' });
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: reviewProductId,
          nickname: reviewNickname,
          email: selectedOrder.email || 'admin@chengduvoice.world',
          rating: reviewRating,
          content: reviewContent,
        }),
      });
      if (res.ok) {
        setReviewSubmitStatus({ type: 'success', msg: '评论添加成功！商品评分和评论数已同步更新。' });
        setShowReviewForm(false);
        setReviewContent('');
      } else {
        const data = await res.json().catch(() => ({}));
        setReviewSubmitStatus({ type: 'error', msg: data.error || '提交失败，请重试。' });
      }
    } catch (err) {
      console.error('Admin review submit failed:', err);
      setReviewSubmitStatus({ type: 'error', msg: '网络错误，请重试。' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openContactForm = () => {
    setShowContactForm(true);
    setEmailStatus({ type: '', msg: '' });
    // 预填默认内容
    if (selectedOrder) {
      setContactSubject(`Payment Instructions for Order ${selectedOrder.id}`);
      setContactMessage(`Dear ${selectedOrder.customerName},\n\nThank you for your order #${selectedOrder.id}. To complete your payment, please use the payment link below.\n\nWe support PayPal, Payoneer and international wire transfer. If you have any questions, please reply to this email.\n\nBest regards,\nChengdu Voice Team`);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || '');
    setShowContactForm(false);
    setEmailStatus({ type: '', msg: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">订单管理</h1>
          <p className="text-gray-600 mt-1">查看和管理客户订单</p>
        </div>
        <button className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all shadow-lg">
          <Download className="w-5 h-5 mr-2" />
          导出订单
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors appearance-none bg-white cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label.en}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="pl-4 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors appearance-none bg-white cursor-pointer"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country === 'all' ? '所有国家' : country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-medium">订单编号</th>
              <th className="px-6 py-4 text-left font-medium">客户</th>
              <th className="px-6 py-4 text-left font-medium">国家</th>
              <th className="px-6 py-4 text-left font-medium">总计</th>
              <th className="px-6 py-4 text-left font-medium">状态</th>
              <th className="px-6 py-4 text-left font-medium">倒计时</th>
              <th className="px-6 py-4 text-left font-medium">日期</th>
              <th className="px-6 py-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const daysRemaining = order.status === 'shipped' ? getDaysRemaining(order.shippedAt) : 0;
              return (
                <tr key={order.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.country}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{statusOptions.find(o => o.value === order.status)?.label.en}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'shipped' ? (
                      <div className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getCountdownStyle(daysRemaining)}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{daysRemaining}天自动确认</span>
                      </div>
                    ) : order.status === 'delivered' ? (
                      <span className="text-sm text-gray-400">-</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-amber-600"
                        title="查看详情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openOrderDetail(order)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
                            title="确认已收款"
                          >
                            <DollarSign className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openOrderDetail(order)}
                            className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                            title="联系买家"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                          title="发货"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      )}
                      {order.status === 'shipped' && daysRemaining > 0 && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
                          title="提前确认送达"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-800">订单详情</h2>
              <p className="text-gray-600 mt-1">{selectedOrder.id}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">客户信息</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium">姓名:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-medium">邮箱:</span> {selectedOrder.email}</p>
                    <p><span className="font-medium">国家:</span> {selectedOrder.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">订单状态</h3>
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getStatusStyle(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2 font-medium">{statusOptions.find(o => o.value === selectedOrder.status)?.label.en}</span>
                  </div>
                  {selectedOrder.status === 'shipped' && selectedOrder.shippedAt && (
                    <p className="text-sm text-gray-500 mt-2">发货时间: {formatDate(selectedOrder.shippedAt)}</p>
                  )}
                </div>
              </div>

              {selectedOrder.status === 'shipped' && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-800 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      自动确认倒计时
                    </h3>
                    <span className={`text-lg font-bold ${getCountdownStyle(getDaysRemaining(selectedOrder.shippedAt))}`}>
                      {getDaysRemaining(selectedOrder.shippedAt)} 天
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">
                    订单将在 {AUTO_DELIVER_DAYS} 天后自动确认送达（海外物流难以实时监控）
                  </p>
                  {getDaysRemaining(selectedOrder.shippedAt) <= 3 && (
                    <div className="mt-3 flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">即将自动确认，请确认客户是否已收到商品</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-bold text-gray-800 mb-3">订单商品</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-amber-600">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>小计</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>运费</span>
                  <span>$5.99</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>税费</span>
                  <span>${(selectedOrder.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>总计</span>
                  <span>${(selectedOrder.totalAmount + 5.99 + selectedOrder.totalAmount * 0.08).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    待处理订单 - 等待付款
                  </h3>
                  <p className="text-sm text-amber-700 mb-4">
                    买家已提交订单但尚未付款。你可以：
                    <br />1. <strong>联系买家</strong> - 发送付款链接/收款码给买家
                    <br />2. <strong>确认已收款</strong> - 收到付款后标记为已付款（买家将自动收到确认邮件）
                  </p>

                  {emailStatus.msg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      emailStatus.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {emailStatus.msg}
                    </div>
                  )}

                  {!showContactForm ? (
                    <div className="space-y-3">
                      <button
                        onClick={openContactForm}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        <span>联系买家 / 发送付款链接</span>
                      </button>
                      <button
                        onClick={() => handleMarkPaid(selectedOrder.id)}
                        disabled={isMarkingPaid}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMarkingPaid ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>处理中...</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            <span>确认已收款</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-gray-500 mb-1">收件人</p>
                        <p className="text-sm font-medium text-gray-800">{selectedOrder.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">邮件主题</label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                          placeholder="输入邮件主题"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">邮件内容</label>
                        <textarea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 resize-none"
                          placeholder="输入邮件内容（支持换行）"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          付款链接（可选）
                        </label>
                        <input
                          type="url"
                          value={contactPaymentLink}
                          onChange={(e) => setContactPaymentLink(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500"
                          placeholder="https://paypal.me/... 或其他收款链接"
                        />
                        <p className="text-xs text-gray-500 mt-1">填入 PayPal / Payoneer 收款链接，买家可点击直接付款</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSendContactEmail}
                          disabled={isSendingEmail}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingEmail ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>发送中...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>发送邮件</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowContactForm(false)}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedOrder.status === 'paid' && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    发货操作
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">物流公司</label>
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="">选择物流公司</option>
                        {carrierOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">物流单号</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="输入物流单号"
                      />
                    </div>
                    <button
                      onClick={() => handleShipOrder(selectedOrder.id)}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      <span>确认发货</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'shipped' && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    物流信息
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">物流公司:</span> {carrierOptions.find(c => c.value === selectedOrder.carrier)?.label || '未指定'}</p>
                    <div className="flex items-center">
                      <span className="font-medium">物流单号:</span>
                      <span className="ml-2 font-mono">{selectedOrder.trackingNumber || '未填写'}</span>
                      {selectedOrder.trackingNumber && (
                        <a
                          href={`https://www.17track.net/zh-cn?nums=${selectedOrder.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
                          title="追踪物流"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </a>
                      )}
                    </div>
                  </div>
                  {getDaysRemaining(selectedOrder.shippedAt) > 0 && (
                    <button
                      onClick={() => handleMarkDelivered(selectedOrder.id)}
                      className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>提前确认订单已送达</span>
                    </button>
                  )}
                </div>
              )}

              {selectedOrder.status === 'delivered' && (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-800">订单已完成</h3>
                        <p className="text-sm text-green-600">客户已收到商品，订单流程结束</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    {!showReviewForm ? (
                      <button
                        onClick={openReviewForm}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquarePlus className="w-5 h-5" />
                        <span>为买家代发好评</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-blue-800 flex items-center gap-2">
                            <MessageSquarePlus className="w-5 h-5" />
                            添加代发好评
                          </h4>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                        </div>

                        {reviewSubmitStatus.msg && (
                          <div className={`p-3 rounded-lg text-sm border ${
                            reviewSubmitStatus.type === 'success'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {reviewSubmitStatus.msg}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            选择产品 *
                          </label>
                          <select
                            value={reviewProductId}
                            onChange={(e) => setReviewProductId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            {(selectedOrder.items || []).map((item: any, idx: number) => (
                              <option key={idx} value={item.productId}>
                                {item.nameEn || item.name || item.productId} — {item.quantity}件
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            评论者昵称 *
                          </label>
                          <input
                            type="text"
                            value={reviewNickname}
                            onChange={(e) => setReviewNickname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Emma or James"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            邮箱自动使用：{selectedOrder.email ? (
                              selectedOrder.email.slice(0, 3) + '******'
                            ) : 'admin******'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            评分 *
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[4, 4.5, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setReviewRating(rating)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                                  reviewRating === rating
                                    ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{rating}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            评论内容 * ({reviewContent.length}/300)
                          </label>
                          <textarea
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value.slice(0, 300))}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="写一条真实感的好评，如：包装很仔细，香气非常棒，朋友推荐的牌子，质量很不错，下次还会回购..."
                          />
                        </div>

                        <button
                          onClick={handleSubmitAdminReview}
                          disabled={isSubmittingReview}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>提交中...</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-5 h-5" />
                              <span>提交评论</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}