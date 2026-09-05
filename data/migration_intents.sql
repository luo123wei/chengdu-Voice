-- ============================================================
-- 文创工作室改造迁移:产品生命周期 + 投票/预售 + 预售时间
-- 在 Supabase SQL Editor 手动执行(整段粘贴 → Run)
-- 幂等设计,可重复执行
-- ============================================================

-- 1. 清空旧产品数据(旧品类:茶/豆瓣/蜀绣/声音专辑,与文创方向不符)
--    注意:orders 订单表不受影响
DELETE FROM reviews;
DELETE FROM carts;
DELETE FROM products;

-- 1b. 清空旧博客(声音文化主题),前台空数据会自动回退到 mockData 里的 3 篇设计故事
DELETE FROM blogs;

-- 1c. 重置 settings 行,使站点回退到代码内的新品牌默认值(Chengdu Craft Studio / 成都造物)
--     之后可在后台「设置」页重新保存;若曾自定义邮件发件人等配置,请先在后台记录
DELETE FROM settings;

-- 2. products 增加状态、票数、预售时间字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'on-sale';
ALTER TABLE products ADD COLUMN IF NOT EXISTS votes_count INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_end TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS on_sale_at TIMESTAMPTZ;

-- 3. 投票/预订意向表(市场调研)
CREATE TABLE IF NOT EXISTS product_intents (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  visitor_id VARCHAR(64) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vote','preorder')),
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 同一访客对同一产品的同类型意向只能有一条(防重复投票/重复登记)
-- 包含 type:允许同一人既投票又留预售邮箱
CREATE UNIQUE INDEX IF NOT EXISTS idx_intents_product_visitor_type
  ON product_intents(product_id, visitor_id, type);

-- 3b. RLS:允许匿名访客写入/读取意向(service role key 不受限,anon key 也能正常工作)
ALTER TABLE product_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intents_public_insert" ON product_intents;
CREATE POLICY "intents_public_insert" ON product_intents
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "intents_public_select" ON product_intents;
CREATE POLICY "intents_public_select" ON product_intents
  FOR SELECT USING (true);

-- 4. 票数原子自增 RPC(SECURITY DEFINER:即使站点只用 anon key 也能自增票数)
CREATE OR REPLACE FUNCTION increment_votes(p_id VARCHAR)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE products SET votes_count = votes_count + 1 WHERE id = p_id;
$$;

-- 5. 保险:历史数据状态兜底
UPDATE products SET status = 'on-sale' WHERE status IS NULL;

-- 6. 验证(执行后下方 Results 应能看到新表和新列)
-- SELECT COUNT(*) AS intents_table_ok FROM information_schema.tables WHERE table_name = 'product_intents';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('status','votes_count','preorder_end','on_sale_at');
