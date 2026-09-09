import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { slugify, makeUniqueSlug } from '@/lib/slug';

const JWT_SECRET = process.env.JWT_SECRET || 'chengdu-voice-secret-key';

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    return payload?.role === 'admin' || payload?.username !== undefined;
  } catch {
    return false;
  }
}

// 为所有缺少 slug 的产品批量生成并写入 slug
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
  }

  try {
    const allProducts = await db.products.getAll();

    // 已存在的 slug 集合（用于去重）
    const existingSlugs = allProducts
      .filter((p) => p.slug)
      .map((p) => p.slug!);

    const results: { id: string; nameEn: string; slug: string }[] = [];

    for (const product of allProducts) {
      if (product.slug) continue; // 已有 slug 跳过

      let slug = slugify(product.nameEn);
      if (!slug) slug = `product-${product.id}`;
      slug = makeUniqueSlug(slug, existingSlugs);
      existingSlugs.push(slug);

      await db.products.update(product.id, { slug });
      results.push({ id: product.id, nameEn: product.nameEn, slug });
    }

    return NextResponse.json({
      success: true,
      message: `已为 ${results.length} 个产品生成 slug`,
      updated: results,
    });
  } catch (error: any) {
    console.error('[migrate-slugs] error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || '迁移失败' },
      { status: 500 }
    );
  }
}
