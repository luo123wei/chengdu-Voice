-- Migration: Add slug field to blogs table
-- Run this on existing Supabase databases

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Update existing rows with slugs based on their English titles
UPDATE blogs SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE(title_en, title),
      '[^a-zA-Z0-9\s-]',
      '',
      'g'
    ),
    '\s+',
    '-',
    'g'
  )
)
WHERE slug IS NULL;
