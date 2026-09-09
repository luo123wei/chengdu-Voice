const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ltdrwmvhsbzkoymiqspr.supabase.co';
const supabaseKey = 'sb_publishable_kta3xVsy0yYLTQ4QhtaGMA_vpVkyRnU';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const REVIEWS = {
  'prod-1784816481089': [
    {
      id: 'review-huajiao-001',
      product_id: 'prod-1784816481089',
      nickname: 'Emma_W',
      email: 'emm*****@gmail.com',
      rating: 5.0,
      content: 'The aroma is incredible! Just a tiny pinch brings such depth to my stir-fry dishes. Packaging was very secure and arrived earlier than expected. I\'ve been cooking Sichuan food for years and this is genuinely one of the best I\'ve used.',
      date: '2026-08-08',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-002',
      product_id: 'prod-1784816481089',
      nickname: 'JamesChen',
      email: 'jam*****@outlook.com',
      rating: 5.0,
      content: 'Wow, the fragrance when you open the bag is amazing. It makes my whole kitchen smell like authentic Sichuan. The peppercorns are plump and fresh. Will definitely order again.',
      date: '2026-08-07',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-003',
      product_id: 'prod-1784816481089',
      nickname: 'Sarah.L',
      email: 'sar****@yahoo.com',
      rating: 5.0,
      content: 'I bought this as a gift for my dad who loves spicy food. He absolutely loves it! The quality is obvious from the color and texture. Great packaging too.',
      date: '2026-08-06',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-004',
      product_id: 'prod-1784816481089',
      nickname: 'Michael.T',
      email: 'mic****@hotmail.com',
      rating: 5.0,
      content: 'Been using this for a month now. The numbing sensation is perfect, not too overwhelming. My Mapo tofu has never tasted better. Good value for the quality you get.',
      date: '2026-08-05',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-005',
      product_id: 'prod-1784816481089',
      nickname: 'Lisa_Zhao',
      email: 'lis****@qq.com',
      rating: 5.0,
      content: 'Very fresh and fragrant! I can tell these are premium quality. The bag reseals well which keeps them fresh. Makes a big difference in all my Sichuan recipes.',
      date: '2026-08-04',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-006',
      product_id: 'prod-1784816481089',
      nickname: 'David.Kim',
      email: 'dav****@naver.com',
      rating: 5.0,
      content: 'Authentic Hanyuan peppercorns! The citrusy floral notes are distinctive. I\'ve tried several brands and this one stands out. Customer service was helpful too.',
      date: '2026-08-03',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-007',
      product_id: 'prod-1784816481089',
      nickname: 'RachelGreen',
      email: 'rac****@icloud.com',
      rating: 5.0,
      content: 'The flavor is so much more complex than regular peppercorns. It adds that special numbing tingle that real Sichuan food needs. Shipping was surprisingly fast internationally.',
      date: '2026-08-02',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-008',
      product_id: 'prod-1784816481089',
      nickname: 'Tom_Wilson',
      email: 'tom****@proton.me',
      rating: 5.0,
      content: 'Impressed by the quality! The peppercorns are uniform in size and very aromatic. I use them in marinades, sauces, and even in my noodle soup. Versatile and delicious.',
      date: '2026-08-01',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-009',
      product_id: 'prod-1784816481089',
      nickname: 'Jessica.P',
      email: 'jess****@gmail.com',
      rating: 4.5,
      content: 'Really good quality and fast shipping. I love the rich numbing flavor it gives to dishes. Only minor thing is the bag could have a better reseal, but the product itself is excellent.',
      date: '2026-07-30',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-010',
      product_id: 'prod-1784816481089',
      nickname: 'Kevin_L',
      email: 'kevin****@outlook.com',
      rating: 4.5,
      content: 'Great product with authentic flavor. The peppercorns are well-dried and fragrant. I noticed slight variation in color between batches but overall very satisfied with the purchase.',
      date: '2026-07-28',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-011',
      product_id: 'prod-1784816481089',
      nickname: 'Anna_White',
      email: 'ann****@hotmail.com',
      rating: 4.5,
      content: 'Lovely aroma and taste. Perfect for my homemade Sichuan dishes. The price is reasonable for the quality. Would recommend to anyone wanting authentic peppercorns.',
      date: '2026-07-25',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-huajiao-012',
      product_id: 'prod-1784816481089',
      nickname: 'Peter_G',
      email: 'pet****@yahoo.com',
      rating: 4.5,
      content: 'Fresh and flavorful, makes a noticeable difference in cooking. The heat level is moderate which is good for everyday use. Packaging could be a bit sturdier for long-term storage.',
      date: '2026-07-22',
      verified: true,
      verified_email: true,
    },
  ],
  'prod-1786239155779': [
    {
      id: 'review-chabei-001',
      product_id: 'prod-1786239155779',
      nickname: 'Sophia.M',
      email: 'sop****@gmail.com',
      rating: 5.0,
      content: 'This tea set is absolutely beautiful! The craftsmanship is exquisite and each piece feels delicate yet sturdy. It\'s become a centerpiece in my kitchen. Tea tasting feels like a ritual now.',
      date: '2026-08-08',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-002',
      product_id: 'prod-1786239155779',
      nickname: 'Robert_H',
      email: 'rob****@outlook.com',
      rating: 5.0,
      content: 'Bought this for my wife\'s birthday and she was thrilled! The porcelain is elegant and the glaze is perfect. Comes beautifully packaged. We\'ve already used it multiple times for afternoon tea.',
      date: '2026-08-07',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-003',
      product_id: 'prod-1786239155779',
      nickname: 'Yuki_Tanaka',
      email: 'yuk****@yahoo.co.jp',
      rating: 5.0,
      content: 'The quality is outstanding! The tea cups feel great in hand and the gaiwan is perfectly balanced. I\'ve been practicing Chinese tea ceremony and this set elevates the experience significantly.',
      date: '2026-08-06',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-004',
      product_id: 'prod-1786239155779',
      nickname: 'Emily_C',
      email: 'emi****@hotmail.com',
      rating: 5.0,
      content: 'Just stunning! The details are beautiful and the set looks even better in person than in photos. Makes drinking tea feel like a special occasion every day. Highly recommend!',
      date: '2026-08-05',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-005',
      product_id: 'prod-1786239155779',
      nickname: 'Daniel.S',
      email: 'dan****@gmail.com',
      rating: 5.0,
      content: 'A wonderful gift for my mother who collects tea sets. She was very impressed by the quality and design. The packaging is also very elegant. Authentic Chinese craftsmanship at its finest.',
      date: '2026-08-04',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-006',
      product_id: 'prod-1786239155779',
      nickname: 'Olivia_B',
      email: 'oli****@outlook.com',
      rating: 5.0,
      content: 'Beautiful, functional, and well-made! The set is microwave and dishwasher safe which is very convenient. My daily tea routine has become much more enjoyable. Worth every penny.',
      date: '2026-08-03',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-007',
      product_id: 'prod-1786239155779',
      nickname: 'Chris_Wong',
      email: 'chr****@qq.com',
      rating: 4.5,
      content: 'Very beautiful tea set with traditional design. The porcelain quality is excellent. Only small issue is the cups are quite small, but that\'s actually authentic. Great for daily use or display.',
      date: '2026-07-30',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-008',
      product_id: 'prod-1786239155779',
      nickname: 'Laura.V',
      email: 'lau****@hotmail.com',
      rating: 4.5,
      content: 'Elegant design and good quality porcelain. Arrived well-packaged and in perfect condition. The set is a nice conversation piece when entertaining guests. Very pleased with this purchase.',
      date: '2026-07-27',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-009',
      product_id: 'prod-1786239155779',
      nickname: 'Mark_R',
      email: 'mar****@gmail.com',
      rating: 4.5,
      content: 'Beautiful tea set, looks great on my kitchen shelf. The craftsmanship is evident. I use it regularly and it still looks pristine. Minor thing would be the price, but you get what you pay for.',
      date: '2026-07-24',
      verified: true,
      verified_email: true,
    },
    {
      id: 'review-chabei-010',
      product_id: 'prod-1786239155779',
      nickname: 'Hannah_G',
      email: 'han****@icloud.com',
      rating: 4.5,
      content: 'Lovely tea set with authentic Sichuan design. Good weight and feel to each piece. Was slightly smaller than I expected but it\'s grown on me. Beautiful addition to my tea collection.',
      date: '2026-07-20',
      verified: true,
      verified_email: true,
    },
  ],
};

const PRODUCT_UPDATES = [
  { id: 'prod-1784816481089', reviews: 12, rating: 4.8 },
  { id: 'prod-1786239155779', reviews: 10, rating: 4.8 },
];

async function main() {
  console.log('=== 开始种子数据脚本 ===\n');

  // 1. 删除两个产品的现有评论
  console.log('[1/3] 删除现有评论...');
  const productIds = Object.keys(REVIEWS);
  const { data: deleteData, error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .in('product_id', productIds);

  if (deleteError) {
    console.error('删除评论失败:', deleteError);
    process.exit(1);
  }
  console.log(`  ✓ 已删除 ${deleteData ? deleteData.length : '所有'} 条现有评论`);

  // 2. 插入新评论
  console.log('\n[2/3] 插入新评论...');
  let totalInserted = 0;

  for (const [productId, reviews] of Object.entries(REVIEWS)) {
    console.log(`  插入 ${reviews.length} 条评论到产品 ${productId}...`);

    const { data, error } = await supabase.from('reviews').insert(reviews);

    if (error) {
      console.error(`  ✗ 插入 ${productId} 评论失败:`, error);
      process.exit(1);
    }

    const insertedCount = data ? data.length : reviews.length;
    totalInserted += insertedCount;
    console.log(`  ✓ 成功插入 ${insertedCount} 条评论到产品 ${productId}`);
  }

  console.log(`\n  共插入 ${totalInserted} 条评论`);

  // 3. 更新产品表
  console.log('\n[3/3] 更新产品表...');
  for (const update of PRODUCT_UPDATES) {
    const { data, error } = await supabase
      .from('products')
      .update({ reviews: update.reviews, rating: update.rating })
      .eq('id', update.id)
      .select('id, name, rating, reviews')
      .single();

    if (error) {
      console.error(`  ✗ 更新产品 ${update.id} 失败:`, error);
      process.exit(1);
    }

    console.log(`  ✓ 产品 ${data.id} (${data.name}): rating=${data.rating}, reviews=${data.reviews}`);
  }

  console.log('\n=== 完成 ===');
  console.log(`总计插入评论: ${totalInserted} 条`);
  console.log(`更新产品: ${PRODUCT_UPDATES.length} 个`);
}

main().catch((err) => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});