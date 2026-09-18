import { NextRequest, NextResponse } from 'next/server';

// 308 redirect /merchant-feed.xml → /api/feed/merchant
// 让 Google Merchant Center 用干净 URL: https://www.voiceculture.world/merchant-feed.xml
export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  return NextResponse.redirect(`${origin}/api/feed/merchant`, 308);
}
