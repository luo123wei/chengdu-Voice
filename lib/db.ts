import { createClient } from '@supabase/supabase-js';
import { products as defaultProducts, blogPosts as defaultBlogs, orders as defaultOrders } from '@/data/mockData';
import type { Product, BlogPost, Order, ShippingRate, Cart, User, VerificationCode } from '@/data/mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const defaultSettings = {
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
};

const defaultShippingRates: ShippingRate[] = [
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

function mapProduct(row: any): Product {
  return {
    id: String(row.id),
    name: row.name || '',
    nameEn: row.name_en || '',
    description: row.description || '',
    descriptionEn: row.description_en || '',
    price: row.price ? parseFloat(row.price) : 0,
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    category: row.category || 'craft',
    type: row.type || 'physical',
    images: Array.isArray(row.images) ? row.images : [],
    stock: row.stock ? parseInt(row.stock) : 0,
    rating: row.rating ? parseFloat(row.rating) : 0,
    reviews: row.reviews ? parseInt(row.reviews) : 0,
    tags: Array.isArray(row.tags) ? row.tags : [],
    story: row.story || '',
    culture: row.culture || '',
    howToUse: row.how_to_use || '',
  };
}

function mapBlog(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    content: row.content,
    contentEn: row.content_en,
    category: row.category,
    images: row.images || [],
    audio: row.audio,
    video: row.video,
    author: row.author,
    publishDate: row.publish_date,
    views: row.views || 0,
  };
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    country: row.country,
    items: row.items || [],
    totalAmount: parseFloat(row.total_amount),
    status: row.status,
    createdAt: row.created_at,
    shippedAt: row.shipped_at,
    updatedAt: row.updated_at,
    trackingNumber: row.tracking_number,
    carrier: row.carrier,
  };
}

function mapShippingRate(row: any): ShippingRate {
  return {
    country: row.country,
    standard: parseFloat(row.standard),
    express: parseFloat(row.express),
    freeThreshold: parseFloat(row.free_threshold),
  };
}

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    orderIds: row.order_ids || [],
  };
}

export const db = {
  supabase,
  products: {
    getAll: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Failed to get products:', error);
        return defaultProducts;
      }
      return data.length > 0 ? data.map(mapProduct) : defaultProducts;
    },
    getById: async (id: string): Promise<Product | undefined> => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return mapProduct(data);
    },
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
      const { data, error } = await supabase.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        name_en: newProduct.nameEn,
        description: newProduct.description,
        description_en: newProduct.descriptionEn,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        category: newProduct.category,
        type: newProduct.type,
        images: newProduct.images,
        stock: newProduct.stock,
        rating: newProduct.rating,
        reviews: newProduct.reviews,
        tags: newProduct.tags,
        story: newProduct.story,
        culture: newProduct.culture,
        how_to_use: newProduct.howToUse,
      }).select('*').single();
      if (error) {
        console.error('Failed to create product:', error);
        throw error;
      }
      return mapProduct(data);
    },
    update: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.nameEn !== undefined) updateData.name_en = updates.nameEn;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.descriptionEn !== undefined) updateData.description_en = updates.descriptionEn;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.originalPrice !== undefined) updateData.original_price = updates.originalPrice;
      if (updates.category) updateData.category = updates.category;
      if (updates.type) updateData.type = updates.type;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.reviews !== undefined) updateData.reviews = updates.reviews;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.story !== undefined) updateData.story = updates.story;
      if (updates.culture !== undefined) updateData.culture = updates.culture;
      if (updates.howToUse !== undefined) updateData.how_to_use = updates.howToUse;

      const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select('*').single();
      if (error || !data) return null;
      return mapProduct(data);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      return !error;
    },
  },

  blogs: {
    getAll: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase.from('blogs').select('*');
      if (error) {
        console.error('Failed to get blogs:', error);
        return defaultBlogs;
      }
      return data.length > 0 ? data.map(mapBlog) : defaultBlogs;
    },
    getById: async (id: string): Promise<BlogPost | undefined> => {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return mapBlog(data);
    },
    create: async (blog: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
      const newBlog: BlogPost = { ...blog, id: `blog-${Date.now()}` };
      const { data, error } = await supabase.from('blogs').insert({
        id: newBlog.id,
        title: newBlog.title,
        title_en: newBlog.titleEn,
        content: newBlog.content,
        content_en: newBlog.contentEn,
        category: newBlog.category,
        images: newBlog.images,
        audio: newBlog.audio,
        video: newBlog.video,
        author: newBlog.author,
        publish_date: newBlog.publishDate,
        views: newBlog.views,
      }).select('*').single();
      if (error) {
        console.error('Failed to create blog:', error);
        throw error;
      }
      return mapBlog(data);
    },
    update: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.titleEn !== undefined) updateData.title_en = updates.titleEn;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.contentEn !== undefined) updateData.content_en = updates.contentEn;
      if (updates.category) updateData.category = updates.category;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.audio !== undefined) updateData.audio = updates.audio;
      if (updates.video !== undefined) updateData.video = updates.video;
      if (updates.author) updateData.author = updates.author;
      if (updates.publishDate) updateData.publish_date = updates.publishDate;
      if (updates.views !== undefined) updateData.views = updates.views;

      const { data, error } = await supabase.from('blogs').update(updateData).eq('id', id).select('*').single();
      if (error || !data) return null;
      return mapBlog(data);
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      return !error;
    },
  },

  orders: {
    getAll: async (): Promise<Order[]> => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to get orders:', error);
        return defaultOrders;
      }
      return data.length > 0 ? data.map(mapOrder) : defaultOrders;
    },
    getById: async (id: string): Promise<Order | undefined> => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return mapOrder(data);
    },
    create: async (order: Omit<Order, 'id'>): Promise<Order> => {
      const newOrder: Order = { ...order, id: `order-${Date.now()}` };
      const { data, error } = await supabase.from('orders').insert({
        id: newOrder.id,
        customer_name: newOrder.customerName,
        email: newOrder.email,
        country: newOrder.country,
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        status: newOrder.status,
        created_at: newOrder.createdAt,
        shipped_at: newOrder.shippedAt,
        updated_at: newOrder.updatedAt,
        tracking_number: newOrder.trackingNumber,
        carrier: newOrder.carrier,
      }).select('*').single();
      if (error) {
        console.error('Failed to create order:', error);
        throw error;
      }
      return mapOrder(data);
    },
    update: async (id: string, updates: Partial<Order>): Promise<Order | null> => {
      const updateData: any = {};
      if (updates.customerName) updateData.customer_name = updates.customerName;
      if (updates.email) updateData.email = updates.email;
      if (updates.country) updateData.country = updates.country;
      if (updates.items !== undefined) updateData.items = updates.items;
      if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
      if (updates.status) updateData.status = updates.status;
      if (updates.shippedAt !== undefined) updateData.shipped_at = updates.shippedAt;
      if (updates.updatedAt !== undefined) updateData.updated_at = updates.updatedAt;
      if (updates.trackingNumber !== undefined) updateData.tracking_number = updates.trackingNumber;
      if (updates.carrier !== undefined) updateData.carrier = updates.carrier;

      const { data, error } = await supabase.from('orders').update(updateData).eq('id', id).select('*').single();
      if (error || !data) return null;
      return mapOrder(data);
    },
    updateStatus: async (id: string, status: Order['status']): Promise<Order | null> => {
      return db.orders.update(id, { status, updatedAt: new Date().toISOString() });
    },
    getStats: async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) {
        console.error('Failed to get order stats:', error);
        return { totalOrders: 0, totalRevenue: 0, pendingCount: 0, paidCount: 0, shippedCount: 0, deliveredCount: 0 };
      }
      const orders = data.map(mapOrder);
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const paidCount = orders.filter(o => o.status === 'paid').length;
      const shippedCount = orders.filter(o => o.status === 'shipped').length;
      const deliveredCount = orders.filter(o => o.status === 'delivered').length;
      return { totalOrders, totalRevenue, pendingCount, paidCount, shippedCount, deliveredCount };
    },
  },

  settings: {
    get: async () => {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'default').single();
      if (error || !data) return defaultSettings;
      return {
        siteName: data.site_name,
        siteDescription: data.site_description,
        downloadLink: data.download_link,
        mailFrom: data.mail_from,
        appUrl: data.app_url,
        gaMeasurementId: data.ga_measurement_id,
        bannerImage: data.banner_image,
        orderEmailSubjectEn: data.order_email_subject_en,
        orderEmailBodyEn: data.order_email_body_en,
        orderEmailSubjectZh: data.order_email_subject_zh,
        orderEmailBodyZh: data.order_email_body_zh,
      };
    },
    save: async (settings: typeof defaultSettings) => {
      const { error } = await supabase.from('settings').upsert({
        id: 'default',
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        download_link: settings.downloadLink,
        mail_from: settings.mailFrom,
        app_url: settings.appUrl,
        ga_measurement_id: settings.gaMeasurementId,
        banner_image: settings.bannerImage,
        order_email_subject_en: settings.orderEmailSubjectEn,
        order_email_body_en: settings.orderEmailBodyEn,
        order_email_subject_zh: settings.orderEmailSubjectZh,
        order_email_body_zh: settings.orderEmailBodyZh,
      });
      if (error) {
        console.error('Failed to save settings:', error);
        throw error;
      }
    },
  },

  shippingRates: {
    getAll: async (): Promise<ShippingRate[]> => {
      const { data, error } = await supabase.from('shipping_rates').select('*');
      if (error) {
        console.error('Failed to get shipping rates:', error);
        return defaultShippingRates;
      }
      return data.length > 0 ? data.map(mapShippingRate) : defaultShippingRates;
    },
    save: async (rates: ShippingRate[]) => {
      for (const rate of rates) {
        const { error } = await supabase.from('shipping_rates').upsert({
          country: rate.country,
          standard: rate.standard,
          express: rate.express,
          free_threshold: rate.freeThreshold,
        });
        if (error) {
          console.error('Failed to save shipping rate:', error);
        }
      }
    },
  },

  password: {
    get: async () => {
      const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 'password').single();
      if (error || !data) return 'admin123';
      return data.password || 'admin123';
    },
    set: async (password: string) => {
      const { error } = await supabase.from('admin_settings').upsert({
        id: 'password',
        password,
      });
      if (error) {
        console.error('Failed to save password:', error);
        throw error;
      }
    },
  },

  cart: {
    get: async (sessionId: string): Promise<Cart> => {
      const { data, error } = await supabase.from('carts').select('*').eq('id', sessionId).single();
      if (error || !data) {
        return {
          id: sessionId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        id: data.id,
        items: data.items || [],
        updatedAt: data.updated_at,
      };
    },
    save: async (sessionId: string, cart: Cart) => {
      const { error } = await supabase.from('carts').upsert({
        id: sessionId,
        items: cart.items,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Failed to save cart:', error);
        throw error;
      }
    },
    clear: async (sessionId: string) => {
      const { error } = await supabase.from('carts').delete().eq('id', sessionId);
      if (error) {
        console.error('Failed to clear cart:', error);
      }
    },
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Failed to get users:', error);
        return [];
      }
      return data.map(mapUser);
    },
    getById: async (id: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return mapUser(data);
    },
    getByEmail: async (email: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').ilike('email', email.toLowerCase()).single();
      if (error || !data) return undefined;
      return mapUser(data);
    },
    create: async (user: Omit<User, 'id'>): Promise<User> => {
      const newUser: User = { ...user, id: `user-${Date.now()}` };
      const { data, error } = await supabase.from('users').insert({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.createdAt,
        last_login_at: newUser.lastLoginAt,
        order_ids: newUser.orderIds,
      }).select('*').single();
      if (error) {
        console.error('Failed to create user:', error);
        throw error;
      }
      return mapUser(data);
    },
    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const updateData: any = {};
      if (updates.email) updateData.email = updates.email;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.lastLoginAt !== undefined) updateData.last_login_at = updates.lastLoginAt;
      if (updates.orderIds !== undefined) updateData.order_ids = updates.orderIds;

      const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select('*').single();
      if (error || !data) return null;
      return mapUser(data);
    },
    addOrder: async (userId: string, orderId: string): Promise<User | null> => {
      const user = await db.users.getById(userId);
      if (!user) return null;
      if (!user.orderIds.includes(orderId)) {
        user.orderIds.push(orderId);
        return db.users.update(userId, { orderIds: user.orderIds });
      }
      return user;
    },
  },

  verificationCodes: {
    get: async (email: string): Promise<VerificationCode | undefined> => {
      const { data, error } = await supabase.from('verification_codes').select('*').ilike('email', email.toLowerCase()).single();
      if (error || !data) return undefined;
      return {
        email: data.email,
        code: data.code,
        expiresAt: data.expires_at,
      };
    },
    create: async (email: string, code: string): Promise<void> => {
      await supabase.from('verification_codes').delete().ilike('email', email.toLowerCase());
      const { error } = await supabase.from('verification_codes').insert({
        email,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      if (error) {
        console.error('Failed to create verification code:', error);
        throw error;
      }
    },
    delete: async (email: string): Promise<void> => {
      const { error } = await supabase.from('verification_codes').delete().ilike('email', email.toLowerCase());
      if (error) {
        console.error('Failed to delete verification code:', error);
      }
    },
    isValid: async (email: string, code: string): Promise<boolean> => {
      const verificationCode = await db.verificationCodes.get(email);
      if (!verificationCode) return false;
      if (verificationCode.code !== code) return false;
      if (new Date(verificationCode.expiresAt) < new Date()) return false;
      return true;
    },
  },
};