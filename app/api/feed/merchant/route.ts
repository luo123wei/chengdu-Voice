import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
const BRAND_NAME = 'Voice Culture';

// Google product category IDs（Google 标准分类）
// https://www.google.com/basepages/producttype/taxonomy.en-US.txt
const CATEGORY_MAP: Record<string, string> = {
  'Wax Seal Stamp': 'Home & Garden > Decor',
  'Panda Plush': 'Toys & Games > Toys > Plush Toys',
  'Panda Egg': 'Home & Garden > Decor',
  'Keychain': 'Apparel & Accessories > Accessories > Keychains',
  'default': 'Home & Garden > Decor',
};

// XML escape helper
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 根据产品名称匹配 Google 分类
function getGoogleCategory(nameEn: string): string {
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (key !== 'default' && nameEn.toLowerCase().includes(key.toLowerCase())) {
      return cat;
    }
  }
  return CATEGORY_MAP['default'];
}

// 优化标题：加关键词让 Google Shopping 搜索更容易命中
function optimizeTitle(nameEn: string): string {
  // 如果标题里没有 "Chengdu"，加上
  if (!nameEn.toLowerCase().includes('chengdu')) {
    return `Chengdu ${nameEn}`;
  }
  return nameEn;
}

export async function GET() {
  const products = await db.products.getAll();

  // 只输出在售商品
  const onSale = products.filter(
    (p) => (!p.status || p.status === 'on-sale') && p.price > 0 && p.images?.length
  );

  const buildItem = (p: typeof products[number]) => {
    const slug = p.slug || p.id;
    const link = `${SITE_URL}/shop/${slug}`;
    const mainImage = p.images[0];
    const priceFormatted = `${p.price.toFixed(2)} USD`;
    const availability = (p.stock ?? 0) > 0 ? 'in_stock' : 'out_of_stock';
    const description = esc(
      (p.descriptionEn || p.story || p.nameEn || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)
    );
    const title = esc(optimizeTitle(p.nameEn));
    const googleCategory = esc(getGoogleCategory(p.nameEn));

    const extras = [
      `<g:id>${esc(p.id)}</g:id>`,
      `<g:brand>${esc(BRAND_NAME)}</g:brand>`,
      `<g:price>${priceFormatted}</g:price>`,
      `<g:availability>${availability}</g:availability>`,
      `<g:condition>new</g:condition>`,
      `<g:image_link>${esc(mainImage)}</g:image_link>`,
      `<g:google_product_category>${googleCategory}</g:google_product_category>`,
      // 告诉 Google 这个是自有品牌小批量产品，没有 GTIN/MPN
      `<g:identifier_exists>no</g:identifier_exists>`,
      // 运费信息（和网站 Shipping Policy 一致）
      `<g:shipping>`,
      `  <g:country>US</g:country>`,
      `  <g:service>Standard</g:service>`,
      `  <g:price>5.99 USD</g:price>`,
      `</g:shipping>`,
      `<g:shipping>`,
      `  <g:country>US</g:country>`,
      `  <g:service>Express</g:service>`,
      `  <g:price>18.99 USD</g:price>`,
      `</g:shipping>`,
      `<g:shipping>`,
      `  <g:country>AU</g:country>`,
      `  <g:service>Standard</g:service>`,
      `  <g:price>6.99 USD</g:price>`,
      `</g:shipping>`,
      `<g:shipping>`,
      `  <g:country>CA</g:country>`,
      `  <g:service>Standard</g:service>`,
      `  <g:price>5.99 USD</g:price>`,
      `</g:shipping>`,
      `<g:shipping>`,
      `  <g:country>GB</g:country>`,
      `  <g:service>Standard</g:service>`,
      `  <g:price>6.99 USD</g:price>`,
      `</g:shipping>`,
      `<g:shipping>`,
      `  <g:country>DE</g:country>`,
      `  <g:service>Standard</g:service>`,
      `  <g:price>5.99 USD</g:price>`,
      `</g:shipping>`,
    ];

    if (p.images.length > 1) {
      p.images.slice(1, 10).forEach((img) => {
        extras.push(`<g:additional_image_link>${esc(img)}</g:additional_image_link>`);
      });
    }
    if (p.tags?.length) {
      extras.push(`<g:product_type>${esc(p.tags.slice(0, 3).join(' > '))}</g:product_type>`);
    }
    // 注意：商品评分/评论数不属于商品 Feed 字段（g:review_rating / g:review_count
    // 不是 Content API 商品属性，会被 Merchant Center 标记为 unrecognized）。
    // 星级评价需通过独立的 Product Ratings Feed 提交，属于后续进阶功能。

    return `    <item>
      <title>${title}</title>
      <link>${esc(link)}</link>
      <description>${description}</description>
      ${extras.join('\n      ')}
    </item>`;
  };

  const now = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(BRAND_NAME)}</title>
    <link>${esc(SITE_URL)}</link>
    <description>Chengdu cultural gifts and souvenirs shipped worldwide</description>
    <lastBuildDate>${now}</lastBuildDate>
${onSale.map(buildItem).join('\n')}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
