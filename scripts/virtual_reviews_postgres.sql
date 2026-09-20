-- ============================================================
-- 纯 SQL 虚拟评论定时任务（Supabase pg_cron）
--
-- 使用方法：
--   1. 打开 Supabase Dashboard → 你的项目 → SQL Editor
--   2. 粘贴本文件全部内容 → Run
--   3. 完成！以后每月 1 号 UTC 02:00 自动跑
--
-- 想暂停：
--   SELECT cron.unschedule('monthly-virtual-reviews');
--
-- 想手动立即跑一次：
--   SELECT public.generate_monthly_virtual_reviews();
--
-- 想删掉定时任务和函数：
--   SELECT cron.unschedule('monthly-virtual-reviews');
--   DROP FUNCTION IF EXISTS public.generate_monthly_virtual_reviews();
--   DROP TABLE IF EXISTS public.vr_comment_pool;
--   DROP TABLE IF EXISTS public.vr_nickname_pool;
-- ============================================================

-- pg_cron 在本项目不可用，定时任务改用 Supabase Edge Function + cron-job.org
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 1. 评论内容池（通用文创英文好评，35 条）
-- 可随时加更多内容：INSERT INTO public.vr_comment_pool VALUES ('...');
-- ============================================================
DROP TABLE IF EXISTS public.vr_comment_pool;
CREATE TABLE public.vr_comment_pool (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL
);

INSERT INTO public.vr_comment_pool (content) VALUES
('Beautiful design, looks even better in person than in the photos. The packaging was lovely too.'),
('Great quality for the price. You can tell this was designed and made with care, not just mass-produced.'),
('Fast shipping, well-packaged, and the item itself is stunning. Very happy with my purchase.'),
('This is my new favorite thing on my desk / shelf / bag. Friends keep asking where I got it.'),
('Perfect gift for anyone who loves Chengdu, panda culture, or well-made craft objects. Would buy again.'),
('The craftsmanship is real. Small details you can feel make this worth every penny.'),
('Arrived quickly and in perfect condition. The colors and textures are exactly as shown. No surprises.'),
('I wasn''t sure at first but it''s become one of my most-used items. Definitely recommend.'),
('A little piece of Chengdu that travels with you. Love the story and care behind this brand.'),
('Great for daily use and for display. Feels like something you''d keep for years.'),
('Solid quality, thoughtful design. This is how independent craft brands should be doing it.'),
('Bought one for myself and immediately ordered two more as gifts. That should tell you something.'),
('The texture and material have a nice feel to it. Not cheap, not overly fancy — just right.'),
('The attention to detail is impressive. Everything from the packaging to the product itself feels considered.'),
('Would absolutely order from Voice Culture again. The whole experience was a pleasure.'),
('This is going to be such a good gift. The recipient is going to love it — I can already tell.'),
('Came beautifully packaged. I barely wanted to open it myself before gifting. Quality present.'),
('It''s the kind of gift that doesn''t feel like an afterthought. People remember receiving things like this.'),
('Perfect for anyone who collects small cultural objects or just loves nice things on their desk.'),
('I gave this to a friend and they immediately started using it. Always a good sign.'),
('As a panda enthusiast, this did not disappoint. The panda details are on point, not generic.'),
('Chengdu pandas are the best pandas. This does them justice in design and quality.'),
('Minimal but warm. The aesthetic is exactly my taste — not too loud, not too plain.'),
('Clean lines, good proportions. Whoever designed this has an eye.'),
('It''s a design object, not just a product. I appreciate that Voice Culture puts thought into form.'),
('Feels like something MoMA would stock, but at a price normal people can actually afford.'),
('Arrived two days earlier than the estimate. That was a nice surprise.'),
('The brand card that came with it is a nice touch. Feels like you''re sharing a story, not just a thing.'),
('I''ve had it for a month now and it''s holding up beautifully. No loose threads, no fading.'),
('The price is very fair for what you get. This would cost twice as much in a boutique.'),
('Shipping internationally was smooth. Customs was fast, no extra fees beyond what was quoted.'),
('I compared with three similar products online and this one was the clear winner on quality.'),
('The little thoughtful extras (packaging, card, sticker) make it feel like a small studio, not a dropshipper.'),
('This replaced three random things I was considering getting. Obvious choice.'),
('Someone asked me where I got their birthday gift. I told them, and they ordered one too.');

-- ============================================================
-- 2. 昵称池（虚拟买家名，30 个）
-- ============================================================
DROP TABLE IF EXISTS public.vr_nickname_pool;
CREATE TABLE public.vr_nickname_pool (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL
);

INSERT INTO public.vr_nickname_pool (nickname) VALUES
('Emma_W'), ('JamesChen'), ('Sarah.L'), ('Michael.T'), ('Lisa_Zhao'),
('David.Kim'), ('RachelGreen'), ('Tom_Wilson'), ('Jessica.P'), ('Kevin_L'),
('Anna_White'), ('Sophia.M'), ('Robert_H'), ('Yuki_Tanaka'), ('Emily_C'),
('Daniel.S'), ('Olivia_B'), ('Chris_Wong'), ('Laura.V'), ('Mark_R'),
('Hannah_G'), ('Amelia.B'), ('Lucas_M'), ('Mia_C'), ('Noah.K'),
('Zoe_R'), ('Ethan_P'), ('Lily_S'), ('Leo_F'), ('Ava_G');

-- ============================================================
-- 3. 核心函数：每月自动加评论 + 清理超量 + 重算 rating
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_monthly_virtual_reviews()
RETURNS TABLE(added INT, deleted INT) AS $$
DECLARE
  v_product RECORD;
  v_to_add INT;
  v_count INT;
  v_limit_date DATE;
  v_rating DECIMAL;
  v_date DATE;
  v_review_id TEXT;
BEGIN
  added := 0;
  deleted := 0;

  -- 上月日期范围
  v_limit_date := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE;

  -- 每个在售/预售产品
  FOR v_product IN
    SELECT id, slug, name_en FROM products
    WHERE status IS NULL OR status IN ('on-sale', 'preorder')
  LOOP
    -- 每产品加 2-4 条
    v_to_add := 2 + FLOOR(RANDOM() * 3);

    FOR i IN 1..v_to_add LOOP
      -- rating: 85% 4.5-5.0，15% 4.0
      IF RANDOM() < 0.85 THEN
        v_rating := CASE WHEN RANDOM() < 0.65 THEN 5.0 ELSE 4.5 END;
      ELSE
        v_rating := 4.0;
      END IF;

      -- 上月随机日期（0-27 天，恒在上月内，绝不产生未来日期）
      v_date := (DATE_TRUNC('month', v_limit_date) + (FLOOR(RANDOM() * 28))::INT)::DATE;

      v_review_id := 'vr-' || v_product.id || '-m-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || i;

      -- 评论内容与昵称在同一条子查询里一次性配对，邮箱由昵称派生（保证一致）
      -- 且优先选该产品尚未用过的昵称（避免同人同品重复评论）
      INSERT INTO reviews (id, product_id, nickname, email, rating, content, date, verified, verified_email)
      SELECT
        v_review_id,
        v_product.id,
        src.nickname,
        LOWER(src.nickname) || '@example.com',
        v_rating,
        src.content,
        v_date,
        TRUE,
        TRUE
      FROM (
        SELECT c.content, p.nickname
        FROM public.vr_comment_pool c
        CROSS JOIN public.vr_nickname_pool p
        WHERE NOT EXISTS (
          SELECT 1 FROM reviews r
          WHERE r.product_id = v_product.id AND r.nickname = p.nickname AND r.id LIKE 'vr-%'
        )
        ORDER BY RANDOM()
        LIMIT 1
      ) src;

      -- 兜底：昵称池已全部用满时，去掉去重条件再插一次
      IF NOT FOUND THEN
        INSERT INTO reviews (id, product_id, nickname, email, rating, content, date, verified, verified_email)
        SELECT
          v_review_id,
          v_product.id,
          src.nickname,
          LOWER(src.nickname) || '@example.com',
          v_rating,
          src.content,
          v_date,
          TRUE,
          TRUE
        FROM (
          SELECT c.content, p.nickname
          FROM public.vr_comment_pool c
          CROSS JOIN public.vr_nickname_pool p
          ORDER BY RANDOM()
          LIMIT 1
        ) src;
      END IF;

      added := added + 1;
    END LOOP;

    -- 每个产品最多保留最新 25 条虚拟评论
    SELECT COUNT(*) INTO v_count FROM reviews
    WHERE product_id = v_product.id AND id LIKE 'vr-%';

    IF v_count > 25 THEN
      DELETE FROM reviews
      WHERE id IN (
        SELECT id FROM reviews
        WHERE product_id = v_product.id AND id LIKE 'vr-%'
        ORDER BY date DESC, id DESC
        OFFSET 25
      );
      deleted := deleted + (v_count - 25);
    END IF;

    -- 重算 product rating / reviews
    PERFORM update_product_rating(v_product.id);
  END LOOP;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. 辅助函数：重算单个产品 rating
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_product_rating(p_product_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_total INT;
  v_sum NUMERIC;
  v_avg DECIMAL(3,1);
BEGIN
  SELECT COUNT(*), COALESCE(SUM(rating), 0) INTO v_total, v_sum
  FROM reviews WHERE product_id = p_product_id;

  IF v_total = 0 THEN
    UPDATE products SET rating = 0, reviews = 0 WHERE id = p_product_id;
  ELSE
    v_avg := ROUND((v_sum / v_total)::NUMERIC, 1);
    UPDATE products SET rating = v_avg, reviews = v_total WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. 定时任务通过 cron-job.org → Supabase Edge Function 触发
--    （本项目 pg_cron 不可用，已在外部配置）
--    Edge Function 调用: SELECT public.generate_monthly_virtual_reviews();
-- ============================================================

-- 输出确认信息
SELECT '✅ 全部完成' AS status;
