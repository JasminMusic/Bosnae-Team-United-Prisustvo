import type { Metadata, Viewport } from 'next'
import { SwRegister } from '@/components/SwRegister'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Bosnae Teamu United BJJ', template: '%s · BTU BJJ' },
  description: 'Attendance, belts and student tracking for Bosnae Teamu United Brazilian Jiu-Jitsu',
  applicationName: 'BTU BJJ',
  appleWebApp: { capable: true, title: 'BTU BJJ', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f4f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  )
}
