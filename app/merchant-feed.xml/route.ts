import { NextResponse } from 'next/server';

// 308 redirect /merchant-feed.xml → /api/feed/merchant
// 让 Google Merchant Center 用干净 URL: https://www.voiceculture.world/merchant-feed.xml
// 注意：不能用 req.nextUrl.origin（Render 反代后会变成 localhost:10000），
// 必须用环境变量里的正式域名。
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world';

export function GET() {
  return NextResponse.redirect(`${SITE_URL}/api/feed/merchant`, 308);
}
