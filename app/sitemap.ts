import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { products as defaultProducts, blogPosts as defaultBlogs } from '@/data/mockData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chengdu-voice.onrender.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogs: typeof defaultBlogs = []
  let products: typeof defaultProducts = []

  try {
    [blogs, products] = await Promise.all([
      db.blogs.getAll(),
      db.products.getAll(),
    ])
    console.log(`[Sitemap] Fetched ${blogs.length} blogs and ${products.length} products from DB`)
  } catch (error) {
    console.error('[Sitemap] Error fetching data, using fallback:', error)
    blogs = defaultBlogs
    products = defaultProducts
  }

  if (!blogs || blogs.length === 0) {
    console.log('[Sitemap] Using fallback blog data')
    blogs = defaultBlogs
  }
  if (!products || products.length === 0) {
    console.log('[Sitemap] Using fallback product data')
    products = defaultProducts
  }

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

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${siteUrl}/blog/${blog.id}`,
    lastModified: new Date(blog.publishDate || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/shop/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const result = [...staticRoutes, ...blogRoutes, ...productRoutes]
  console.log(`[Sitemap] Generated ${result.length} total URLs (${blogRoutes.length} blogs, ${productRoutes.length} products)`)
  return result
}
