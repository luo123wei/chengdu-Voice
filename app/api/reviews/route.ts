import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendReviewVerificationEmail } from '@/lib/email';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const email = searchParams.get('email');
  const checkPurchase = searchParams.get('checkPurchase');

  if (checkPurchase && email && productId) {
    const orders = await db.orders.getAll();
    const hasPurchase = orders.some(
      (order) => order.email === email && order.items.some((item) => item.productId === productId)
    );
    return NextResponse.json({ hasPurchase });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const { data, error } = await db.supabase.from('reviews').select('*').eq('product_id', productId).order('date', { ascending: false });
  if (error) {
    return NextResponse.json({ reviews: [] });
  }

  const reviews = data.map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    nickname: row.nickname,
    email: row.email,
    rating: parseFloat(row.rating),
    content: row.content,
    date: row.date,
    verified: row.verified,
    verifiedEmail: row.verified_email,
  }));

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nickname || !body.email || !body.rating || !body.content || !body.productId) {
      return NextResponse.json(
        { error: 'nickname, email, rating, content, and productId are required' },
        { status: 400 }
      );
    }

    if (body.content.length > 300) {
      return NextResponse.json(
        { error: 'content must be less than 300 characters' },
        { status: 400 }
      );
    }

    if (body.rating < 0.5 || body.rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 0.5 and 5' },
        { status: 400 }
      );
    }

    const orders = await db.orders.getAll();
    const hasPurchase = orders.some(
      (order) => order.email === body.email && order.items.some((item) => item.productId === body.productId)
    );

    if (!hasPurchase) {
      return NextResponse.json(
        { error: 'You must purchase this product before leaving a review.' },
        { status: 403 }
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
      verified_email: false,
    };

    const { error } = await db.supabase.from('reviews').insert(newReview);
    if (error) {
      console.error('Failed to create review:', error);
      throw error;
    }

    try {
      await sendReviewVerificationEmail(
        body.email,
        body.nickname,
        newReview.id,
        body.productId
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      review: { ...newReview, productId: newReview.product_id, verifiedEmail: newReview.verified_email },
      message: 'Review submitted. A verification email has been sent.'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}