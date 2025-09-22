import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/lib/posthog'
import { Suspense } from 'react'
import { getBranding } from '@/lib/branding'
import PWAInstallPrompt from '@/components/pwa-install-prompt'
import PWADebugInfo from '@/components/pwa-debug-info'
import PWAServiceWorkerRegister from '@/components/pwa-service-worker-register'

const branding = getBranding()

export const metadata: Metadata = {
  title: branding.name,
  description: `Created by Akhlaq Ahmed`,
  generator: "Voltflo",
  // manifest: '/manifest.json',
  // keywords: ['solar', 'energy', 'ireland', 'seai', 'renewable', 'solar panels', 'voltflo'],
  // authors: [{ name: 'Akhlaq Ahmed' }],
  // creator: 'Akhlaq Ahmed',
  // publisher: branding.name,
  // formatDetection: {
  //   email: false,
  //   address: false,
  //   telephone: false,
  // },
  // metadataBase: new URL(branding.website),
  // alternates: {
  //   canonical: '/',
  // },
  // openGraph: {
  //   type: 'website',
  //   locale: 'en_IE',
  //   url: branding.website,
  //   title: branding.name,
  //   description: branding.description || `Created by Akhlaq Ahmed`,
  //   siteName: branding.name,
  //   images: [
  //     {
  //       url: '/logo.png',
  //       width: 512,
  //       height: 512,
  //       alt: `${branding.name} Logo`,
  //     },
  //   ],
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: branding.name,
  //   description: branding.description || `Created by Akhlaq Ahmed`,
  //   images: ['/logo.png'],
  // },
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     'max-video-preview': -1,
  //     'max-image-preview': 'large',
  //     'max-snippet': -1,
  //   },
  // },
  // verification: {
  //   google: 'google-site-verification-id', // Add your Google verification ID
  // },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={branding.logo} type="image/png" />
        {/* <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={branding.name} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1d4ed8" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#1d4ed8" /> */}
      </head>
      <body className='mx-3 md:mx-auto md:w-[90vw]'>
        <Suspense fallback={<div>Loading...</div>}>
          <PostHogProvider>
            {children}
            {/* <PWAInstallPrompt />
            <PWAServiceWorkerRegister /> */}
            {/* Remove this PWADebugInfo component after debugging */}
            {/* <PWADebugInfo /> */}
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
