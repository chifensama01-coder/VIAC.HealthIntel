import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://healthintel.visioninaction.cm'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HealthIntel — Public Health Intelligence Platform',
    template: '%s | HealthIntel',
  },
  description:
    'HealthIntel by Vision in Action Cameroon — a public health intelligence platform turning post-abortion care surveillance into decision-ready insights, forecasting, and action planning for the Southwest Region.',
  applicationName: 'HealthIntel',
  authors: [{ name: 'Vision in Action Cameroon' }],
  keywords: [
    'public health intelligence', 'PAC surveillance', 'health analytics', 'Cameroon',
    'decision support', 'forecasting', 'disease surveillance', 'reproductive health',
  ],
  openGraph: {
    type: 'website',
    siteName: 'HealthIntel',
    title: 'HealthIntel — Public Health Intelligence Platform',
    description:
      'Decision-ready public health intelligence: surveillance, forecasting, accountability and action planning for the Southwest Region of Cameroon.',
    url: siteUrl,
    images: [{ url: '/logo-full.svg', width: 340, height: 92, alt: 'Vision in Action Cameroon — HealthIntel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HealthIntel — Public Health Intelligence Platform',
    description: 'Decision-ready public health intelligence by Vision in Action Cameroon.',
    images: ['/logo-full.svg'],
  },
  icons: { icon: '/logo-mark.svg' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
