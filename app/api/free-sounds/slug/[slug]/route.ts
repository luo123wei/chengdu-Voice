import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { data, error } = await supabase
      .from('free_sounds')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    // 未到发布时间 → 404
    if (data.scheduled_at && new Date(data.scheduled_at) > new Date()) {
      return NextResponse.json({ error: 'Not published yet' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      titleEn: data.title_en,
      slug: data.slug,
      description: data.description || '',
      culturalStory: data.cultural_story || '',
      duration: data.duration,
      audio: data.audio,
      isPremium: data.is_premium || false,
      scheduledAt: data.scheduled_at,
      createdAt: data.created_at,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
