-- ============================================================
-- analytics_events: unified event stream for blog/product views,
-- add-to-cart, and order creation. Used by /admin dashboard stats.
-- Run in Supabase SQL Editor (idempotent).
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text NOT NULL,           -- 'blog_view' | 'product_view' | 'add_to_cart' | 'order_created'
  target_id   text,                    -- blog slug / product slug / order id
  session_id  text,                    -- for UV dedup (sessionId cookie or anon IP hash)
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_events_type_target_time
  ON analytics_events (event_type, target_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_time
  ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_session
  ON analytics_events (session_id);

-- Enable Row Level Security (server uses service role key, bypasses RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop-and-recreate policies (idempotent)
DROP POLICY IF EXISTS "analytics_events_service_role_all" ON analytics_events;
CREATE POLICY "analytics_events_service_role_all"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
