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
    default: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture - Authentic Chengdu Culture & Products',
    template: '%s | Voice Culture',
  },
  description: 'Voice Culture — Chengdu cultural gifts & souvenirs. You vote on what we make next, pre-order new pieces, shop small-batch crafts worldwide. Designed in Chengdu, shipped globally.',
  keywords: [
    'Chengdu', '成都', 'cultural gifts', 'souvenirs', 'Voice Culture',
    'panda design', '熊猫周边', '文创设计工作室', 'design studio',
    'Chinese design', '中国设计', 'handmade craft', '手作',
    'stationery', 'home decor', 'designer toys', 'Chengdu design',
    'free Chengdu sounds', '成都声音', '白噪音'
  ],
  authors: [{ name: 'Voice Culture', url: siteUrl }],
  creator: 'Voice Culture',
  publisher: 'Voice Culture',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Voice Culture',
    title: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture — Designed in Chengdu, shipped globally',
    description: 'Chengdu cultural gifts & souvenirs. Vote on what we make next, pre-order new pieces, shop small-batch crafts worldwide.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture — Designed in Chengdu, shipped globally',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chengdu Cultural Gifts & Souvenirs | Voice Culture',
    description: 'Vote on what we make next. Small-batch crafts designed in Chengdu, shipped worldwide.',
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
    'msvalidate.01': '817C21E6CCB0018DC7884C88EBCAC36C',
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
