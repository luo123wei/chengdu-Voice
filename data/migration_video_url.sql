-- 给 products 表添加视频链接字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
