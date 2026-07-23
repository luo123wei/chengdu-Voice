import { NextResponse } from 'next/server';
import { reviews as initialReviews } from '@/data/mockData';

let reviews = [...initialReviews];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    reviews[reviewIndex].verifiedEmail = true;

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. Your review is now published.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
