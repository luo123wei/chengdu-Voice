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

export const metadata: Metadata = {
  title: 'Chengdu Voice - Cross-border E-commerce',
  description: 'Experience the authentic voice of Chengdu - Traditional Chinese culture meets Western aesthetics',
  other: {
    'charset': 'UTF-8',
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
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xxxxx");`,
          }}
        />
      </body>
    </html>
  )
}
