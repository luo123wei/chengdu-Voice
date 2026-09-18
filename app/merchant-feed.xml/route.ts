// Redirect /merchant-feed.xml → /api/feed/merchant
// 这样 Merchant Center 可以用干净的 URL
export function GET() {
  return new Response(null, {
    status: 308,
    headers: {
      Location: '/api/feed/merchant',
    },
  });
}
