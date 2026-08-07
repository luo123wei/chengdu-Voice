'use client';
import { useState, useEffect, useCallback } from 'react';
import { products as defaultProducts, blogPosts as defaultBlogs, orders as defaultOrders } from '@/data/mockData';
import type { Product, BlogPost, Order, ShippingRate } from '@/data/mockData';

export function useProducts(useMockFallback = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (useMockFallback) {
          setProducts(defaultProducts);
        }
        setLoading(false);
      })
      .catch(() => {
        if (useMockFallback) {
          setProducts(defaultProducts);
        }
        setLoading(false);
      });
  }, [useMockFallback]);

  const refreshProducts = useCallback(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      });
  }, []);

  const saveProduct = useCallback(async (product: Product) => {
    console.log('PUT /api/products - sending:', JSON.stringify(product));
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    console.log('PUT response - status:', res.status);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('PUT error response:', err);
      throw new Error(err.error || `保存失败 (HTTP ${res.status})`);
    }
    const result = await res.json();
    console.log('PUT success:', result);
    await refreshProducts();
  }, [refreshProducts]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '添加失败');
    }
    await refreshProducts();
  }, [refreshProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    });
    await refreshProducts();
  }, [refreshProducts]);

  return { products, loading, saveProduct, updateProduct: saveProduct, addProduct, deleteProduct, refreshProducts };
}

export function useBlogs(includeScheduled = false) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = includeScheduled ? '/api/blogs?includeScheduled=true' : '/api/blogs';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setBlogs(data.length > 0 ? data : defaultBlogs);
        setLoading(false);
      })
      .catch(() => {
        setBlogs(defaultBlogs);
        setLoading(false);
      });
  }, [includeScheduled]);

  const refreshBlogs = useCallback(() => {
    const url = includeScheduled ? '/api/blogs?includeScheduled=true' : '/api/blogs';
    fetch(url)
      .then(res => res.json())
      .then(data => setBlogs(data));
  }, [includeScheduled]);

  const saveBlog = useCallback(async (blog: BlogPost) => {
    await fetch('/api/blogs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
    });
    refreshBlogs();
  }, [refreshBlogs]);

  const addBlog = useCallback(async (blog: Omit<BlogPost, 'id'>) => {
    await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
    });
    refreshBlogs();
  }, [refreshBlogs]);

  const deleteBlog = useCallback(async (id: string) => {
    await fetch(`/api/blogs?id=${id}`, {
      method: 'DELETE',
    });
    refreshBlogs();
  }, [refreshBlogs]);

  return { blogs, loading, saveBlog, addBlog, deleteBlog, refreshBlogs };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data.length > 0 ? data : defaultOrders);
        setLoading(false);
      })
      .catch(() => {
        setOrders(defaultOrders);
        setLoading(false);
      });
  }, []);

  const refreshOrders = useCallback(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, 'id'>) => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    refreshOrders();
  }, [refreshOrders]);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    refreshOrders();
  }, [refreshOrders]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    refreshOrders();
  }, [refreshOrders]);

  return { orders, loading, addOrder, updateOrderStatus, updateOrder, refreshOrders };
}

export function useSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Chengdu Voice | 成都之音',
    siteDescription: '闭上眼，听成都',
    downloadLink: process.env.NEXT_PUBLIC_DOWNLOAD_LINK || 'https://cdn.example.com/download.zip',
    mailFrom: 'Chengdu Voice <hello@chengduvoice.com>',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    gaMeasurementId: '',
    bannerImage: 'https://picsum.photos/id/1015/1920/1080',
    orderEmailSubjectEn: 'Your Order Has Been Confirmed - Chengdu Voice',
    orderEmailBodyEn: 'Dear {customerName},\n\nThank you for your order! We have received your order #{orderNumber} and will begin processing it within 24 hours.\n\nYour package will be shipped via cross-border logistics and we will send you a tracking number once it is dispatched.\n\nThank you for choosing Chengdu Voice!',
    orderEmailSubjectZh: '您的订单已确认 - 成都之音',
    orderEmailBodyZh: '尊敬的 {customerName}，\n\n感谢您的订单！我们已收到您的订单 #{orderNumber}，将在24小时内开始处理。\n\n您的包裹将通过跨境物流发出，发货后我们会发送物流追踪号码给您。\n\n感谢您选择成都之音！',
    aboutContent: '<h2>Experience Chengdu</h2><p>Through Sound &amp; Flavor</p>',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveSettings = useCallback(async (newSettings: typeof settings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '保存失败');
    }
    setSettings(newSettings);
  }, []);

  return { settings, loading, saveSettings };
}

export function useShippingRates() {
  const defaultRates: ShippingRate[] = [
    { country: 'United States', standard: 4.99, express: 10.99, freeThreshold: 49.99 },
    { country: 'Canada', standard: 6.99, express: 12.99, freeThreshold: 59.99 },
    { country: 'United Kingdom', standard: 5.99, express: 11.99, freeThreshold: 49.99 },
    { country: 'Germany', standard: 5.99, express: 11.99, freeThreshold: 49.99 },
    { country: 'France', standard: 5.99, express: 11.99, freeThreshold: 49.99 },
    { country: 'Italy', standard: 6.99, express: 12.99, freeThreshold: 59.99 },
    { country: 'Spain', standard: 6.99, express: 12.99, freeThreshold: 59.99 },
    { country: 'Australia', standard: 7.99, express: 14.99, freeThreshold: 69.99 },
    { country: 'Japan', standard: 5.99, express: 11.99, freeThreshold: 49.99 },
    { country: 'Other', standard: 9.99, express: 18.99, freeThreshold: 89.99 },
  ];

  const [rates, setRates] = useState<ShippingRate[]>(defaultRates);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shipping')
      .then(res => res.json())
      .then(data => {
        setRates(data.length > 0 ? data : defaultRates);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveRates = useCallback(async (newRates: ShippingRate[]) => {
    await fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRates),
    });
    setRates(newRates);
  }, []);

  return { rates, loading, saveRates };
}