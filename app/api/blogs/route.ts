import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const blogs = await db.blogs.getAll();
  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const blog = await db.blogs.create(body);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    const blog = await db.blogs.update(body.id, body);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    const success = await db.blogs.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}