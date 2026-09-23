-- ============================================================
-- 2 SEO blog posts: Chengdu soundscape (travel) + Mahjong boom (culture)
-- Schedule: Beijing time 08:00 on Sep 24 / Sep 25, 2026
-- Idempotent (re-runnable). Run in Supabase SQL Editor.
-- ============================================================

INSERT INTO blogs
(id, slug, title, title_en, content, content_en, category, images, audio, video, author, publish_date, views, scheduled_at)
VALUES

-- ============ POST 1: The Real Sound of Chengdu ============
(
  'blog-chengdu-sounds-2026',
  'real-sound-of-chengdu-7-moments',
  '成都的声音：只有在这里才能听到的7个瞬间',
  'The Real Sound of Chengdu: 7 Moments You Can Only Hear Here',
  $z$<p>每座城市都有自己的声音指纹。在成都，这枚指纹不是汽车喇叭，而是盖碗茶盖的轻碰、麻将牌的摩擦，和雨落在老巷瓦上的节奏。我们花了数周时间，在茶馆、菜市场、火锅店和戏台边录下了44段30秒的真实声音。这篇文章选出其中7个瞬间——从清晨6点半的盖碗合唱，到深夜一句"巴适"。戴上耳机，你会听到一座城市如何呼吸。</p><p>这些录音不是演出，也不是后期合成，而是成都人真实的日常：鹤鸣茶社续水时的壶嘴声、红油锅底翻滚的咕嘟声、老人在竹椅上搓麻将的沙沙声。文章中的4段录音可以直接播放，完整的44段声音收录在《Chengdu Sound Library》数字专辑中。</p>$z$,
  $t$<p>Every city has a sound fingerprint. In Chengdu, it is not a car horn. It is the clink of a porcelain tea lid, the dry shuffle of mahjong tiles, and rain landing on grey rooftop tiles. Over several weeks we recorded 44 real moments inside the city's teahouses, wet markets, hotpot restaurants and opera houses — each one exactly 30 seconds, with no performance, no overdub, no second take.</p><p>Here are seven moments from a single Chengdu day, in the order the city actually plays them. Four of the recordings are embedded below — press play. This is what the city sounds like when nobody is posing for a camera.</p>

<h2>1. 6:30 AM — The Gaiwan Choir</h2>
<p>The day does not begin loudly in Chengdu. It begins with porcelain. At Heming Teahouse in People's Park, the first water boilers fire up before sunrise, and within an hour a hundred gaiwan lids — the little saucer-cup-lid tea sets the city has used for centuries — are being lifted, stirred and tapped in an unplanned rhythm. There is no song here, only percussion: porcelain on porcelain, hot water hitting leaves, the low murmur of retired men claiming their favourite bamboo chairs.</p>
<p>Locals treat the teahouse as a second living room. One cup of jasmine tea can last four hours, refilled endlessly for pocket change. Sit still long enough and the room stops sounding like noise and starts sounding like what it is: a city negotiating its day at walking pace.</p>
<audio controls preload="none" src="https://ltdrwmvhsbzkoymiqspr.supabase.co/storage/v1/object/public/audio/audio/1784879418860.mp3" style="width:100%;margin:12px 0;"></audio>

<h2>2. 8:00 AM — The Wet Market Auction</h2>
<p>Chengdu's wet markets run on voices. Vendors do not whisper their prices — they sing them, in a half-spoken chant that carries over rain on tarpaulin and the thud of a cleaver hitting wood. Buyers answer back at the same volume, and an argument over fifty cents for lotus root can sound like a declaration of war while both parties are smiling.</p>
<p>This is the Sichuan dialect at full volume: tonal, theatrical, and warmer than it sounds to a Mandarin speaker's ear. The same market also explains the city's food — every hotpot ingredient, every pickle, every chili variety, is sold alive, fresh, or both, within fifty metres.</p>

<h2>3. 12:30 PM — The Hotpot Overture</h2>
<p>By lunchtime the city simmers, literally. A Sichuan hotpot is divided into nine lattice sections in old restaurants, each one bubbling with beef tallow, chili and the numbing Sichuan peppercorn that makes your lips feel electric. The sound is continuous — a low, percussive boil underlaid by the clatter of chopsticks and the sound of friends toasting over the steam.</p>
<p>The pot does the cooking, so the table does the talking. Hotpot in Chengdu is a social technology: nobody checks a phone when the oil is 100 degrees.</p>
<audio controls preload="none" src="https://ltdrwmvhsbzkoymiqspr.supabase.co/storage/v1/object/public/audio/audio/1784879206231.mp3" style="width:100%;margin:12px 0;"></audio>

<h2>4. 3:00 PM — Mahjong, Rubbed by Hand</h2>
<p>If the teahouse is Chengdu's living room, mahjong is its background television. Games run from noon until midnight under every available tree and awning. Older players still <em>shou pa</em> — rub the tiles by hand, thumb reading the bamboo grain face-down, slapping each discard down with a sound like bamboo rain. Electric shuffling tables are replacing this sound, which is partly why we recorded it while we still could.</p>
<p>Listen closely and you can hear the whole emotional grammar of the game in the noises: a slow, reluctant discard versus a triumphant tile slammed flat. Nobody needs to say "I won" out loud.</p>
<audio controls preload="none" src="https://ltdrwmvhsbzkoymiqspr.supabase.co/storage/v1/object/public/audio/audio/1785572079200.mp3" style="width:100%;margin:12px 0;"></audio>

<h2>5. 7:30 PM — The Opera Drum Asks for Silence</h2>
<p>Sichuan opera does not ease you in. It opens with a single, loud drum pattern — the <em>luogu</em> — and the entire audience, people who have been shouting over tea all evening, goes quiet on cue. What follows is three hundred years of theatre: clapping-vocal percussion, high falsetto narration, and bian lian, the face-changing trick where masked performers swap painted faces faster than the eye can follow, while the band never stops.</p>
<p>Tourists usually come for the masks. Locals stay for the singing. The recordings in our <a href="/shop/sichuan-opera-collection">Sichuan Opera Collection</a> follow one full night, from that first drum to the warrior's final cry.</p>

<h2>6. 9:00 PM — Rain in the Wide and Narrow Alleys</h2>
<p>Chengdu gets more than its share of soft, warm rain, and the old Qing-era alleys catch it like a drum kit: tile, wood, stone, puddle, each surface a different note. Under the eaves, nobody rushes. Tea is simply poured more slowly. This was the recording our listeners voted the most calming — and the one most people use to fall asleep.</p>
<audio controls preload="none" src="https://ltdrwmvhsbzkoymiqspr.supabase.co/storage/v1/object/public/audio/audio/1784879266886.mp3" style="width:100%;margin:12px 0;"></audio>

<h2>7. 11:00 PM — One Word for the Whole Night</h2>
<p>The last sound of Chengdu is usually a sentence rather than an object. <em>Ba shi</em> — roughly "comfortable, proper, life is good" — closes dinners, approves tea, describes a successful nap and answers "how was your day?" all at once. It is the vocal signature of a city that ranked relaxation as a life philosophy long before wellness became an industry.</p>
<p>You can hear it, and eleven other slices of daily dialect and street life, in the <a href="/shop/everyday-chengdu-collection">Everyday Chengdu Collection</a>.</p>

<h2>Why Record a City at All?</h2>
<p>Sounds vanish faster than buildings. The hand-rubbed mahjong is being replaced by machines. Old teahouses close lease by lease. Even dialect shifts, as every generation of Chengdu children grows up bilingual in Mandarin. A photograph tells you what a place looked like; a field recording tells you what it felt like to stand inside it.</p>
<p>All 44 recordings — opera, dialect, teahouse, hotpot, rain and the city at night — are collected in the <a href="/shop/chengdu-sound-map">Chengdu Sound Library</a>, and a rotating selection is always free to stream in the <a href="/free-sounds">sound library</a>. The teahouse and hotpot recordings also have their own smaller set, the <a href="/shop/teahouse-hotpot-collection">Teahouse &amp; Hotpot Collection</a>.</p>
<p>Put on headphones before you book the flight. Chengdu sounds better than you expect — and the city is even better than it sounds.</p>$t$,
  'travel',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20ink%20wash%20painting%20of%20old%20Chengdu%20teahouse%20with%20bamboo%20chairs%20and%20gaiwan%20tea%20cups%2C%20subtle%20concentric%20sound%20waves%20rippling%20outward%2C%20minimalist%2C%20cream%20rice%20paper%20background%2C%20single%20vermillion%20red%20seal%20accent%2C%20editorial%20travel%20illustration%2C%20no%20text&image_size=landscape_16_9']::text[],
  NULL, NULL, 'Chengdu-Voice', '2026-09-24', 0, '2026-09-24 00:00:00+00'
),

-- ============ POST 2: The Mahjong Boom ============
(
  'blog-mahjong-boom-2026',
  'what-is-mahjong-american-boom',
  '麻将是什么？美国麻将热潮完全指南',
  'What Is Mahjong? The American Mahjong Boom Explained',
  $z$<p>每周二晚上，美国波士顿郊区的社区中心里，几十位白人女性围坐一桌，搓着象牙色的麻将牌——这个场景正在全美重演。麻将，这个发源于中国、在四川被玩成全民运动的游戏，正在经历它进入美国一百年来最大的一次爆发：Etsy 2026年趋势报告显示，麻将牌架搜索量上涨228%，Z世代麻将套装上涨178%。</p><p>这篇文章解释麻将到底是什么、美式麻将和四川麻将的规则差异、数字背后的社会原因，以及为什么年轻人突然重新爱上了这种"摸得着的社交"。文末你还能亲耳听到成都公园里手搓麻将的真实声音。</p>$z$,
  $t$<p>On a Tuesday night in a Boston community centre, two dozen women sit four to a table around rows of ivory-coloured tiles, slamming discards down with a sound like hail on a roof. The same scene repeats in Santa Monica, Austin and Queens. The game is mahjong — born in 19th-century China, turned into a national pastime in Sichuan, and now enjoying the biggest boom in its hundred-year history in the United States.</p><p>According to Etsy's own 2026 trend reporting, searches for mahjong tile racks rose roughly 228% year on year, and Gen Z mahjong sets were up around 178%. Third-party keyword trackers put monthly marketplace searches for "mah jong" in the millions, at unusually low competition for the volume. So what is the game, why is it exploding now — and how different is the version they play in Chengdu?</p>

<h2>What Exactly Is Mahjong?</h2>
<p>Mahjong is a four-player tile game played with roughly 144 pieces, usually bamboo-backed plastic or resin. The tiles are grouped into suits (bamboo, characters and dots), honour tiles (winds and dragons) and optional flower and season tiles. Players draw and discard in turn, trying to assemble a complete hand of matched sets — sequences, triplets and a pair — rather like a poker hand built one tile at a time, with memory, probability and ruthless reading of opponents.</p>
<p>The game developed in 19th-century China and spread worldwide in the 1920s, when an American businessman named Joseph P. Babcock simplified and exported the rules from Shanghai. Crucially, every country that adopted it then changed it — which is why "mahjong" today means meaningfully different games depending on where the table is.</p>

<h2>Two Mahjongs, Two Personalities</h2>
<table style="border-collapse:collapse;width:100%;margin:16px 0;">
<thead><tr style="border-bottom:2px solid #000;">
<th style="text-align:left;padding:8px;"></th>
<th style="text-align:left;padding:8px;">American Mahjong</th>
<th style="text-align:left;padding:8px;">Sichuan Mahjong</th>
</tr></thead>
<tbody>
<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;"><strong>Goal</strong></td><td style="padding:8px;">Build one specific "card of the year" hand</td><td style="padding:8px;">Only two suits allowed; win fast, win often</td></tr>
<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;"><strong>Rules</strong></td><td style="padding:8px;">A new official card every year, jokers, Charleston pass</td><td style="padding:8px;">"Blood battle" — winners keep playing the same round</td></tr>
<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;"><strong>Who plays</strong></td><td style="padding:8px;">Leagues, charity games, suburban social clubs</td><td style="padding:8px;">Literally everyone, outdoors, on every day off</td></tr>
<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;"><strong>Vibe</strong></td><td style="padding:8px;">Social ritual — snacks, uniforms, table talk</td><td style="padding:8px;">Gambling-adjacent sport — loud, fast, theatrical</td></tr>
</tbody></table>
<p>American mahjong is organised: the National Mah Jongg League claims over 350,000 members, publishes the annual rule card, and anchors a tournament circuit. Sichuan mahjong is the opposite of organised. In Chengdu it is played on folding tables under trees in People's Park, in teahouse corridors, and beside construction sites, for stakes ranging from loose change to nothing at all. Both versions are social glue — but one wears pearls, the other wears slippers.</p>

<h2>The Numbers Behind the Boom</h2>
<ul>
<li><strong>+228%</strong> — year-on-year rise in searches for mahjong tile racks on Etsy (Etsy 2026 spring/summer trend report)</li>
<li><strong>+178%</strong> — rise for Gen Z-targeted mahjong sets in the same report</li>
<li><strong>350,000+</strong> — members of the National Mah Jongg League, the American game's governing body</li>
<li><strong>Millions/month</strong> — estimated marketplace searches for "mah jong" tracked by keyword tools, with competition still rated low relative to demand</li>
</ul>
<p>Cross-border retail reports from 2026 describe cheap mahjong accessories — tile holders, themed jewellery, table mats — selling in the hundreds of thousands of units in a single month. This is no longer a niche hobby restocking its closet; it is a gifting category being built in real time.</p>

<h2>Why Now? Three Theories</h2>
<h3>1. The hunger for "third places"</h3>
<p>After years of screens and isolation, mahjong offers what algorithmic entertainment cannot: a fixed weekly appointment, in person, where four people must actually pay attention to each other. American players consistently describe their games as social clubs that happen to involve tiles — the Tuesday-night group is the product; winning is the excuse.</p>
<h3>2. Tactile joy in a touchscreen decade</h3>
<p>The tiles click. They have weight. You shuffle them with both hands. Luxury analysts have spent five years documenting the same turn toward physical ritual in board games, stationery and vinyl; mahjong is the maximalist version — a 144-piece, heavily symbolic, photographable object that looks extraordinary on a Pinterest board. (Pinterest reports that the overwhelming majority of its searches are unbranded: people are browsing a feeling, and mahjong tables deliver one.)</p>
<h3>3. Generational handover</h3>
<p>The American game was carried for decades by grandmother leagues. Their granddaughters are now arriving via TikTok and Instagram, seeing the tables as aesthetic heritage rather than elderly recreation, and redesigning the accessories — pastel tile bags, modern racks, jewellery built from tile motifs — for themselves.</p>

<h2>Listen to What the Fuss Sounds Like</h2>
<p>Strip away the statistics and mahjong is, before anything else, a sound. In Chengdu the classic version is hand-rubbed: players mix the tiles face-down in a slow, grinding shuffle before the walls are built. Electric tables have mostly replaced it, making it a disappearing sound. We recorded it under a teahouse awning while a real game was happening around the microphone.</p>
<audio controls preload="none" src="https://ltdrwmvhsbzkoymiqspr.supabase.co/storage/v1/object/public/audio/audio/1785572079200.mp3" style="width:100%;margin:12px 0;"></audio>
<p>That recording, plus the electric automatic shuffle, the Chengdu subway pulse and rain in the old alleys, is part of the <a href="/shop/chengdu-city-soundscapes">Chengdu City Soundscapes</a> collection — five 30-second field recordings that document the city's everyday soundtrack. You can also stream a rotating selection free in the <a href="/free-sounds">sound library</a>.</p>

<h2>Where the Boom Goes Next</h2>
<p>Gaming fads usually flame out; ritual ones compound. Everything about mahjong — the league structure, the weekly cadence, the intergenerational transmission, the gifting around sets — looks more like tennis or bridge than a TikTok trend. The most likely future is not a crash but a broadening: more players, much more merchandise, and a slow bridge between the American social game and its louder, faster Chinese cousins.</p>
<p>If that bridge happens, it will probably happen over sound. The first thing a new player learns is that the game is not about the tiles you hold — it is about reading the table through the noises other people make. The tiles, in both Boston and Chengdu, always do the talking.</p>
<p><em>Numbers in this article are drawn from Etsy's published 2026 spring/summer trend reporting, the National Mah Jongg League's public membership figures, and third-party e-commerce keyword trackers; estimates vary by tool and month.</em></p>$t$,
  'culture',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=overhead%20view%20of%20vintage%20green%20felt%20mahjong%20table%20with%20ivory%20white%20tiles%2C%20one%20tile%20with%20red%20chinese%20dragon%20character%2C%20soft%20window%20light%2C%20cream%20background%2C%20minimalist%20editorial%20still%20life%20photography%2C%20no%20text&image_size=landscape_16_9']::text[],
  NULL, NULL, 'Chengdu-Voice', '2026-09-25', 0, '2026-09-25 00:00:00+00'
)

ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  title_en = EXCLUDED.title_en,
  content = EXCLUDED.content,
  content_en = EXCLUDED.content_en,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  scheduled_at = EXCLUDED.scheduled_at,
  publish_date = EXCLUDED.publish_date;

-- Verify
SELECT slug, title_en, category, publish_date, scheduled_at FROM blogs ORDER BY scheduled_at DESC LIMIT 5;
