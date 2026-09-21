-- ============================================================
-- 数字专辑购买记录表（Route A 自动交付）
-- 在 Supabase SQL Editor 执行
-- ============================================================
CREATE TABLE IF NOT EXISTS purchased_albums (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email        VARCHAR(255) NOT NULL,
  order_number VARCHAR(64) NOT NULL,
  album_slug   VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, order_number, album_slug)
);
