export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  category: 'culture' | 'food' | 'travel' | 'art';
  images: string[];
  audio?: string;
  video?: string;
  author: string;
  publishDate: string;
  views: number;
  scheduledAt?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  category: 'stationery' | 'home' | 'decor' | 'toy';
  type: 'physical' | 'digital';
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  unit?: number;
  unitType?: string;
  story?: string;
  culture?: string;
  howToUse?: string;
  // 文创工作室:产品生命周期与市场调研
  status?: 'design' | 'preorder' | 'on-sale';
  votesCount?: number;
  preorderEnd?: string;   // 预售截止时间(ISO,后台设置)
  onSaleAt?: string;      // 正式开售时间(ISO,后台设置)
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  country: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
  shippedAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  productId: string;
  nickname: string;
  email: string;
  rating: number;
  content: string;
  date: string;
  verified: boolean;
  verifiedEmail?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  type: 'physical' | 'digital';
}

export interface Cart {
  id: string;
  items: CartItem[];
  updatedAt: string;
}

export interface ShippingRate {
  country: string;
  standard: number;
  express: number;
  freeThreshold: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLoginAt?: string;
  orderIds: string[];
}

export interface VerificationCode {
  email: string;
  code: string;
  expiresAt: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'panda-egg-making-of',
    title: '熊猫蛋仔诞生记:一颗蛋里怎么住进一只熊猫',
    titleEn: 'Making of Panda Egg: How a Panda Moved Into an Egg',
    content: '第一款作品,我们想做一个"剥开有惊喜"的东西。蛋是最日常的食物,熊猫是成都最松弛的居民——把它俩放在一起,就有了熊猫蛋仔。这篇文章记录了从草图、3D 打样到釉烧的全过程,以及我们为什么坚持首批限量编号。',
    contentEn: 'For our first piece, we wanted something with a surprise inside. The egg is the most everyday food, and the panda is Chengdu\'s most relaxed resident. This post documents the journey from sketch to 3D prototype to glazed ceramic, and why the first batch is individually numbered.',
    category: 'art',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=designer%20desk%20with%20ceramic%20panda%20egg%20sketches%20and%20clay%20prototypes%2C%20black%20and%20white%20minimal%20workshop&image_size=landscape_16_9',
    ],
    author: 'Chengdu Craft Studio',
    publishDate: '2026-08-28',
    views: 2341,
  },
  {
    id: '2',
    slug: 'why-we-let-you-vote',
    title: '为什么下一款做什么,由你投票决定',
    titleEn: 'Why You Get to Vote on What We Make Next',
    content: '小工作室最怕自嗨:我们觉得可爱的,未必是你想放在桌上的。所以我们把设计稿提前展出,票数达标才开模生产。这篇文章讲讲"投票-预售-生产"的节奏,以及你的一票如何决定一款产品的命运。',
    contentEn: 'A small studio\'s biggest fear is making things nobody wants. So we show concepts early, and only open molds when votes hit the goal. This post explains our vote → pre-order → production rhythm, and how one vote decides a product\'s fate.',
    category: 'culture',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20design%20studio%20wall%20with%20panda%20product%20concept%20sketches%20pinned%2C%20black%20white%20style&image_size=landscape_16_9',
    ],
    author: 'Chengdu Craft Studio',
    publishDate: '2026-08-20',
    views: 1892,
  },
  {
    id: '3',
    slug: 'chengdu-relaxation-design',
    title: '松弛感设计:成都教给我们的产品哲学',
    titleEn: 'Designing with Relaxation: What Chengdu Taught Us',
    content: '成都熊猫基地里最受欢迎的不是最活泼的熊猫,而是躺得最平的那只。这座城市的节奏慢慢渗进了我们的设计:不追求复杂功能,只做你每天愿意看到、愿意握住的小物件。',
    contentEn: 'At the panda base, the most beloved panda is not the most active one — it\'s the one lying flattest. Chengdu\'s pace has seeped into our design: no complicated features, just small objects you are happy to see and hold every day.',
    category: 'culture',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lazy%20giant%20panda%20lying%20on%20wooden%20platform%2C%20black%20and%20white%20minimal%20photography&image_size=landscape_16_9',
    ],
    author: 'Chengdu Craft Studio',
    publishDate: '2026-08-12',
    views: 1567,
  },
];

// 文创占位图(正式上线后由后台替换为实拍/设计图)
const IMG = {
  egg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20minimalist%20ceramic%20panda%20egg%20figurine%2C%20white%20glazed%20porcelain%20with%20black%20panda%20face%2C%20product%20photo%20on%20light%20gray%20background%2C%20soft%20shadow&image_size=square_hd',
  lantern: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20panda%20shaped%20bedside%20lantern%20lamp%2C%20warm%20glow%2C%20white%20and%20black%20design%2C%20product%20photo%20on%20beige%20background&image_size=square_hd',
  ruler: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20bamboo%20ruler%20with%20engraved%20panda%20pattern%2C%20stationery%20product%20photo%20on%20white%20background&image_size=square_hd',
  plush: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20lying%20flat%20lazy%20panda%20plush%20toy%2C%20black%20and%20white%20soft%20fabric%2C%20product%20photo%20on%20light%20gray%20background&image_size=square_hd',
  bookmark: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=set%20of%20minimalist%20metal%20panda%20bookmarks%2C%20black%20and%20silver%2C%20stationery%20flat%20lay%20on%20white%20background&image_size=square_hd',
  tote: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=natural%20canvas%20tote%20bag%20with%20minimalist%20black%20panda%20line%20art%20print%2C%20product%20photo%20on%20white%20background&image_size=square_hd',
  postcard: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=set%20of%20minimalist%20Chengdu%20panda%20illustration%20postcards%2C%20black%20and%20white%20ink%20style%2C%20flat%20lay%20on%20white%20table&image_size=square_hd',
  teapet: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20cute%20ceramic%20panda%20tea%20pet%20figurine%2C%20glossy%20black%20and%20white%20glaze%2C%20product%20photo%20on%20light%20gray%20background&image_size=square_hd',
};

// 预售默认时间(回退数据用,正式数据以后台设置为准)
const DAYS = 24 * 60 * 60 * 1000;

export const products: Product[] = [
  {
    id: 'panda-egg',
    name: '熊猫蛋仔',
    nameEn: 'Panda Egg',
    description: '手作釉烧陶瓷蛋,剥开是一只熊猫。首批限量编号。',
    descriptionEn: 'A hand-glazed ceramic egg that "hatches" into a panda. First batch, individually numbered.',
    price: 29.99,
    category: 'decor',
    type: 'physical',
    images: [IMG.egg],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: ['handmade', 'limited', 'panda'],
    status: 'preorder',
    votesCount: 0,
    preorderEnd: new Date(Date.now() + 7 * DAYS).toISOString(),
    onSaleAt: new Date(Date.now() + 14 * DAYS).toISOString(),
    story: '第一款作品。我们想做一个"剥开有惊喜"的东西——蛋是最日常的食物,熊猫是成都最松弛的居民。',
  },
  {
    id: 'panda-lantern',
    name: '熊猫月灯',
    nameEn: 'Panda Moon Lantern',
    description: '抱月熊猫小夜灯,暖光硅胶灯罩,投票达标开模。',
    descriptionEn: 'A panda hugging the moon — a warm-glow bedside night light. Molds open when votes reach the goal.',
    price: 39.99,
    category: 'home',
    type: 'physical',
    images: [IMG.lantern],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: ['lamp', 'panda', 'cozy'],
    status: 'design',
    votesCount: 247,
    story: '打样到第4版,我们把耳朵从"立耳"改成了"垂耳"——成都的熊猫,松弛感最重要。材质暂定柔光硅胶+实木底座。',
  },
  {
    id: 'bamboo-ruler',
    name: '竹节尺',
    nameEn: 'Bamboo Joint Ruler',
    description: '竹节造型黄铜书签尺,刻一只趴着的熊猫。',
    descriptionEn: 'A brass bookmark-ruler shaped like a bamboo joint, engraved with a lounging panda.',
    price: 18.99,
    category: 'stationery',
    type: 'physical',
    images: [IMG.ruler],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: ['brass', 'stationery'],
    status: 'design',
    votesCount: 183,
    story: '成都是一座被竹子养着的城市。我们把竹节做成尺子,让"成都节奏"躺在你的书里。',
  },
  {
    id: 'lazy-panda-plush',
    name: '躺平熊猫玩偶',
    nameEn: 'Lazy Panda Plush',
    description: '一个彻底躺平的熊猫,可以当抱枕也可以当情绪搭子。',
    descriptionEn: 'A panda that has fully given in to lying flat. A pillow, a mood, a companion.',
    price: 34.99,
    category: 'toy',
    type: 'physical',
    images: [IMG.plush],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: ['plush', 'cute', 'gift'],
    status: 'design',
    votesCount: 312,
    story: '成都熊猫基地里最受欢迎的不是最活泼的,而是躺得最平的那只。它教会我们:不努力,也很可爱。',
  },
  {
    id: 'panda-bookmark',
    name: '熊猫书签套装',
    nameEn: 'Panda Bookmark Set',
    description: '四枚金属镂空熊猫书签,读书也要有成都节奏。',
    descriptionEn: 'Four hollow-cut metal panda bookmarks. Reading at Chengdu pace.',
    price: 12.99,
    category: 'stationery',
    type: 'physical',
    images: [IMG.bookmark],
    stock: 200,
    rating: 4.9,
    reviews: 86,
    tags: ['stationery', 'gift'],
    status: 'on-sale',
    votesCount: 0,
  },
  {
    id: 'rong-tote',
    name: '蓉云帆布袋',
    nameEn: 'Rong Cloud Tote',
    description: '厚磅帆布,水墨熊猫线条,装电脑也装菜。',
    descriptionEn: 'Heavy-weight canvas tote with ink-wash panda lines. Fits a laptop, fits groceries.',
    price: 24.99,
    category: 'home',
    type: 'physical',
    images: [IMG.tote],
    stock: 150,
    rating: 4.8,
    reviews: 64,
    tags: ['canvas', 'daily'],
    status: 'on-sale',
    votesCount: 0,
  },
  {
    id: 'chengdu-postcard',
    name: '成都明信片',
    nameEn: 'Chengdu Postcard Set',
    description: '八张黑白水墨熊猫×成都地标,寄给想念的人。',
    descriptionEn: 'Eight black-and-white ink postcards: pandas x Chengdu landmarks, for someone you miss.',
    price: 15.99,
    category: 'stationery',
    type: 'physical',
    images: [IMG.postcard],
    stock: 300,
    rating: 4.9,
    reviews: 112,
    tags: ['postcard', 'ink'],
    status: 'on-sale',
    votesCount: 0,
  },
  {
    id: 'panda-teapet',
    name: '熊猫茶宠',
    nameEn: 'Panda Tea Pet',
    description: '茶席上的小熊猫,浇热水会开心得变色(待定款)。',
    descriptionEn: 'A tiny panda for your tea tray, that changes color when bathed in hot tea.',
    price: 19.99,
    category: 'decor',
    type: 'physical',
    images: [IMG.teapet],
    stock: 120,
    rating: 4.7,
    reviews: 43,
    tags: ['tea', 'ceramic'],
    status: 'on-sale',
    votesCount: 0,
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    email: 'john@example.com',
    country: 'United States',
    items: [
      { productId: 'panda-bookmark', name: 'Panda Bookmark Set', quantity: 2, price: 49.99 },
      { productId: 'rong-tote', name: 'Rong Cloud Tote', quantity: 3, price: 12.99 },
    ],
    totalAmount: 148.95,
    status: 'delivered',
    createdAt: '2026-07-15T10:30:00Z',
  },
  {
    id: 'ORD-002',
    customerName: 'Emily Davis',
    email: 'emily@example.com',
    country: 'United Kingdom',
    items: [
      { productId: 'panda-egg', name: 'Panda Egg', quantity: 1, price: 299.99 },
    ],
    totalAmount: 299.99,
    status: 'shipped',
    createdAt: '2026-07-18T14:20:00Z',
  },
  {
    id: 'ORD-003',
    customerName: 'Marcus Weber',
    email: 'marcus@example.com',
    country: 'Germany',
    items: [
      { productId: 'chengdu-postcard', name: 'Chengdu Postcard Set', quantity: 4, price: 18.99 },
      { productId: 'panda-teapet', name: 'Panda Tea Pet', quantity: 2, price: 24.99 },
    ],
    totalAmount: 125.94,
    status: 'paid',
    createdAt: '2026-07-19T09:15:00Z',
  },
  {
    id: 'ORD-004',
    customerName: 'Sophie Laurent',
    email: 'sophie@example.com',
    country: 'France',
    items: [
      { productId: 'lazy-panda-plush', name: 'Lazy Panda Plush', quantity: 1, price: 35.99 },
      { productId: 'panda-bookmark', name: 'Panda Bookmark Set', quantity: 1, price: 49.99 },
    ],
    totalAmount: 85.98,
    status: 'pending',
    createdAt: '2026-07-20T16:45:00Z',
  },
];

export const categoryLabels = {
  culture: { zh: '文化', en: 'Culture' },
  food: { zh: '美食', en: 'Food' },
  travel: { zh: '旅行', en: 'Travel' },
  art: { zh: '艺术', en: 'Art' },
};

export const productCategoryLabels = {
  stationery: { zh: '文具纸品', en: 'Stationery' },
  home: { zh: '家居生活', en: 'Home' },
  decor: { zh: '装饰摆件', en: 'Decor' },
  toy: { zh: '玩偶潮玩', en: 'Toys' },
};

// 产品生命周期状态标签
export const productStatusLabels = {
  design: { zh: '投票中 · 设计中', en: 'Voting' },
  preorder: { zh: '预售', en: 'Pre-order' },
  'on-sale': { zh: '在售', en: 'In Stock' },
};

export const reviews: Review[] = [];

export const orderStatusLabels = {
  pending: { zh: '待处理', en: 'Pending' },
  paid: { zh: '已付款', en: 'Paid' },
  shipped: { zh: '已发货', en: 'Shipped' },
  delivered: { zh: '已送达', en: 'Delivered' },
};
