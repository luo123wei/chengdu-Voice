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

const allowedTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
};

const maxSizes = {
  image: 10 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  video: 200 * 1024 * 1024,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有选择文件' },
        { status: 400 }
      );
    }

    const fileType = file.type.split('/')[0];
    const typeConfig = allowedTypes[fileType as keyof typeof allowedTypes];
    const maxSize = maxSizes[fileType as keyof typeof maxSizes];

    if (!typeConfig || !typeConfig.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      const sizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `文件大小超过限制（最大 ${sizeMB}MB）` },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    const filePath = `${fileType}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabase.storage.from('uploads').upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('上传失败:', error);
      return NextResponse.json(
        { error: `上传失败: ${error.message || '未知错误'}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    
    if (!publicUrlData?.publicUrl) {
      console.error('获取公网链接失败');
      return NextResponse.json(
        { error: '上传成功但无法获取链接' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}
