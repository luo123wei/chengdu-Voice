import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

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

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
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