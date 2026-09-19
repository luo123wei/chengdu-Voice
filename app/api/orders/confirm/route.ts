import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, orderNumber, items, total, shippingMethod, paid } = await request.json();

    if (!email || !customerName || !orderNumber || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await sendOrderConfirmationEmail(email, customerName, orderNumber, items, total, shippingMethod, Boolean(paid));

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent',
    });
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}