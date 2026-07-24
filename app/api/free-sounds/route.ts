import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
}

const defaultSounds: FreeSound[] = [];

export async function GET() {
  try {
    const { data, error } = await supabase.from('free_sounds').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to get free sounds:', error);
      return NextResponse.json({ success: true, data: defaultSounds });
    }
    const sounds = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      titleEn: row.title_en,
      description: row.description,
      duration: row.duration,
      audio: row.audio,
    }));
    return NextResponse.json({ success: true, data: sounds.length > 0 ? sounds : defaultSounds });
  } catch (error) {
    console.error('Get free sounds error:', error);
    return NextResponse.json({ success: true, data: defaultSounds });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, titleEn, description, duration, audio } = body;

    if (!title || !titleEn || !description || !duration || !audio) {
      return NextResponse.json({ success: false, message: '缺少必填字段' }, { status: 400 });
    }

    const newSound: FreeSound = {
      id: `sound-${Date.now()}`,
      title,
      titleEn,
      description,
      duration,
      audio,
    };

    const { data, error } = await supabase.from('free_sounds').insert({
      id: newSound.id,
      title: newSound.title,
      title_en: newSound.titleEn,
      description: newSound.description,
      duration: newSound.duration,
      audio: newSound.audio,
      created_at: new Date().toISOString(),
    }).select('*').single();

    if (error) {
      console.error('Failed to create free sound:', error);
      return NextResponse.json({ success: false, message: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newSound }, { status: 201 });
  } catch (error) {
    console.error('Create free sound error:', error);
    return NextResponse.json({ success: false, message: '创建失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, titleEn, description, duration, audio } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: '缺少ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (titleEn) updateData.title_en = titleEn;
    if (description) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (audio) updateData.audio = audio;

    const { data, error } = await supabase.from('free_sounds').update(updateData).eq('id', id).select('*').single();

    if (error || !data) {
      console.error('Failed to update free sound:', error);
      return NextResponse.json({ success: false, message: '声音不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {
      id: data.id,
      title: data.title,
      titleEn: data.title_en,
      description: data.description,
      duration: data.duration,
      audio: data.audio,
    } });
  } catch (error) {
    console.error('Update free sound error:', error);
    return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: '缺少ID' }, { status: 400 });
    }

    const { error } = await supabase.from('free_sounds').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete free sound:', error);
      return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Delete free sound error:', error);
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
