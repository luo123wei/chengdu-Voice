export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 7)
    .join('-')
}

export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) {
    return slug
  }

  let counter = 2
  let newSlug = `${slug}-${counter}`
  while (existingSlugs.includes(newSlug)) {
    counter++
    newSlug = `${slug}-${counter}`
  }
  return newSlug
}
