-- ============================================================
-- 邮件订阅 + 欢迎折扣码（2026-09-20）
-- 在 Supabase SQL Editor 整段执行
-- ============================================================

-- 邮件订阅者（首页订阅框，区别于 sound_waitlist 声音下载名单）
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email      VARCHAR(255) PRIMARY KEY,
  source     VARCHAR(100) NOT NULL DEFAULT 'homepage',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 折扣码核销记录（WELCOME10：每邮箱限用一次）
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code         VARCHAR(40)  NOT NULL,
  email        VARCHAR(255) NOT NULL,
  order_number VARCHAR(64)  NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (code, email)
);
