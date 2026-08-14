import type { Metadata } from 'next'
import { Inter, Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ 
  weight: ['400', '500', '600', '700'], 
  subsets: ['latin'] 
})

const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.voiceculture.world'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Chengdu Voice | 成都之音 - Authentic Chengdu Culture & Products',
    template: '%s | Chengdu Voice',
  },
  description: 'Experience authentic Chengdu through sound, taste, and stories. Premium Sichuan pepper, tea, and cultural products delivered worldwide.',
  keywords: [
    'Chengdu', '成都', 'Sichuan pepper', '四川花椒', 'tea', '茶叶',
    'Chengdu culture', '成都文化', 'cross-border e-commerce', '跨境电商',
    'Chinese culture', '中国文化', 'sound map', '声音地图',
    'Hanyuan pepper', '汉源花椒', 'Mongding tea', '蒙顶茶',
    'authentic Chinese products', '正宗中国产品', 'traditional Sichuan', '传统四川'
  ],
  authors: [{ name: 'Chengdu Voice', url: siteUrl }],
  creator: 'Chengdu Voice',
  publisher: 'Chengdu Voice',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Chengdu Voice | 成都之音',
    title: 'Chengdu Voice | Authentic Chengdu Culture & Products',
    description: 'Experience authentic Chengdu through sound, taste, and stories. Premium Sichuan pepper, tea, and cultural products delivered worldwide.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chengdu Voice - Authentic Chengdu Culture & Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chengdu Voice | Authentic Chengdu Culture & Products',
    description: 'Experience authentic Chengdu through sound, taste, and stories.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googlef4d70c08c36bec06',
  },
  other: {
    'charset': 'UTF-8',
    'baidu-site-verification': 'your-baidu-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={notoSansSC.className}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xxjee056b4");`,
          }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
