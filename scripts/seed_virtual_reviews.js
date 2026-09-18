/**
 * 虚拟评论种子脚本 + 评论池模板
 *
 * 运行方式：
 *  node scripts/seed_virtual_reviews.js seed        # 首次 seed，先清后写
 *  node scripts/seed_virtual_reviews.js monthly     # 月度刷新
 *  node scripts/seed_virtual_reviews.js reset       # 重置
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltdrwmvhsbzkoymiqspr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ 缺少 Supabase key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// 产品 + 评论池
// ============================================================

const PRODUCTS = [
  { id: 'prod-1788939200479', slug: 'tianfu-square-wax-seal-stamp', name: 'Tianfu Square Wax Seal Stamp' },
  { id: 'lazy-panda-plush', slug: 'lazy-panda-plush', name: 'Lazy Panda Plush' },
  { id: 'panda-egg', slug: 'panda-egg', name: 'Panda Egg' },
  { id: 'prod-1788923642283', slug: 'leather-samurai-panda-keychain', name: 'Leather Samurai Panda Keychain' },
];

const TIANFU_POOL = [
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
];

const PLUSH_POOL = [
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
];

const EGG_POOL = [
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
];

const KEYCHAIN_POOL = [
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
];

const POOL_MAP = {
  'prod-1788939200479': TIANFU_POOL,
  'lazy-panda-plush': PLUSH_POOL,
  'panda-egg': EGG_POOL,
  'prod-1788923642283': KEYCHAIN_POOL,
};

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

function buildInitialReviews() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const reviews = [];

  for (const product of PRODUCTS) {
    const pool = POOL_MAP[product.id] || [];
    const selected = pickN(pool, 10);
    const nicknames = pickN(NICKNAMES, 10);

    for (let i = 0; i < 10; i++) {
      const monthOffset = Math.floor(i / 3);
      let yearOffset = thisYear;
      let m1 = thisMonth - monthOffset;
      if (m1 <= 0) { m1 += 12; yearOffset -= 1; }
      reviews.push({
        id: `vr-${product.id}-init-${i}`,
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
  }
  return reviews;
}

function buildMonthlyAdditions() {
  const now = new Date();
  let targetMonth = now.getMonth();
  let targetYear = now.getFullYear();
  if (targetMonth === 0) { targetMonth = 12; targetYear -= 1; }

  const additions = [];
  for (const product of PRODUCTS) {
    const count = 2 + Math.floor(Math.random() * 3);
    const pool = POOL_MAP[product.id] || [];
    const selected = pickN(pool, count);
    const nicknames = pickN(NICKNAMES, count);
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
  }
  return additions;
}

async function main() {
  const mode = process.argv[2] || 'seed';
  console.log(`=== Virtual Reviews (mode: ${mode}) ===\n`);

  const { data: existingReviews, error: listErr } = await supabase
    .from('reviews').select('id, product_id');
  if (listErr) { console.error(listErr); process.exit(1); }
  console.log(`现有评论总数: ${existingReviews.length}\n`);

  if (mode === 'seed' || mode === 'reset') {
    console.log('[1/3] 清理旧虚拟评论...');
    const vrIds = existingReviews.filter(r => String(r.id).startsWith('vr-')).map(r => r.id);
    if (vrIds.length > 0) {
      const { error } = await supabase.from('reviews').delete().in('id', vrIds);
      if (error) { console.error(error); process.exit(1); }
      console.log(`  ✓ 已删除 ${vrIds.length} 条`);
    } else {
      console.log('  无旧虚拟评论需要清理');
    }

    console.log('\n[2/3] 插入初始评论（每产品 10 条）...');
    const toInsert = buildInitialReviews();
    const { data, error } = await supabase.from('reviews').insert(toInsert);
    if (error) { console.error(error); process.exit(1); }
    console.log(`  ✓ 插入 ${data ? data.length : toInsert.length} 条`);
  } else if (mode === 'monthly') {
    const MAX_PER_PRODUCT = 25;

    console.log('[1/3] 月度新增评论...');
    const additions = buildMonthlyAdditions();
    const { data, error } = await supabase.from('reviews').insert(additions);
    if (error) { console.error(error); process.exit(1); }
    console.log(`  ✓ 插入 ${data ? data.length : additions.length} 条`);

    console.log('\n[2/3] 清理超量虚拟评论...');
    for (const product of PRODUCTS) {
      const { data: allReviews } = await supabase
        .from('reviews').select('id, date').eq('product_id', product.id)
        .order('date', { ascending: false }).order('id', { ascending: false });
      if (allReviews && allReviews.length > MAX_PER_PRODUCT) {
        const toDelete = allReviews.slice(MAX_PER_PRODUCT).map(r => r.id);
        await supabase.from('reviews').delete().in('id', toDelete);
        console.log(`  ${product.slug}: 保留 ${MAX_PER_PRODUCT}，删 ${toDelete.length}`);
      } else {
        console.log(`  ${product.slug}: ${allReviews?.length || 0} 条，无需清理`);
      }
    }
  } else {
    console.log('用法: node seed_virtual_reviews.js [seed|monthly|reset]');
    process.exit(1);
  }

  console.log('\n[3/3] 更新 products.rating / products.reviews...');
  for (const product of PRODUCTS) {
    const { data: rows, error: e } = await supabase
      .from('reviews').select('rating').eq('product_id', product.id);
    if (e || !rows || rows.length === 0) {
      console.log(`  ${product.slug}: 暂无评论，跳过`);
      continue;
    }
    const total = rows.length;
    const sum = rows.reduce((a, r) => a + parseFloat(r.rating), 0);
    const avg = parseFloat((sum / total).toFixed(1));
    const { data: updated, error: ue } = await supabase
      .from('products').update({ rating: avg, reviews: total }).eq('id', product.id)
      .select('id, rating, reviews').single();
    if (ue) { console.error(`  ${product.slug}: 更新失败`, ue); continue; }
    console.log(`  ${product.slug}: rating=${avg}, reviews=${total} ✓`);
  }

  console.log('\n=== 完成 ===');
}

main().catch(err => { console.error(err); process.exit(1); });
