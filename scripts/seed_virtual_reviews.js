/**
 * 虚拟评论种子脚本 + 评论池模板
 *
 * 运行方式：
 *  node scripts/seed_virtual_reviews.js seed            # 首次 seed 全部在售产品
 *  node scripts/seed_virtual_reviews.js monthly         # 月度自动刷新（GitHub Actions 调用）
 *  node scripts/seed_virtual_reviews.js reset           # 清虚拟评论 + 重 seed
 *  node scripts/seed_virtual_reviews.js add <slug>      # 给指定 slug 的产品加初始评论（新产品用这个）
 *  node scripts/seed_virtual_reviews.js list            # 列出在售产品、已覆盖/未覆盖评论池
 *
 * 新增产品操作流程：
 *   1. 后台添加产品，设为在售
 *   2. 运行 `node scripts/seed_virtual_reviews.js add <slug>`
 *      → 自动用通用兜底评论池 seed 10 条
 *   3. （可选）在本脚本 PRODUCT_REVIEW_POOLS 里补充该产品的精准评论池
 *   4. 运行 `node scripts/seed_virtual_reviews.js seed` 重新 seed，新评论替换通用评论
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltdrwmvhsbzkoymiqspr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ 缺少 Supabase key，设置 NEXT_PUBLIC_SUPABASE_ANON_KEY 或 SUPABASE_SERVICE_ROLE_KEY 后运行');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// 手动维护的精准评论池（产品 id → 评论数组）
// 只需要为每个产品写一次，以后 seed 会自动用
// 写完产品后把评论池加到这里，下次 seed 就替换掉通用兜底评论
// ============================================================

const PRODUCT_REVIEW_POOLS = {
  'prod-1788939200479': [  // Tianfu Square Wax Seal Stamp
    'This stamp is my new favorite desk item. I use it on every letter now — friends always ask where I got it. The engraving of Tianfu Square is surprisingly detailed for the size.',
    'Bought it as a souvenir after my trip to Chengdu. Bringing home a stamp feels more personal than a magnet. The wood handle is smooth and the stamp head has real weight to it.',
    'The packaging was elegant, gift-worthy actually. I ordered one for myself and ended up ordering two more as birthday presents. Everyone loves the idea of stamping your own Chengdu memory.',
    'Used it with wax on my travel journal — looks beautiful. The heat doesn\'t seem to affect the engraving at all after maybe 30 stamps so far.',
    'Love that each landmark in the collection is a real place in Chengdu. My friend got the People\'s Park one, we compared side by side — both great.',
    'The description says 85mm long, it feels perfect in hand, not too big not too small. I was worried it would be too dainty but it has a solid feel.',
    'Shipping to Germany took 10 days, tracking worked the whole time. Wax and stamp arrived together, nothing broken.',
    'I\'m not really a wax seal person normally but this changed my mind. Now I stamp everything. Letters. Notebooks. Gift wrapping. My parents are getting annoyed.',
    'Great quality for the price. I\'ve used much more expensive stamps from Etsy and this one matches them. The engraving is sharp and consistent.',
    'My teenage daughter thought it was the coolest thing ever. She now seals all her journal entries with wax and this stamp. 10/10 would buy again.',
    'Bought 3 different landmarks for my office desk. They look great lined up. Very glad the handles are slightly different colors per landmark — easy to tell apart.',
    'The wooden handle has a nice matte finish, no shiny varnish. Feels like a tool you\'d actually use, not a decorative knick-knack.',
    'Gift idea that actually hit. My brother collects wax stamps and he said the Tianfu Square one is his new favorite in a collection of 12.',
    'I got the wrong one initially — I wanted Kuanzhai Alley — and support helped me exchange it within a day. Really responsive.',
    'The stamp head is brass, not painted or printed. You can feel the engraving with your finger. That small detail makes it feel genuinely well-made.',
    'I use it without wax sometimes — as a rubber-stamp substitute on my letters with ink pad. Works great. Versatile little thing.',
    'Honestly wasn\'t expecting much for $16.90 but I was blown away. The craftsmanship is serious. Chengdu definitely does good craft.',
    'Small enough to throw in my travel pouch. I actually did bring it with me on a weekend trip and stamped postcards from the hotel. So fun.',
    'My partner thought I bought an art piece. It lives on my desk between a small bonsai and a coffee cup. Very aesthetic.',
    'Collecting all 7. Three down, four to go. Voice Culture, please make more.',
  ],

  'lazy-panda-plush': [
    'This panda is seriously the softest thing I own. The fabric feels like cloud foam. It arrived wrapped in tissue paper — such a nice unboxing.',
    'I\'m 32 and I love this plush. No shame. He lives on my bed and greets me every night. Worth every penny.',
    'Panda is slightly bigger than I expected, and that\'s a good thing. You can hug it properly, not just a keychain. The "lazy" pose is adorable.',
    'Got this for my niece but immediately ordered another for myself. Sorry not sorry.',
    'The colors are exactly like in the photos — the black patches are a nice charcoal, not harsh black. The cream body has a subtle warmth.',
    'Surprisingly well-made. The stitches on the eyes are neat and straight, no loose threads anywhere. Looks like it\'ll hold up for years.',
    'It\'s become my desk buddy. Colleagues keep asking where I found it. One of them already ordered one.',
    'The texture of the fur is different from what I usually buy — it\'s more knitted, less fluffy. I actually prefer it, feels more unique.',
    'Ordered as a gift for a housewarming. It\'s the kind of present that gets display space on a shelf, not hidden in a closet.',
    'The expression on the face is perfectly lazy — half-closed eyes, soft mouth. Whoever designed this gets pandas. 100%.',
    'Shipping to Canada was fast, under two weeks. The plush was vacuum-packed which made the box small, then it fluffed right up when I opened it.',
    'I have 11 stuffed animals. This is the only one that has a spot of honor on my couch. That should tell you something.',
    'The weight is good — not too light, not a brick. It feels like it has substance. You can tell it wasn\'t mass-produced cheaply.',
    'Was skeptical about the price for a plush until I felt it. Now I get it. This isn\'t Walmart toy quality.',
    'The cream color is warm, not a flat white. It matches my bed linens perfectly. Bonus points for that.',
    'I got one for my office chair and now my coworker keeps stealing it. Ordering a second.',
    'Little details matter — the ears are the right size, the tail stub is cute without being weird. Everything is in proportion.',
    'Three of my friends ordered after seeing mine in a Zoom background. That\'s the power of a good plush.',
    'The tag says it\'s designed in Chengdu and you can feel that thought went into every part. Not a random panda plush from Amazon.',
    'Sleeps in my bed now. Don\'t tell anyone.',
  ],

  'panda-egg': [
    'I\'m not exaggerating when I say this is the most unique thing on my desk right now. Everyone who sees it asks where to get one.',
    'The matte ceramic feels premium. Not shiny, not cheap — exactly the kind of thing you\'d see in a design store. The panda expression is chef\'s kiss.',
    'It\'s smaller than I thought but that\'s fine, it lives on my nightstand. Fits next to my alarm clock perfectly.',
    'Was an impulse preorder and I\'m so glad I did. The shape of the egg combined with the panda face works surprisingly well.',
    'My pottery-fanatic friend was jealous. She said the glaze is exactly what she\'s been trying to get on her own wheel.',
    'Preorder was worth the wait. The packaging was the nicest I\'ve gotten from an independent shop — felt like unboxing a small sculpture.',
    'I use it as a paperweight. It\'s heavy enough to hold down a stack of envelopes and cute enough to not be embarrassing on my desk.',
    'Cute panda, serious ceramic. I like that it doesn\'t feel like a toy. It feels like a designed object.',
    'Got the white glaze version. The subtle variations in the ceramic make it feel hand-made, not machine-stamped. Love that.',
    'Preorder shipping took 3 weeks to the UK. They sent a tracking link right when it shipped. No surprises, which I appreciate.',
    'Three colleagues came over to ask about it after I put it on my desk. One ordered, one is waiting for the next batch.',
    'The panda face is painted, not printed — you can see the brush strokes up close. That level of craft for $29.99 is a steal.',
    'Looks great on a bookshelf next to my panda books. The perfect size to not get lost but big enough to notice.',
    'I was worried the panda face would look cheap on the egg shape but it\'s actually really charming. The proportions work.',
    'Comes with a small card about Chengdu panda culture. I thought that was a nice touch — makes it more than just a thing.',
    'My mom saw mine and now wants one for her kitchen window. Sold another one.',
    'It\'s heavier than expected, good weight for ceramic. Definitely feels like a quality piece, not fragile thin stuff.',
    'I put it on my coffee table and it\'s become a conversation piece. People always ask about it.',
    'Preordered two — one for me, one as a gift. Both arrived well-packaged with no issues. The recipient loved it.',
    'The design is just clever. Panda egg. Why has no one done this better before?',
  ],

  'prod-1788923642283': [  // Leather Samurai Panda Keychain
    'Got so many compliments on this keychain in the first week. My Uber driver asked me where I got it. People notice.',
    'The leather has a nice patina already after a month of use. It\'s going to look even better with age — exactly what you want from leather.',
    'The panda samurai face is carved, not printed. You can run your finger over the relief. That small detail makes all the difference.',
    'Small but substantial. Hangs well on my bag zipper, doesn\'t swing wildly. Perfect keychain size, not too bulky.',
    'My brother is into samurai stuff and pandas. This was the perfect birthday gift. He was genuinely excited.',
    'Leather strap is thick and well-stitched. The metal clasp feels solid, not the thin cheap stuff that breaks after a month.',
    'I put it on my backpack and it\'s held up through two international trips. Still looks new.',
    'The black leather contrasts perfectly with the cream panda. Visually just works. Whoever designed this has good taste.',
    'Cute but not cutesy. Masculine enough for my boyfriend, and he actually carries it on his keys without complaining.',
    'Three of my coworkers ordered after seeing mine. That\'s six total keychains now in our office. We have a problem.',
    'Shipping was fast, quality is obvious, and the price is absurdly low for real leather. This is my new go-to gift for people I don\'t know super well.',
    'The panda face is the classic round one from Chengdu, not some weird cartoon. Small detail but it matters — feels authentic.',
    'I was worried it would be too small to notice but it\'s the perfect size. You catch it out of the corner of your eye when I walk.',
    'The leather color is more of a rich brown than the black in the photos — pleasant surprise, looks even better in person.',
    'This is my third keychain from Voice Culture. The quality just keeps consistent. I\'ll keep buying whatever they make next.',
    'Gift for my best friend who studied in Chengdu. She teared up. 10/10.',
    'Carabiner works smoothly, no sticking. The keychain itself is well-balanced — doesn\'t spin or flip annoyingly on my keys.',
    'Simple design but clearly well-thought-out. The samurai panda angle was unexpected and fun. Not your generic panda keychain.',
    'The leather smells good — that new vegetable-tanned smell. You don\'t get that with fake leather. Another reason it\'s worth the money.',
    'Wore it on my luggage tag. Got compliments from the hotel concierge in Kyoto. So cute I bought another for my carry-on.',
  ],
};

// ============================================================
// 通用文创兜底评论池（新产品没有精准池时用这些）
// 每次从池里随机抽，所以同样的池也能组合出不同内容
// ============================================================

const FALLBACK_COMMON = [
  'Beautiful design, looks even better in person than in the photos. The packaging was lovely too.',
  'Great quality for the price. You can tell this was designed and made with care, not just mass-produced.',
  'Fast shipping, well-packaged, and the item itself is stunning. Very happy with my purchase.',
  'This is my new favorite thing on my desk / shelf / bag. Friends keep asking where I got it.',
  'Perfect gift for anyone who loves Chengdu, panda culture, or well-made craft objects. Would buy again.',
  'The craftsmanship is real. Small details you can feel make this worth every penny.',
  'Arrived quickly and in perfect condition. The colors and textures are exactly as shown. No surprises.',
  'I wasn\'t sure at first but it\'s become one of my most-used items. Definitely recommend.',
  'A little piece of Chengdu that travels with you. Love the story and care behind this brand.',
  'Great for daily use and for display. Feels like something you\'d keep for years.',
  'Solid quality, thoughtful design. This is how independent craft brands should be doing it.',
  'Bought one for myself and immediately ordered two more as gifts. That should tell you something.',
  'The texture / material has a nice feel to it. Not cheap, not overly fancy — just right.',
  'The attention to detail is impressive. Everything from the packaging to the product itself feels considered.',
  'Would absolutely order from Voice Culture again. The whole experience was a pleasure.',
];

const FALLBACK_GIFT = [
  'This is going to be such a good gift. The recipient is going to love it — I can already tell.',
  'Came beautifully packaged. I barely wanted to open it myself before gifting. Quality present.',
  'It\'s the kind of gift that doesn\'t feel like an afterthought. People remember receiving things like this.',
  'Perfect for anyone who collects small cultural objects or just loves nice things on their desk.',
  'I gave this to a friend and they immediately started using it. Always a good sign.',
  'Gift-worthy without needing wrapping. The presentation is already there.',
  'Got compliments on it when I brought it as a host gift. Classy and unexpected.',
  'This replaced three random things I was considering getting. Obvious choice.',
  'Someone asked me where I got their birthday gift. I told them, and they ordered one too.',
  'The brand card that came with it is a nice touch. Feels like you\'re sharing a story, not just a thing.',
];

const FALLBACK_PANDA = [
  'As a panda enthusiast, this did not disappoint. The panda details are on point, not generic.',
  'Chengdu pandas are the best pandas. This does them justice in design and quality.',
  'My panda collection is getting out of control but I regret nothing.',
  'The panda face / form / detail is way better than the generic stuff you find on Amazon.',
  'Finally a panda design that feels elegant, not cutesy garbage. Voice Culture gets it.',
  'My panda-loving friend saw this and ordered it before I finished showing her.',
];

const FALLBACK_DESIGN = [
  'Minimal but warm. The aesthetic is exactly my taste — not too loud, not too plain.',
  'It\'s a design object, not just a product. I appreciate that Voice Culture puts thought into form.',
  'Clean lines, good proportions. Whoever designed this has an eye.',
  'The choice of material and finish is unusual for this kind of product. Refreshing.',
  'There\'s something calm about this design. It sits well on a desk / shelf / wall without fighting for attention.',
  'Feels like something MoMA would stock, but at a price normal people can actually afford.',
];

// 按 category / type 匹配兜底池
function buildFallbackPool(product) {
  const pool = [...FALLBACK_COMMON];
  const cat = (product.category || '').toLowerCase();
  const type = (product.type || '').toLowerCase();
  const name = (product.name_en || product.nameEn || '').toLowerCase();

  // 熊猫相关
  if (name.includes('panda')) pool.push(...FALLBACK_PANDA);
  // 设计类
  if (['decor', 'home', 'stationery', 'toy'].includes(cat)) pool.push(...FALLBACK_DESIGN);
  // 礼品类（默认都有 gift 属性）
  pool.push(...FALLBACK_GIFT);

  return pool;
}

// ============================================================
// 通用工具
// ============================================================

const NICKNAMES = [
  'Emma_W', 'JamesChen', 'Sarah.L', 'Michael.T', 'Lisa_Zhao',
  'David.Kim', 'RachelGreen', 'Tom_Wilson', 'Jessica.P', 'Kevin_L',
  'Anna_White', 'Sophia.M', 'Robert_H', 'Yuki_Tanaka', 'Emily_C',
  'Daniel.S', 'Olivia_B', 'Chris_Wong', 'Laura.V', 'Mark_R',
  'Hannah_G', 'Amelia.B', 'Lucas_M', 'Mia_C', 'Noah.K',
  'Zoe_R', 'Ethan_P', 'Lily_S', 'Leo_F', 'Ava_G',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function randomDateInMonth(year, month1Indexed) {
  const daysInMonth = new Date(year, month1Indexed, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const m = String(month1Indexed).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}
function randomRating() {
  if (Math.random() < 0.85) return Math.random() < 0.65 ? 5.0 : 4.5;
  return 4.0;
}

function getPoolForProduct(product) {
  // 优先用手动维护的精准池
  if (PRODUCT_REVIEW_POOLS[product.id] && PRODUCT_REVIEW_POOLS[product.id].length > 0) {
    return { pool: PRODUCT_REVIEW_POOLS[product.id], source: '精准评论池' };
  }
  // 其次按 slug 查
  if (product.slug && PRODUCT_REVIEW_POOLS[product.slug]) {
    return { pool: PRODUCT_REVIEW_POOLS[product.slug], source: '精准评论池' };
  }
  // 兜底
  return { pool: buildFallbackPool(product), source: '通用兜底' };
}

// ============================================================
// 构建评论
// ============================================================

function buildReviewsForProduct(product, pool, count) {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const reviews = [];
  const selected = pickN(pool, count);
  const nicknames = pickN(NICKNAMES, count);

  for (let i = 0; i < count; i++) {
    const monthOffset = Math.floor(i / 3);
    let yearOffset = thisYear;
    let m1 = thisMonth - monthOffset;
    if (m1 <= 0) { m1 += 12; yearOffset -= 1; }

    reviews.push({
      id: `vr-${product.id}-init-${Date.now()}-${i}`,
      product_id: product.id,
      nickname: nicknames[i],
      email: `${nicknames[i].toLowerCase()}@example.com`,
      rating: randomRating(),
      content: selected[i],
      date: randomDateInMonth(yearOffset, m1),
      verified: true,
      verified_email: true,
    });
  }
  return reviews;
}

function buildMonthlyAdditionForProduct(product, pool) {
  const now = new Date();
  let targetMonth = now.getMonth();
  let targetYear = now.getFullYear();
  if (targetMonth === 0) { targetMonth = 12; targetYear -= 1; }

  const count = 2 + Math.floor(Math.random() * 3); // 2-4 条
  const selected = pickN(pool, count);
  const nicknames = pickN(NICKNAMES, count);
  const additions = [];

  for (let i = 0; i < count; i++) {
    additions.push({
      id: `vr-${product.id}-m-${Date.now()}-${i}`,
      product_id: product.id,
      nickname: nicknames[i],
      email: `${nicknames[i].toLowerCase()}@example.com`,
      rating: randomRating(),
      content: selected[i],
      date: randomDateInMonth(targetYear, targetMonth),
      verified: true,
      verified_email: true,
    });
  }
  return additions;
}

// ============================================================
// 主流程
// ============================================================

async function fetchActiveProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, name_en, price, status, category, type, images');
  if (error) { console.error('拉产品失败:', error); process.exit(1); }
  // 在售 + 预售（都展示评论），排除 design 投票状态
  return (data || []).filter(p => !p.status || p.status === 'on-sale' || p.status === 'preorder');
}

async function deleteVirtualReviews() {
  const { data, error } = await supabase.from('reviews').select('id');
  if (error) { console.error(error); return 0; }
  const vrIds = (data || []).filter(r => String(r.id).startsWith('vr-')).map(r => r.id);
  if (vrIds.length > 0) {
    await supabase.from('reviews').delete().in('id', vrIds);
  }
  return vrIds.length;
}

async function recalcProductRating(productId) {
  const { data: rows } = await supabase
    .from('reviews').select('rating').eq('product_id', productId);
  if (!rows || rows.length === 0) {
    await supabase.from('products').update({ rating: 0, reviews: 0 }).eq('id', productId);
    return;
  }
  const total = rows.length;
  const sum = rows.reduce((a, r) => a + parseFloat(r.rating), 0);
  const avg = parseFloat((sum / total).toFixed(1));
  await supabase.from('products').update({ rating: avg, reviews: total }).eq('id', productId);
}

async function runSeed() {
  console.log('\n[1/3] 清理旧虚拟评论...');
  const deleted = await deleteVirtualReviews();
  console.log(`  ✓ 已删除 ${deleted} 条旧虚拟评论`);

  const products = await fetchActiveProducts();
  console.log(`\n[2/3] 为 ${products.length} 个在售/预售产品 seed 评论（每产品 10 条）...`);

  let totalInserted = 0;
  const newProductWarnings = [];

  for (const product of products) {
    const { pool, source } = getPoolForProduct(product);
    const toInsert = buildReviewsForProduct(product, pool, 10);
    const { data, error } = await supabase.from('reviews').insert(toInsert);
    if (error) { console.error(`  ✗ ${product.name_en}: 插入失败`, error); continue; }
    const n = data ? data.length : toInsert.length;
    totalInserted += n;
    console.log(`  ✓ ${product.name_en} (${product.slug}): ${n} 条 [${source}]`);
    if (source === '通用兜底') {
      newProductWarnings.push(`    → ${product.slug}: 用了通用兜底评论池，建议后续在脚本里手动补充精准评论池`);
    }
  }

  console.log(`\n  共插入 ${totalInserted} 条评论`);
  if (newProductWarnings.length > 0) {
    console.log('\n  ⚠️  以下产品用了通用兜底评论（首次添加的新产品）:');
    newProductWarnings.forEach(w => console.log(w));
    console.log('  可以随时在脚本 PRODUCT_REVIEW_POOLS 里补充精准评论，然后重新 seed。');
  }

  console.log('\n[3/3] 更新 products.rating / products.reviews...');
  for (const product of products) {
    await recalcProductRating(product.id);
    // 读回结果显示
    const { data } = await supabase.from('products').select('rating, reviews').eq('id', product.id).single();
    console.log(`  ${product.name_en}: rating=${data?.rating}, reviews=${data?.reviews} ✓`);
  }
}

async function runMonthly() {
  const MAX_PER_PRODUCT = 25;
  const products = await fetchActiveProducts();

  console.log('[1/3] 月度新增评论（每产品 2-4 条）...');
  let totalAdded = 0;

  for (const product of products) {
    const { pool, source } = getPoolForProduct(product);
    const additions = buildMonthlyAdditionForProduct(product, pool);
    const { data, error } = await supabase.from('reviews').insert(additions);
    if (error) { console.error(`  ✗ ${product.name_en}: 插入失败`, error); continue; }
    const n = data ? data.length : additions.length;
    totalAdded += n;
    console.log(`  ✓ ${product.name_en}: +${n} 条`);
  }
  console.log(`  共新增 ${totalAdded} 条`);

  console.log('\n[2/3] 清理超量虚拟评论（每产品保留最新 25 条）...');
  for (const product of products) {
    const { data: allReviews } = await supabase
      .from('reviews').select('id, date').eq('product_id', product.id)
      .order('date', { ascending: false }).order('id', { ascending: false });
    if (allReviews && allReviews.length > MAX_PER_PRODUCT) {
      const toDelete = allReviews.slice(MAX_PER_PRODUCT).map(r => r.id);
      await supabase.from('reviews').delete().in('id', toDelete);
      console.log(`  ${product.name_en}: 保留 ${MAX_PER_PRODUCT}，删除 ${toDelete.length} 条最老`);
    } else {
      console.log(`  ${product.name_en}: ${allReviews?.length || 0} 条，无需清理`);
    }
  }

  console.log('\n[3/3] 更新 products.rating / products.reviews...');
  for (const product of products) {
    await recalcProductRating(product.id);
  }

  console.log('\n=== 月度刷新完成 ===');
}

async function runAdd(slug) {
  const products = await fetchActiveProducts();
  const product = products.find(p => p.slug === slug || p.id === slug);
  if (!product) {
    console.error(`❌ 找不到在售/预售产品 slug="${slug}"。请确认 slug 拼写正确。`);
    console.log('   当前在售产品:');
    products.forEach(p => console.log(`    - ${p.slug} (${p.name_en})`));
    process.exit(1);
  }

  const { pool, source } = getPoolForProduct(product);
  const { data: existing } = await supabase.from('reviews').select('id').eq('product_id', product.id);
  const existingCount = existing?.length || 0;

  console.log(`\n产品: ${product.name_en} (${product.slug})`);
  console.log(`现有评论: ${existingCount}`);
  console.log(`评论池来源: ${source}`);
  if (source === '通用兜底') {
    console.log('  ⚠️  用了通用兜底评论。建议后续在脚本 PRODUCT_REVIEW_POOLS 里手动补充精准评论，');
    console.log('     然后重新运行 `node scripts/seed_virtual_reviews.js seed` 替换。');
  }

  // 清旧的虚拟评论再重写
  const { data: allReviews } = await supabase
    .from('reviews').select('id').eq('product_id', product.id);
  const vrIds = (allReviews || []).filter(r => String(r.id).startsWith('vr-')).map(r => r.id);
  if (vrIds.length > 0) {
    await supabase.from('reviews').delete().in('id', vrIds);
    console.log(`\n清理 ${vrIds.length} 条旧虚拟评论`);
  }

  const toInsert = buildReviewsForProduct(product, pool, 10);
  const { data, error } = await supabase.from('reviews').insert(toInsert);
  if (error) { console.error('插入失败:', error); process.exit(1); }
  console.log(`插入 ${data ? data.length : toInsert.length} 条新评论`);

  await recalcProductRating(product.id);
  const { data: updated } = await supabase.from('products').select('rating, reviews').eq('id', product.id).single();
  console.log(`\n完成！rating=${updated?.rating}, reviews=${updated?.reviews}`);
}

async function runList() {
  const products = await fetchActiveProducts();
  console.log(`\n在售/预售产品 (${products.length} 个):\n`);

  for (const product of products) {
    const { data: reviews } = await supabase
      .from('reviews').select('id').eq('product_id', product.id);
    const { source } = getPoolForProduct(product);
    const n = reviews?.length || 0;
    const badge = source === '精准评论池' ? '✓' : '⚠';
    console.log(`  ${badge} ${product.name_en}`);
    console.log(`     slug=${product.slug} | status=${product.status || 'on-sale'} | 现有评论=${n} | 评论池=${source}`);
  }

  // 不在售但有精准评论池的（已下架的）
  const dbIds = new Set(products.map(p => p.id));
  const dbSlugs = new Set(products.map(p => p.slug).filter(Boolean));
  console.log('\n已维护精准评论池但不在售的产品（可能已下架）:');
  let orphan = 0;
  for (const id of Object.keys(PRODUCT_REVIEW_POOLS)) {
    if (!dbIds.has(id) && !dbSlugs.has(id)) {
      console.log(`  - ${id}: ${PRODUCT_REVIEW_POOLS[id].length} 条模板`);
      orphan++;
    }
  }
  if (orphan === 0) console.log('  （无）');
}

// ============================================================
// 入口
// ============================================================

async function main() {
  const mode = process.argv[2] || 'seed';

  if (mode === 'list') {
    await runList();
    return;
  }
  if (mode === 'add') {
    const slug = process.argv[3];
    if (!slug) { console.error('用法: node seed_virtual_reviews.js add <slug>'); process.exit(1); }
    await runAdd(slug);
    return;
  }
  if (mode === 'seed' || mode === 'reset') {
    console.log(`=== Virtual Reviews (mode: ${mode}) ===`);
    await runSeed();
    return;
  }
  if (mode === 'monthly') {
    console.log('=== Virtual Reviews (mode: monthly) ===');
    await runMonthly();
    return;
  }

  console.log('用法:');
  console.log('  node seed_virtual_reviews.js seed            首次 seed 全部在售产品');
  console.log('  node seed_virtual_reviews.js monthly         月度刷新（GitHub Actions 用）');
  console.log('  node seed_virtual_reviews.js reset           清虚拟评论 + 重 seed');
  console.log('  node seed_virtual_reviews.js add <slug>      给新产品加评论');
  console.log('  node seed_virtual_reviews.js list            查看在售产品和评论池覆盖情况');
}

main().catch(err => { console.error(err); process.exit(1); });
