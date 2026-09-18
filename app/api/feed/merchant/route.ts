import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';
const BRAND_NAME = 'Voice Culture';

// XML escape helper
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
    const title = esc(p.nameEn);

    const extras = [
      `<g:id>${esc(p.id)}</g:id>`,
      `<g:brand>${esc(BRAND_NAME)}</g:brand>`,
      `<g:price>${priceFormatted}</g:price>`,
      `<g:availability>${availability}</g:availability>`,
      `<g:condition>new</g:condition>`,
      `<g:image_link>${esc(mainImage)}</g:image_link>`,
    ];

    if (p.images.length > 1) {
      extras.push(`<g:additional_image_link>${esc(p.images.slice(1, 10).join('\n'))}</g:additional_image_link>`);
    }
    if (p.tags?.length) {
      extras.push(`<g:product_type>${esc(p.tags.slice(0, 3).join(' > '))}</g:product_type>`);
    }
    if (p.reviews > 0) {
      extras.push(`<g:review_rating>${p.rating.toFixed(1)}</g:review_rating>`);
      extras.push(`<g:review_count>${p.reviews}</g:review_count>`);
    }

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
    <g:items>
${onSale.map(buildItem).join('\n')}
    </g:items>
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}
