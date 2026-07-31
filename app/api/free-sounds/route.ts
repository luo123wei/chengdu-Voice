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
  location?: string;
  culturalStory?: string;
  created_at?: string;
}

const defaultSounds: FreeSound[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    const countResult = await supabase.from('free_sounds').select('id', { count: 'exact' });
    const total = countResult.count || 0;

    const { data, error } = await supabase.from('free_sounds')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to get free sounds:', error);
      return NextResponse.json({ success: true, data: defaultSounds, total: 0, page: 1, limit: 6 });
    }
    const sounds = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      titleEn: row.title_en,
      description: row.description || '',
      duration: row.duration,
      audio: row.audio,
      culturalStory: row.cultural_story || '',
      created_at: row.created_at,
    }));
    return NextResponse.json({
      success: true,
      data: sounds.length > 0 ? sounds : defaultSounds,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Get free sounds error:', error);
    return NextResponse.json({ success: true, data: defaultSounds, total: 0, page: 1, limit: 6 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, titleEn, description, duration, audio, culturalStory } = body;

    if (!title || !titleEn || !description || !duration || !audio) {
      return NextResponse.json({ success: false, message: '缺少必填字段' }, { status: 400 });
    }

    const newId = `sound-${Date.now()}`;

    // 先尝试包含 cultural_story 的插入
    let insertData: any = {
      id: newId,
      title,
      title_en: titleEn,
      description,
      duration,
      audio,
      cultural_story: culturalStory || '',
      created_at: new Date().toISOString(),
    };

    let { data, error } = await supabase.from('free_sounds').insert(insertData).select('*').single();

    // 如果失败（可能 cultural_story 列不存在），重试不含该字段
    if (error) {
      console.error('Insert with cultural_story failed, retrying without:', error);
      const fallbackData: any = {
        id: newId,
        title,
        title_en: titleEn,
        description,
        duration,
        audio,
        created_at: new Date().toISOString(),
      };
      const retry = await supabase.from('free_sounds').insert(fallbackData).select('*').single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Failed to create free sound:', error);
      return NextResponse.json({ success: false, message: '创建失败: ' + (error?.message || '未知错误') }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch (error) {
    console.error('Create free sound error:', error);
    return NextResponse.json({ success: false, message: '创建失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, titleEn, description, duration, audio, culturalStory } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: '缺少ID' }, { status: 400 });
    }

    // 基础更新数据（不含 cultural_story）
    const baseUpdate: any = {};
    if (title !== undefined) baseUpdate.title = title;
    if (titleEn !== undefined) baseUpdate.title_en = titleEn;
    if (description !== undefined) baseUpdate.description = description;
    if (duration !== undefined) baseUpdate.duration = duration;
    if (audio !== undefined) baseUpdate.audio = audio;

    // 先尝试包含 cultural_story 的更新
    const fullUpdate = { ...baseUpdate };
    if (culturalStory !== undefined) fullUpdate.cultural_story = culturalStory;

    let { data, error } = await supabase.from('free_sounds').update(fullUpdate).eq('id', id).select('*').single();

    // 如果失败（可能 cultural_story 列不存在），用基础数据重试
    if (error && culturalStory !== undefined && Object.keys(baseUpdate).length > 0) {
      console.error('Update with cultural_story failed, retrying with base only:', error);
      const retry = await supabase.from('free_sounds').update(baseUpdate).eq('id', id).select('*').single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Failed to update free sound:', error);
      return NextResponse.json({ success: false, message: '更新失败: ' + (error?.message || '声音不存在') }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {
      id: data.id,
      title: data.title,
      titleEn: data.title_en,
      description: data.description,
      duration: data.duration,
      audio: data.audio,
      culturalStory: data.cultural_story || '',
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