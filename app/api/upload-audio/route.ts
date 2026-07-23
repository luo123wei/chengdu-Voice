import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'audio');

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: '未选择文件' }, { status: 400 });
    }

    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ success: false, message: '不支持的文件格式，仅支持 MP3、WAV、OGG、FLAC、M4A' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: '文件大小超过限制（最大50MB）' }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/audio/${fileName}`;

    return NextResponse.json({
      success: true,
      message: '上传成功',
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ success: false, message: '上传失败' }, { status: 500 });
  }
}
