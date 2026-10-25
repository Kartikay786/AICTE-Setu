import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const _jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })
const _plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'AICTE Nexus — Approval Workflow & Document Validation',
  description:
    'Frontend prototype for AICTE approval workflow automation with demo document validation, EVC scheduling and audit history.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
