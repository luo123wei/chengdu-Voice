import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 投票/预订意向
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, visitorId, type, email } = body;

    if (!productId || !visitorId || !['vote', 'preorder'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // upsert:同访客同产品重复提交会被唯一索引忽略
    const counted = await db.intents.add({ productId, visitorId, type, email: email || undefined });

    // 仅新插入的投票触发票数自增
    if (counted && type === 'vote') {
      await db.intents.incrementVotes(productId);
    }

    const product = await db.products.getById(productId);
    return NextResponse.json({
      success: true,
      counted,                       // false = 之前已投过
      votes: product?.votesCount ?? 0,
    });
  } catch (error: any) {
    console.error('Intent POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}

// 查询票数 + 当前访客是否已投
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const visitorId = searchParams.get('visitorId');
    const type = searchParams.get('type') === 'preorder' ? 'preorder' as const
      : searchParams.get('type') === 'vote' ? 'vote' as const
      : undefined;

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    const product = await db.products.getById(productId);
    const hasVoted = visitorId
      ? await db.intents.hasVoted(productId, visitorId, type)
      : false;

    return NextResponse.json({
      votes: product?.votesCount ?? 0,
      hasVoted,
    });
  } catch (error) {
    console.error('Intent GET error:', error);
    return NextResponse.json({ votes: 0, hasVoted: false });
  }
}
