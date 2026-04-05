import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'GoMiGo — India\'s Local Travel Super-App', template: '%s | GoMiGo' },
  description: 'Book verified local cabs, hotels, and tour guides in hill stations across India. Aadhaar verified drivers. Instant WhatsApp confirmation.',
  keywords: ['ooty cab booking', 'nilgiris tour guide', 'coonoor hotel', 'hill station travel india', 'local cab driver ooty'],
  authors: [{ name: 'GoMiGo' }],
  creator: 'GoMiGo',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gomigo.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gomigo.in',
    siteName: 'GoMiGo',
    title: 'GoMiGo — India\'s Local Travel Super-App',
    description: 'Book verified local cabs, hotels, and tour guides in hill stations. Aadhaar verified, WhatsApp confirmed.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'GoMiGo — Book Local Travel in India' }],
  },
  twitter: { card: 'summary_large_image', title: 'GoMiGo', description: 'Book verified local travel in India\'s hill stations.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: '/icons/favicon-16x16.png', sizes: '16x16' }, { url: '/icons/favicon-32x32.png', sizes: '32x32' }],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GoMiGo' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        {children}
      </body>
    </html>
  )
}
