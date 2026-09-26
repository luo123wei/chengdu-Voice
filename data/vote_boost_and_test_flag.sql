-- ============================================================
-- vote_boost_logs: daily random vote boosts for design products
-- analytics_events: add is_test flag to filter out test data
-- Run in Supabase SQL Editor (idempotent).
-- ============================================================

-- 1. vote_boost_logs: log every system-added random vote
CREATE TABLE IF NOT EXISTS vote_boost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  boost_count int NOT NULL,                -- 1~10 random
  boosted_date date NOT NULL,               -- which day (UTC)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotency: same product, same day can only be boosted once
CREATE UNIQUE INDEX IF NOT EXISTS idx_boost_product_date
  ON vote_boost_logs (product_id, boosted_date);

-- Time range queries for stats
CREATE INDEX IF NOT EXISTS idx_boost_date ON vote_boost_logs (boosted_date);
CREATE INDEX IF NOT EXISTS idx_boost_product ON vote_boost_logs (product_id);

ALTER TABLE vote_boost_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vote_boost_service_role_all" ON vote_boost_logs;
CREATE POLICY "vote_boost_service_role_all"
  ON vote_boost_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. analytics_events: add is_test flag for filtering out test data
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Index to speed up "exclude test" filter
CREATE INDEX IF NOT EXISTS idx_events_not_test
  ON analytics_events (event_type, created_at)
  WHERE is_test = false;
