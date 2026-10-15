-- ============================================================
-- analytics_events: capture user agent + classify AI/search bots
-- Powers the "AI 可见度" admin panel (GPTBot / PerplexityBot / ClaudeBot ...).
--
-- ⚠️ 必须在部署代码之前，先在 Supabase SQL Editor 执行本文件（幂等）。
--    否则 analytics_events 的插入会因缺少 user_agent / bot_name 两列而失败，
--    在列创建完成之前，页面浏览事件都无法被记录。
-- ============================================================

-- 1. Raw user agent for every event
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. Classified bot name (NULL for human traffic)
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS bot_name text;

-- Index to speed up "which bots hit us, over time" queries
CREATE INDEX IF NOT EXISTS idx_events_bot_time
  ON analytics_events (bot_name, created_at DESC);
