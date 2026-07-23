import { NextResponse, type NextRequest } from 'next/server';
import { blogPosts } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const id = request.url.split('/').pop();
  const post = blogPosts.find((p) => p.id === id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest) {
  const id = request.url.split('/').pop();
  const body = await request.json();
  const index = blogPosts.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const updatedPost = { ...blogPosts[index], ...body };
  return NextResponse.json(updatedPost);
}

export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();
  const index = blogPosts.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
