import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: '未选择文件' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
      return NextResponse.json({ success: false, message: '不支持的文件格式，仅支持 MP3、WAV、OGG、FLAC、M4A' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: '文件大小超过限制（最大50MB）' }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExtension}`;
    const filePath = `audio/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabase.storage.from('audio').upload(filePath, buffer, {
      contentType: file.type || 'audio/mpeg',
      upsert: false,
    });

    if (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ success: false, message: `上传失败: ${error.message || '未知错误'}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filePath);
    
    if (!publicUrlData?.publicUrl) {
      console.error('获取公网链接失败');
      return NextResponse.json({ success: false, message: '上传成功但无法获取链接' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '上传成功',
      data: {
        url: publicUrlData.publicUrl,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ success: false, message: '上传失败' }, { status: 500 });
  }
}
