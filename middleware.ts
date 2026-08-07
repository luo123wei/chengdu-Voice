import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  if (hostname === 'voiceculture.world') {
    const url = request.nextUrl;
    return NextResponse.redirect(
      `https://www.voiceculture.world${url.pathname}${url.search}`,
      301
    );
  }

  const blogIdPattern = /^\/blog\/blog-\d+$/;
  if (blogIdPattern.test(pathname)) {
    const id = pathname.replace('/blog/', '');
    try {
      const res = await fetch(`${request.nextUrl.origin}/api/blogs/${id}`);
      if (res.ok) {
        const post = await res.json();
        if (post?.slug) {
          return NextResponse.redirect(`${request.nextUrl.origin}/blog/${post.slug}`, 301);
        }
      }
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/blog/:path*',
    '/shop/:path*',
    '/about/:path*',
    '/free-sounds/:path*',
    '/checkout/:path*',
    '/account/:path*',
    '/verify-review/:path*',
    '/reviews-sketch/:path*',
    '/sitemap.xml',
    '/robots.txt',
  ],
};
