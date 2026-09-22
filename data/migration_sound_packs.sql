-- ============================================================
-- Sound Theme Packs: split 44 premium sounds into 5 themed packs
-- Run in Supabase SQL Editor. Idempotent (re-runnable).
-- ============================================================

-- 1. New column: which tracks belong to a digital pack (null = full library)
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_slugs JSONB;

-- 2. Five themed packs
INSERT INTO products (
  id, slug, name, name_en, description, description_en,
  price, category, type, images, stock, rating, reviews, tags,
  story, culture, how_to_use, status, track_slugs
) VALUES

(
  'sichuan-opera-collection',
  'sichuan-opera-collection',
  'Sichuan Opera Collection',
  'Sichuan Opera Collection',
  $t$<p>Ten field recordings from real Sichuan opera performances in Chengdu — the opening drum rhythm, tambourine storytelling, a warrior's battle cry, and the famous face-changing magic. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  $t$<p>Ten field recordings from real Sichuan opera performances in Chengdu — the opening drum rhythm, tambourine storytelling, a warrior's battle cry, and the famous face-changing magic. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  3.99, 'digital', 'digital',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sichuan%20opera%20performer%20mask%20with%20long%20pheasant%20feathers%20and%20bold%20painted%20face%20pattern%2C%20minimalist%20flat%20vector%20album%20cover%20art%2C%20cream%20paper%20background%2C%20black%20ink%20brush%20illustration%2C%20single%20vermillion%20red%20accent%2C%20Chinese%20craft%20aesthetic%2C%20no%20text%2C%20no%20letters%2C%20clean%20composition&image_size=square_hd'],
  9999, 0, 0,
  ARRAY['digital','audio','sichuan-opera','chengdu','culture','field-recording'],
  $t$<p>We recorded these from the audience seats of Chengdu opera theatres, close enough to hear the tambourine skin stretch before every beat. The collection follows a night at the opera: the opening drum that asks the room for silence, Mu Guiying taking command, a warrior's cry, and the moment every tourist waits for — the face changes in a blink and the band never stops.</p>$t$,
  $t$<p>Sichuan opera is roughly 300 years old, and its signature trick, Bian Lian (face-changing), is a closely guarded craft passed down by hand, rarely written down. In Chengdu the opera house is not a museum — locals still go, drink tea, and shout approval mid-scene. These sounds are a working tradition, not a re-enactment.</p>$t$,
  $t$<p>Your download page appears immediately after purchase — no waiting, no shipping. Ten MP3 tracks, clearly named. Use them for listening, teaching material about Chinese theatre, or as authentic background sound for films, podcasts and games set in Sichuan.</p>$t$,
  'on-sale',
  '["mu-guiying-battle-begins","mu-guiying-takes-command-vow","sichuan-opera-colour-and-sound","sichuan-opera-face-changing","sichuan-opera-hidden-meaning","sichuan-opera-painted-face","sichuan-opera-tambourine-story","sichuan-opera-warriors-cry","the-opening-of-sichuan-opera","the-white-snake-legend-opera"]'::jsonb
),

(
  'sichuan-dialect-collection',
  'sichuan-dialect-collection',
  'Speak Sichuanese — Dialect Collection',
  'Speak Sichuanese — Dialect Collection',
  $t$<p>Thirteen recordings of real Sichuan dialect in the wild: Ba Shi, Lang Ge, a flight attendant switching mid-announcement, grandparents teaching Mandarin, and the famous accent fail. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  $t$<p>Thirteen recordings of real Sichuan dialect in the wild: Ba Shi, Lang Ge, a flight attendant switching mid-announcement, grandparents teaching Mandarin, and the famous accent fail. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  3.99, 'digital', 'digital',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=two%20overlapping%20speech%20bubbles%20with%20radiating%20sound%20wave%20lines%2C%20minimalist%20flat%20vector%20album%20cover%20art%2C%20cream%20paper%20background%2C%20black%20ink%20brush%20illustration%2C%20single%20vermillion%20red%20accent%2C%20Chinese%20craft%20aesthetic%2C%20no%20text%2C%20no%20letters%2C%20clean%20composition&image_size=square_hd'],
  9999, 0, 0,
  ARRAY['digital','audio','sichuan-dialect','chengdu','language','field-recording'],
  $t$<p>You cannot learn Sichuanese from a textbook — it lives in markets, kitchens and family group chats. So we recorded it where it actually happens: a flight attendant slipping into dialect mid-announcement, two friends arguing in a way that sounds like fighting but is not, a grandmother teaching Mandarin that keeps escaping into Sichuan tone. Thirteen moments, thirty seconds each.</p>$t$,
  $t$<p>Sichuan dialect is spoken by over 100 million people, and it is famously expressive — one word like Lang Ge can mean how, why and like this all at once. Locals say Mandarin tells facts while Sichuanese tells feelings. As younger generations shift toward Mandarin, these everyday voices are quietly becoming cultural records.</p>$t$,
  $t$<p>Your download page appears immediately after purchase. Thirteen MP3 tracks, clearly named. Great for language learners who want real rhythm and tone instead of classroom Mandarin, or for creators who need authentic voices of southwest China.</p>$t$,
  'on-sale',
  '["ba-shi-sichuan-perfect","chengdu-sichuan-dialect-home","flight-attendant-sichuan-dialect","grandparents-teach-mandarin-sichuan","lang-ge-sichuan-multipurpose-word","mandarin-vs-sichuan-one-sentence","ni-xue-hui-le-ma","sichuan-argue-not-fight","sichuan-dialect-comedy","sichuan-dialect-vs-mandarin","sichuan-girls-say-love","sichuan-mandarin-accent-escape","sichuan-mandarin-accent-fail"]'::jsonb
),

(
  'teahouse-hotpot-collection',
  'teahouse-hotpot-collection',
  'Teahouse & Hotpot Collection',
  'Teahouse & Hotpot Collection',
  $t$<p>Five recordings of Chengdu at its most delicious: a gaiwan tea lid clinking in People's Park, a teapot pouring slow, and two takes of hotpot at full boil with chopsticks and laughter. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  $t$<p>Five recordings of Chengdu at its most delicious: a gaiwan tea lid clinking in People's Park, a teapot pouring slow, and two takes of hotpot at full boil with chopsticks and laughter. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  2.99, 'digital', 'digital',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=steaming%20gaiwan%20tea%20cup%20beside%20a%20bubbling%20hotpot%2C%20rising%20steam%20curls%2C%20minimalist%20flat%20vector%20album%20cover%20art%2C%20cream%20paper%20background%2C%20black%20ink%20brush%20illustration%2C%20single%20vermillion%20red%20accent%2C%20Chinese%20craft%20aesthetic%2C%20no%20text%2C%20no%20letters%2C%20clean%20composition&image_size=square_hd'],
  9999, 0, 0,
  ARRAY['digital','audio','teahouse','hotpot','chengdu','food','field-recording'],
  $t$<p>This pack started where the whole project started: Heming Teahouse in People's Park, a gaiwan of jasmine tea, and the sound of a hundred porcelain lids being lifted at once. We added the other half of Chengdu life the same week — hotpot at full boil, the broth ticking, friends toasting loudly over the steam. Tea slows the city down; hotpot fires it back up.</p>$t$,
  $t$<p>Teahouses are Chengdu's public living rooms — old men play cards for hours over one cup, and refills cost almost nothing. Hotpot is the opposite ritual: loud, spicy and communal, where the table itself does the cooking. Together they explain the local rhythm of the city better than any guidebook.</p>$t$,
  $t$<p>Your download page appears immediately after purchase. Five MP3 tracks, clearly named. Ideal as ambient sound for restaurants, tea brands, cooking videos, or anyone missing the sound of a Chengdu afternoon.</p>$t$,
  'on-sale',
  '["drinking-tea-chengdu","tea-pouring-chengdu-teahouse","sichuan-hotpot-boiling","sichuan-hotpot-sounds-laughter","drinking-with-friends-chengdu"]'::jsonb
),

(
  'everyday-chengdu-collection',
  'everyday-chengdu-collection',
  'Everyday Chengdu Collection',
  'Everyday Chengdu Collection',
  $t$<p>Eleven recordings of ordinary life in Chengdu: the morning vegetable market, haggling at a shop, a chatty clinic doctor, a blind date where the girl pulls his ear, and the phrase that sends everyone to bed. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  $t$<p>Eleven recordings of ordinary life in Chengdu: the morning vegetable market, haggling at a shop, a chatty clinic doctor, a blind date where the girl pulls his ear, and the phrase that sends everyone to bed. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  3.99, 'digital', 'digital',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bicycle%20loaded%20with%20vegetables%20and%20a%20bamboo%20basket%20at%20a%20morning%20market%2C%20minimalist%20flat%20vector%20album%20cover%20art%2C%20cream%20paper%20background%2C%20black%20ink%20brush%20illustration%2C%20single%20vermillion%20red%20accent%2C%20Chinese%20craft%20aesthetic%2C%20no%20text%2C%20no%20letters%2C%20clean%20composition&image_size=square_hd'],
  9999, 0, 0,
  ARRAY['digital','audio','chengdu','daily-life','culture','field-recording'],
  $t$<p>The famous sights of Chengdu take an afternoon. Its everyday life takes years to know. We spent weeks recording the parts tourists usually walk past: wet markets at dawn, a doctor who talks like an old friend, shopping-day bargaining, the joke of a Sichuan wife saying go to sleep. This is the pack that sounds most like actually living here.</p>$t$,
  $t$<p>Chengdu is consistently ranked one of the most liveable and happiest cities in China, and the reasons are audible: unhurried markets, doctors with time to chat, and a culture where Pa Er Duo — a wife pulling her husband's ear — is a public display of affection, not a fight. These small rituals are the real heritage.</p>$t$,
  $t$<p>Your download page appears immediately after purchase. Eleven MP3 tracks, clearly named. Perfect as writing ambience, documentary material, or a small daily escape into someone else's ordinary morning.</p>$t$,
  'on-sale',
  '["buying-vegetables-chengdu","chengdu-wet-market","going-to-doctor-chengdu","sichuan-clinic-chatty-doctor","ordinary-day-chengdu","pa-er-duo-blind-date","sichuan-person-happiness","sichuan-shopping-day","sichuan-wife-say-go-to-sleep","zhu-ni-xing-fu-sichuan","chengdu-sound-of-home"]'::jsonb
),

(
  'chengdu-city-soundscapes',
  'chengdu-city-soundscapes',
  'Chengdu City Soundscapes',
  'Chengdu City Soundscapes',
  $t$<p>Five recordings of the city itself: rain on the Wide and Narrow Alleys, hand-rubbed mahjong tiles, automatic tile shuffling, the subway running under an ancient city, and the local art of doing things later. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  $t$<p>Five recordings of the city itself: rain on the Wide and Narrow Alleys, hand-rubbed mahjong tiles, automatic tile shuffling, the subway running under an ancient city, and the local art of doing things later. Each track is 30 seconds, MP3 320kbps, instant download.</p>$t$,
  2.99, 'digital', 'digital',
  ARRAY['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rain%20falling%20over%20old%20chinese%20tiled%20rooftops%20in%20a%20narrow%20alley%2C%20minimalist%20flat%20vector%20album%20cover%20art%2C%20cream%20paper%20background%2C%20black%20ink%20brush%20illustration%2C%20single%20vermillion%20red%20accent%2C%20Chinese%20craft%20aesthetic%2C%20no%20text%2C%20no%20letters%2C%20clean%20composition&image_size=square_hd'],
  9999, 0, 0,
  ARRAY['digital','audio','soundscapes','rain','mahjong','chengdu','field-recording'],
  $t$<p>Every city has a background track, and this is Chengdu's. Rain landing on grey tiled rooftops in the Wide and Narrow Alleys. Mahjong the old way — tiles rubbed by hand — next to the electric shuffler that replaced it. The subway humming below streets that are centuries older. And Xian Chou Le, the local phrase meaning I will deal with it later, which is really the sound of the whole city agreeing to relax.</p>$t$,
  $t$<p>Mahjong is Sichuan's unofficial sport, played in teahouses, alleys and living rooms — the hand-rubbed tile sound is disappearing as machines take over. Rain in the alleys is equally fragile: as old courtyards are renovated, that particular rooftop rhythm changes. These recordings keep both versions of the city.</p>$t$,
  $t$<p>Your download page appears immediately after purchase. Five MP3 tracks, clearly named. Made for focus sessions, rain-and-leisure ambience, sleep playlists, or film and game scenes set in a rainy southern Chinese city.</p>$t$,
  'on-sale',
  '["automatic-mahjong-shuffling","hand-rubbed-mahjong","chengdu-subway-pulse","rain-wide-narrow-alleys","xian-chou-le-sichuan"]'::jsonb
)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  type = EXCLUDED.type,
  images = EXCLUDED.images,
  stock = EXCLUDED.stock,
  tags = EXCLUDED.tags,
  story = EXCLUDED.story,
  culture = EXCLUDED.culture,
  how_to_use = EXCLUDED.how_to_use,
  status = EXCLUDED.status,
  track_slugs = EXCLUDED.track_slugs;

-- 3. Verify
SELECT slug, name_en, price, jsonb_array_length(track_slugs) AS tracks FROM products WHERE type = 'digital' ORDER BY price DESC;
