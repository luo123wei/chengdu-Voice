import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chengdu-voice-secret-key';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// 后台读取需要 service role key 绕过 RLS（waitlist 表不允许公开读取）
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 校验管理员 JWT
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    return payload?.role === 'admin' || payload?.username !== undefined;
  } catch {
    return false;
  }
}

// 获取候补名单（仅管理员）
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('sound_waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get waitlist:', error);
      return NextResponse.json({ success: false, message: error.message, data: [], total: 0 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        source: row.source,
        createdAt: row.created_at,
      })),
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Get waitlist error:', error);
    return NextResponse.json({ success: false, message: '查询失败', data: [], total: 0 });
  }
}

// 删除登记（仅管理员）
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: '缺少ID' }, { status: 400 });
    }

    const { error } = await supabase.from('sound_waitlist').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete waitlist entry:', error);
      return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Delete waitlist error:', error);
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
