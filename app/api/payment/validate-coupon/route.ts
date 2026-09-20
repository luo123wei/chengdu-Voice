import { NextRequest, NextResponse } from 'next/server';
import { checkCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { code, email, subtotal } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { valid: false, message: 'Enter your email above, then the code.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const result = await checkCoupon(code, email, Number(subtotal) || 0);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { valid: false, message: 'Could not verify the code. Please try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
