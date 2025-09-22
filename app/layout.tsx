import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/lib/posthog'
import { Suspense } from 'react'
import { getBranding } from '@/lib/branding'

const branding = getBranding()

export const metadata: Metadata = {
  title: branding.name,
  description: `Created by Akhlaq Ahmed`,
  generator: "Voltflo",

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
      </head>
      <body className='mx-3 md:mx-auto md:w-[90vw]'>
        <Suspense fallback={<div>Loading...</div>}>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
