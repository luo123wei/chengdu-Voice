import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'free_sounds.json');

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
}

const readData = (): FreeSound[] => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeData = (data: FreeSound[]): void => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

export async function GET() {
  const sounds = readData();
  return NextResponse.json({ success: true, data: sounds });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, titleEn, description, duration, audio } = body;

    if (!title || !titleEn || !description || !duration || !audio) {
      return NextResponse.json({ success: false, message: '缺少必填字段' }, { status: 400 });
    }

    const sounds = readData();
    const newSound: FreeSound = {
      id: `sound-${Date.now()}`,
      title,
      titleEn,
      description,
      duration,
      audio,
    };

    sounds.unshift(newSound);
    writeData(sounds);

    return NextResponse.json({ success: true, data: newSound }, { status: 201 });
  } catch (error) {
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

    const sounds = readData();
    const index = sounds.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, message: '声音不存在' }, { status: 404 });
    }

    sounds[index] = {
      ...sounds[index],
      title: title || sounds[index].title,
      titleEn: titleEn || sounds[index].titleEn,
      description: description || sounds[index].description,
      duration: duration || sounds[index].duration,
      audio: audio || sounds[index].audio,
    };

    writeData(sounds);

    return NextResponse.json({ success: true, data: sounds[index] });
  } catch (error) {
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

    const sounds = readData();
    const filtered = sounds.filter((s) => s.id !== id);

    if (filtered.length === sounds.length) {
      return NextResponse.json({ success: false, message: '声音不存在' }, { status: 404 });
    }

    writeData(filtered);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
