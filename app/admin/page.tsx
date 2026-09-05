'use client';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, ShoppingBag, BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    paidCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
  });

  useEffect(() => {
    fetch('/api/orders/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err));
  }, []);

  const statCards = [
    { label: '总订单数', value: stats.totalOrders, icon: Package, color: 'bg-black', bgLight: 'bg-gray-50', textColor: 'text-black' },
    { label: '总收入', value: `$${stats.totalRevenue}`, icon: BarChart3, color: 'bg-green-600', bgLight: 'bg-green-50', textColor: 'text-green-600' },
    { label: '待处理', value: stats.pendingCount, icon: TrendingUp, color: 'bg-yellow-600', bgLight: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: '已送达', value: stats.deliveredCount, icon: Users, color: 'bg-red-600', bgLight: 'bg-red-50', textColor: 'text-red-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">管理控制台</h1>
          <p className="text-gray-600 mt-1">欢迎回来, {user?.username}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">今天</p>
          <p className="font-bold text-gray-800">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgLight} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-black" />
            最近订单
          </h2>
          <div className="space-y-4">
            {[
              { id: 'ORD-004', customer: 'Sophie Laurent', amount: 85.98, status: '待处理', country: 'France' },
              { id: 'ORD-003', customer: 'Marcus Weber', amount: 125.94, status: '已付款', country: 'Germany' },
              { id: 'ORD-002', customer: 'Emily Davis', amount: 299.99, status: '已发货', country: 'United Kingdom' },
              { id: 'ORD-001', customer: 'John Smith', amount: 148.95, status: '已送达', country: 'United States' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-gray-800">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customer} - {order.country}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">${order.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === '待处理' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === '已付款' ? 'bg-amber-100 text-gray-800' :
                    order.status === '已发货' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-black" />
            最近博客文章
          </h2>
          <div className="space-y-4">
            {[
              { id: '1', title: '成都茶文化', category: '文化', date: '2026-07-20' },
              { id: '2', title: '川菜', category: '美食', date: '2026-07-18' },
              { id: '3', title: '宽窄巷子', category: '旅行', date: '2026-07-15' },
              { id: '4', title: '蜀绣', category: '艺术', date: '2026-07-12' },
            ].map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-gray-800">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.date} - {post.category}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-amber-100 text-gray-800 text-xs rounded-lg hover:bg-black hover:text-white transition-colors">
                    编辑
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
