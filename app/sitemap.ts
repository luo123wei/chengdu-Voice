import type { MetadataRoute } from 'next'

// 每次请求时动态生成，确保新增产品/博客及时出现在 sitemap 中
export const dynamic = 'force-dynamic'

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
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/return-refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  let blogRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []
  let soundRoutes: MetadataRoute.Sitemap = []

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    const nowIso = new Date().toISOString()

    // Fetch blogs (已发布)
    const { data: blogs, error: blogError } = await supabase.from('blogs').select('id, slug, publish_date, scheduled_at')
      .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
    if (!blogError && blogs) {
      blogRoutes = blogs.map((blog: any) => ({
        url: `${siteUrl}/blog/${blog.slug || blog.id}`,
        lastModified: new Date(blog.publish_date || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }

    // Fetch products
    const { data: products, error: productError } = await supabase.from('products').select('id, slug')
    if (!productError && products) {
      productRoutes = products.map((product: any) => ({
        url: `${siteUrl}/shop/${product.slug || product.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    }

    // Fetch sounds (已发布且有 slug)
    const { data: sounds, error: soundError } = await supabase.from('free_sounds').select('slug, created_at')
      .not('slug', 'is', null)
      .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
    if (!soundError && sounds) {
      soundRoutes = sounds.map((s: any) => ({
        url: `${siteUrl}/free-sounds/${s.slug}`,
        lastModified: new Date(s.created_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }

    console.log(`[Sitemap] Generated ${blogRoutes.length} blog URLs, ${productRoutes.length} product URLs, ${soundRoutes.length} sound URLs`)
  } catch (error) {
    console.error('[Sitemap] Error fetching dynamic data:', error)
  }

  const result = [...staticRoutes, ...blogRoutes, ...productRoutes, ...soundRoutes]
  console.log(`[Sitemap] Total URLs: ${result.length}`)
  return result
}
