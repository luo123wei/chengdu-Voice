import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  
  if (!sessionId) {
    return NextResponse.json({ items: [], id: 'empty' });
  }

  const cart = await db.cart.get(sessionId);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();
    
    if (!productId || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const products = await db.products.getAll();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    let sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const cart = await db.cart.get(sessionId);
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        quantity,
        image: product.images[0],
        type: product.type,
      });
    }

    await db.cart.save(sessionId, cart);

    const response = NextResponse.json({ success: true, cart });
    response.cookies.set('sessionId', sessionId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'No session' }, { status: 400 });
    }

    const { productId, quantity } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const cart = await db.cart.get(sessionId);
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const products = await db.products.getAll();
      const product = products.find(p => p.id === productId);
      if (product && product.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await db.cart.save(sessionId, cart);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'No session' }, { status: 400 });
    }

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const cart = await db.cart.get(sessionId);
    
    if (productId === 'all') {
      cart.items = [];
    } else {
      cart.items = cart.items.filter(item => item.productId !== productId);
    }
    
    await db.cart.save(sessionId, cart);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}