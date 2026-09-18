import { NextResponse } from 'next/server';

// 308 redirect /merchant-feed.xml → /api/feed/merchant
// 让 Google Merchant Center 用干净 URL: https://www.voiceculture.world/merchant-feed.xml
export function GET() {
  return NextResponse.redirect('/api/feed/merchant', 308);
}
