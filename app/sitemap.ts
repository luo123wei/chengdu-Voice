import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/free-sounds`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  let blogRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch blogs
    const { data: blogs, error: blogError } = await supabase.from('blogs').select('id, slug, publish_date')
    if (!blogError && blogs) {
      blogRoutes = blogs.map((blog: any) => ({
        url: `${siteUrl}/blog/${blog.slug || blog.id}`,
        lastModified: new Date(blog.publish_date || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }

    // Fetch products
    const { data: products, error: productError } = await supabase.from('products').select('id')
    if (!productError && products) {
      productRoutes = products.map((product: any) => ({
        url: `${siteUrl}/shop/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    }

    console.log(`[Sitemap] Generated ${blogRoutes.length} blog URLs and ${productRoutes.length} product URLs`)
  } catch (error) {
    console.error('[Sitemap] Error fetching dynamic data:', error)
  }

  const result = [...staticRoutes, ...blogRoutes, ...productRoutes]
  console.log(`[Sitemap] Total URLs: ${result.length}`)
  return result
}
