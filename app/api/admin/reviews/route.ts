import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.productId || !body.nickname || !body.email || !body.rating || !body.content) {
      return NextResponse.json(
        { error: 'productId, nickname, email, rating, content are required' },
        { status: 400 }
      );
    }

    if (body.rating < 0.5 || body.rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 0.5 and 5' },
        { status: 400 }
      );
    }

    if (body.content.length > 300) {
      return NextResponse.json(
        { error: 'content must be ≤ 300 characters' },
        { status: 400 }
      );
    }

    const newReview = {
      id: Date.now().toString(),
      product_id: body.productId,
      nickname: body.nickname,
      email: body.email,
      rating: body.rating,
      content: body.content,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      verified_email: true,
    };

    const { error } = await db.supabase.from('reviews').insert(newReview);
    if (error) {
      console.error('Failed to create admin review:', error);
      throw error;
    }

    // Recalculate product rating and reviews count
    try {
      const { data: reviewRows, error: reviewErr } = await db.supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', body.productId);
      if (!reviewErr && reviewRows && reviewRows.length > 0) {
        const total = reviewRows.length;
        const sum = reviewRows.reduce((acc: number, r: any) => acc + parseFloat(r.rating), 0);
        const avgRating = parseFloat((sum / total).toFixed(1));
        await db.supabase
          .from('products')
          .update({ rating: avgRating, reviews: total })
          .eq('id', body.productId);
      }
    } catch (ratingErr) {
      console.error('Failed to update product rating:', ratingErr);
    }

    return NextResponse.json({
      success: true,
      review: { ...newReview, productId: newReview.product_id, verifiedEmail: newReview.verified_email },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
