// 生成 SEO 友好的 URL slug
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')  // 保留英文、数字、中文、空格、连字符
    .replace(/\s+/g, '-')                         // 空格 → 连字符
    .replace(/-+/g, '-')                          // 多个连字符合并
    .replace(/^-+|-+$/g, '');                     // 去掉首尾连字符
}

// 当 slug 重名时，自动加 -2、-3...
export function makeUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!slug) return '';
  if (!existingSlugs.includes(slug)) return slug;
  let n = 2;
  while (existingSlugs.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// 兼容 blogs 后台的命名
export const generateSlug = slugify;
export const ensureUniqueSlug = makeUniqueSlug;
