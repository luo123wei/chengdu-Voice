-- 博客定时发布功能迁移脚本
-- 在 Supabase SQL Editor 中执行

-- 1. 添加 scheduled_at 字段（存储定时发布的 ISO 时间）
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 2. 添加索引便于按发布时间查询
CREATE INDEX IF NOT EXISTS idx_blogs_scheduled_at ON blogs(scheduled_at);

-- 3. 将已有博客的作者默认值设为 'Chengdu-Voice'（仅对空值）
UPDATE blogs SET author = 'Chengdu-Voice' WHERE author IS NULL OR author = '';

-- 4. 验证字段已添加
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'blogs'
ORDER BY ordinal_position;
