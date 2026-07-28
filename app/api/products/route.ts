import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = await db.products.getAll();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await db.products.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    console.log('PUT /api/products - body id:', body.id);
    const product = await db.products.update(body.id, body);
    if (!product) {
      return NextResponse.json({ error: `Product not found with id: ${body.id}` }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('PUT /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    const success = await db.products.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}