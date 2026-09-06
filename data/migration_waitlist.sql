-- ============================================
-- 候补名单（成都声音地图专辑）迁移脚本
-- 在 Supabase SQL Editor 执行一次即可
-- ============================================

-- 1. 建表
CREATE TABLE IF NOT EXISTS sound_waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'sound-map',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sound_waitlist_email_unique UNIQUE (email)
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_sound_waitlist_created_at ON sound_waitlist (created_at DESC);

-- 3. RLS：允许任何人登记（insert），禁止公开读取/修改
ALTER TABLE sound_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_public_insert" ON sound_waitlist;
CREATE POLICY "waitlist_public_insert" ON sound_waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 后台读取走 service_role（绕过 RLS），无需公开 select 策略
