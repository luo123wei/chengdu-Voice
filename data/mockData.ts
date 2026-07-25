export interface BlogPost {
  id: string;
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
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  category: 'tea' | 'spice' | 'craft' | 'snack' | 'digital';
  type: 'physical' | 'digital';
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  story?: string;
  culture?: string;
  howToUse?: string;
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
    id: '5',
    title: '成都清晨的声音：盖碗茶、鸟鸣与晨雾',
    titleEn: 'Sounds of Chengdu Morning: Gaiwan Tea, Bird Songs and Morning Mist',
    content: '在成都，清晨是一首无声的诗。当第一缕阳光穿透薄雾，城市开始苏醒。茶馆里传来盖碗茶清脆的碰撞声，老茶客们用低沉的四川话聊着家常。窗外，鸟儿在竹林间欢快地歌唱，偶尔传来几声清脆的自行车铃声。这就是成都的早晨，一个用声音编织的梦境。在这里，时间仿佛放慢了脚步，每一个声音都在诉说着这座城市的故事。如果你也想体验这份宁静，可以聆听我们的《成都声音地图》白噪音专辑，让成都的声音陪伴你的每一天。',
    contentEn: 'In Chengdu, the morning is a silent poem. When the first ray of sunlight penetrates the mist, the city begins to wake up. The crisp sound of gaiwan tea cups colliding echoes from the teahouses, as elderly tea drinkers chat in low Sichuan dialect. Outside the window, birds sing cheerfully among the bamboo groves, occasionally interrupted by the crisp ring of bicycle bells. This is Chengdu morning, a dream woven with sounds. Here, time seems to slow down, and every sound tells the story of this city. If you want to experience this tranquility too, listen to our "Chengdu Sound Map" white noise album, and let the sounds of Chengdu accompany you every day.',
    category: 'culture',
    images: [
      'https://picsum.photos/id/1015/1200/675',
    ],
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    author: 'Chengdu Voice',
    publishDate: '2026-07-21',
    views: 1234,
  },
  {
    id: '1',
    title: '成都茶文化：一杯清茶的千年传承',
    titleEn: 'Chengdu Tea Culture: A Thousand-Year Legacy in a Cup',
    content: '成都，这座有着三千多年历史的城市，茶文化早已深深融入人们的日常生活。从古老的盖碗茶到现代的茶馆文化，每一杯茶都承载着成都人的生活哲学。',
    contentEn: 'Chengdu, a city with over 3,000 years of history, has tea culture deeply integrated into daily life. From ancient covered-bowl tea to modern tea house culture, every cup carries the philosophy of Chengdu people.',
    category: 'culture',
    images: [
      'https://picsum.photos/id/1000/1200/675',
    ],
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    author: 'Chengdu Voice',
    publishDate: '2026-07-20',
    views: 2341,
  },
  {
    id: '2',
    title: '川菜的麻辣艺术：味蕾上的火焰之旅',
    titleEn: 'Sichuan Cuisine: A Fiery Journey on the Taste Buds',
    content: '川菜，中国四大菜系之一，以其独特的麻辣风味闻名于世。从麻婆豆腐到水煮鱼，每一道菜都是一场味觉的盛宴。',
    contentEn: 'Sichuan cuisine, one of China\'s four major cuisines, is famous for its unique spicy and numbing flavors. From Mapo Tofu to Sichuan Boiled Fish, every dish is a feast for the senses.',
    category: 'food',
    images: [
      'https://picsum.photos/id/1080/1200/675',
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    author: 'Chengdu Voice',
    publishDate: '2026-07-18',
    views: 3521,
  },
  {
    id: '3',
    title: '宽窄巷子：穿越时光的成都记忆',
    titleEn: 'Wide and Narrow Alleys: Chengdu Memories Through Time',
    content: '宽窄巷子，成都最具代表性的历史文化街区。在这里，传统与现代交融，每一条巷子都诉说着老成都的故事。',
    contentEn: 'Wide and Narrow Alleys, Chengdu\'s most representative historical and cultural district. Here, tradition meets modernity, and every alley tells stories of old Chengdu.',
    category: 'travel',
    images: [
      'https://picsum.photos/id/1067/1200/675',
    ],
    author: 'Chengdu Voice',
    publishDate: '2026-07-15',
    views: 1892,
  },
  {
    id: '4',
    title: '蜀绣：针尖上的锦绣中华',
    titleEn: 'Shu Embroidery: Splendid China on the Tip of a Needle',
    content: '蜀绣，中国四大名绣之一，以其精细的针法和丰富的色彩著称。每一件作品都是艺术与工艺的完美结合。',
    contentEn: 'Shu Embroidery, one of China\'s four famous embroideries, is known for its exquisite stitching and rich colors. Each piece is a perfect blend of art and craftsmanship.',
    category: 'art',
    images: [
      'https://picsum.photos/id/1060/1200/675',
    ],
    author: 'Chengdu Voice',
    publishDate: '2026-07-12',
    views: 1567,
  },
];

export const products: Product[] = [
  {
    id: '0',
    name: '《成都声音地图》白噪音专辑',
    nameEn: 'Chengdu Sound Map - White Noise Album',
    description: '10个成都场景，每段30分钟，可下载',
    descriptionEn: '10 Chengdu scenes, 30 minutes each, downloadable',
    price: 9.99,
    category: 'digital',
    type: 'digital',
    images: [
      'https://picsum.photos/id/237/800/800',
    ],
    stock: 9999,
    rating: 4.9,
    reviews: 567,
    tags: ['digital', 'audio', 'white-noise'],
  },
  {
    id: '1',
    name: '蒙顶山茶',
    nameEn: 'Mengding Mountain Tea',
    description: '产自四川蒙山，中国十大名茶之一，香气馥郁，滋味鲜爽。',
    descriptionEn: 'Produced from Mengshan Mountain in Sichuan, one of China\'s top ten famous teas with rich aroma and fresh taste.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'tea',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1000/800/800',
    ],
    stock: 150,
    rating: 4.9,
    reviews: 234,
    tags: ['organic', 'premium'],
  },
  {
    id: '2',
    name: '郫县豆瓣',
    nameEn: 'Pixian Doubanjiang',
    description: '川菜之魂，百年传承，红油鲜亮，香气醇厚。',
    descriptionEn: 'The soul of Sichuan cuisine, with a century-old heritage, bright red oil and rich aroma.',
    price: 12.99,
    category: 'spice',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1080/800/800',
    ],
    stock: 300,
    rating: 4.8,
    reviews: 456,
    tags: ['authentic', 'traditional'],
  },
  {
    id: '3',
    name: '蜀绣屏风',
    nameEn: 'Shu Embroidery Screen',
    description: '纯手工制作，精美的花鸟图案，是家居装饰的绝佳选择。',
    descriptionEn: 'Handmade with exquisite flower and bird patterns, perfect for home decoration.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'craft',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1067/800/800',
    ],
    stock: 25,
    rating: 5.0,
    reviews: 67,
    tags: ['handmade', 'art'],
  },
  {
    id: '4',
    name: '麻辣火锅底料',
    nameEn: 'Spicy Hot Pot Base',
    description: '正宗川味火锅底料，麻辣鲜香，在家也能享受地道火锅。',
    descriptionEn: 'Authentic Sichuan hot pot base with spicy and numbing flavors, enjoy authentic hot pot at home.',
    price: 18.99,
    category: 'spice',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1060/800/800',
    ],
    stock: 200,
    rating: 4.7,
    reviews: 312,
    tags: ['spicy', 'easy-cook'],
  },
  {
    id: '5',
    name: '熊猫玩偶',
    nameEn: 'Panda Plush Toy',
    description: '可爱的大熊猫玩偶，采用优质面料，是送给亲友的绝佳礼物。',
    descriptionEn: 'Cute giant panda plush toy made with high-quality materials, perfect gift for friends and family.',
    price: 35.99,
    category: 'craft',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1074/800/800',
    ],
    stock: 100,
    rating: 4.9,
    reviews: 189,
    tags: ['gift', 'cute'],
  },
  {
    id: '6',
    name: '张飞牛肉',
    nameEn: 'Zhang Fei Beef',
    description: '阆中特产，色泽红润，肉质细嫩，风味独特。',
    descriptionEn: 'Specialty of Langzhong, with red color, tender texture and unique flavor.',
    price: 24.99,
    category: 'snack',
    type: 'physical',
    images: [
      'https://picsum.photos/id/1079/800/800',
    ],
    stock: 80,
    rating: 4.8,
    reviews: 156,
    tags: ['snack', 'traditional'],
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    email: 'john@example.com',
    country: 'United States',
    items: [
      { productId: '1', name: 'Mengding Mountain Tea', quantity: 2, price: 49.99 },
      { productId: '2', name: 'Pixian Doubanjiang', quantity: 3, price: 12.99 },
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
      { productId: '3', name: 'Shu Embroidery Screen', quantity: 1, price: 299.99 },
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
      { productId: '4', name: 'Spicy Hot Pot Base', quantity: 4, price: 18.99 },
      { productId: '6', name: 'Zhang Fei Beef', quantity: 2, price: 24.99 },
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
      { productId: '5', name: 'Panda Plush Toy', quantity: 1, price: 35.99 },
      { productId: '1', name: 'Mengding Mountain Tea', quantity: 1, price: 49.99 },
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
  tea: { zh: '茶叶', en: 'Tea' },
  spice: { zh: '调味品', en: 'Spices' },
  craft: { zh: '工艺品', en: 'Crafts' },
  snack: { zh: '零食', en: 'Snacks' },
  digital: { zh: '数字下载', en: 'Digital Download' },
};

export const reviews: Review[] = [
  {
    id: '1',
    productId: '0',
    nickname: 'Sarah Chen',
    email: 'sarah@example.com',
    rating: 5,
    content: '这款白噪音专辑太棒了！每个场景都让我仿佛身临其境，尤其是茶馆的声音，让我想起了在成都的美好时光。音质非常清晰，强烈推荐！',
    date: '2026-07-20',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '2',
    productId: '0',
    nickname: 'Michael Wang',
    email: 'michael@example.com',
    rating: 5,
    content: '完美的产品！10个场景各有特色，雨天的宽窄巷子那个场景特别适合助眠。下载方便，价格合理。',
    date: '2026-07-18',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '3',
    productId: '0',
    nickname: 'Lisa Zhang',
    email: 'lisa@example.com',
    rating: 4.5,
    content: '整体不错，声音很真实。建议可以增加更多场景，比如火锅店里的声音。',
    date: '2026-07-15',
    verified: false,
    verifiedEmail: true,
  },
  {
    id: '4',
    productId: '0',
    nickname: 'David Liu',
    email: 'david@example.com',
    rating: 5,
    content: '作为一个经常失眠的人，这个专辑改变了我的生活。每晚听着成都的声音入睡，感觉特别安心。',
    date: '2026-07-12',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '5',
    productId: '0',
    nickname: 'Emma Li',
    email: 'emma@example.com',
    rating: 4.5,
    content: '非常喜欢这个概念！把成都的声音带到了世界各地。每个场景30分钟刚刚好，可以循环播放。',
    date: '2026-07-10',
    verified: false,
    verifiedEmail: true,
  },
  {
    id: '6',
    productId: '1',
    nickname: 'James Wilson',
    email: 'james@example.com',
    rating: 5,
    content: '茶叶品质非常好，香气浓郁，汤色清澈。包装精美，送礼自用都很合适。',
    date: '2026-07-19',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '7',
    productId: '1',
    nickname: 'Anna Brown',
    email: 'anna@example.com',
    rating: 4.5,
    content: '口感鲜爽，回甘持久。是我喝过最好的绿茶之一，已经回购三次了。',
    date: '2026-07-16',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '8',
    productId: '2',
    nickname: 'Robert Taylor',
    email: 'robert@example.com',
    rating: 5,
    content: '正宗的郫县豆瓣，红油鲜亮，香气扑鼻。用它做菜味道非常地道，和我在成都吃的一样！',
    date: '2026-07-17',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '9',
    productId: '3',
    nickname: 'Jennifer Adams',
    email: 'jennifer@example.com',
    rating: 5,
    content: '蜀绣屏风太美了！孔雀图案栩栩如生，色彩鲜艳。放在客厅里非常有格调，朋友都夸好看。',
    date: '2026-07-14',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '10',
    productId: '4',
    nickname: 'Chris Martin',
    email: 'chris@example.com',
    rating: 4.5,
    content: '火锅底料味道很正宗，麻辣鲜香一应俱全。在家就能吃到地道的四川火锅，非常方便！',
    date: '2026-07-13',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '11',
    productId: '5',
    nickname: 'Nancy White',
    email: 'nancy@example.com',
    rating: 5,
    content: '熊猫玩偶超级可爱！面料柔软，做工精细。送给侄女她非常喜欢，抱着睡觉都不肯放手。',
    date: '2026-07-11',
    verified: true,
    verifiedEmail: true,
  },
  {
    id: '12',
    productId: '6',
    nickname: 'Tom Green',
    email: 'tom@example.com',
    rating: 4.5,
    content: '张飞牛肉名不虚传！肉质紧实有嚼劲，味道鲜香。作为零食非常合适，停不下来！',
    date: '2026-07-09',
    verified: true,
    verifiedEmail: true,
  },
];

export const orderStatusLabels = {
  pending: { zh: '待处理', en: 'Pending' },
  paid: { zh: '已付款', en: 'Paid' },
  shipped: { zh: '已发货', en: 'Shipped' },
  delivered: { zh: '已送达', en: 'Delivered' },
};
