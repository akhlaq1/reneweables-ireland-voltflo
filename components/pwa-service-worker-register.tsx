'use client'

import { useEffect } from 'react'

export default function PWAServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: Service worker registration skipped in development')
      return
    }

    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Check if already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration()
          
          if (existingRegistration) {
            console.log('PWA: Service worker already registered:', existingRegistration)
            
            // Check for updates
            try {
              await existingRegistration.update()
              console.log('PWA: Service worker update check completed')
            } catch (updateError) {
              console.warn('PWA: Service worker update failed:', updateError)
            }
            return
          }

          // Register the service worker
          console.log('PWA: Registering service worker...')
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })

          console.log('PWA: Service worker registered successfully:', registration)

          // Handle updates
          registration.addEventListener('updatefound', () => {
            console.log('PWA: Service worker update found')
            const newWorker = registration.installing
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: New service worker installed, page refresh recommended')
                  // Optionally notify user about update
                }
              })
            }
          })

          // Handle service worker errors
          registration.addEventListener('error', (event) => {
            console.error('PWA: Service worker error:', event)
          })

        } catch (error) {
          console.error('PWA: Service worker registration failed:', error)
          
          // If registration fails, try to clean up and retry once
          if (error instanceof Error && error.message.includes('bad-precaching-response')) {
            console.log('PWA: Attempting to clear cache and retry...')
            try {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map(name => caches.delete(name)))
              console.log('PWA: Cache cleared, please refresh the page')
            } catch (cacheError) {
              console.error('PWA: Cache cleanup failed:', cacheError)
            }
          }
        }
      }

      // Register when page loads
      registerSW()

      // Also handle page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          registerSW()
        }
      })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('PWA: Message from service worker:', event.data)
      })

    } else {
      console.warn('PWA: Service workers not supported in this browser')
    }
  }, [])

  return null // This component doesn't render anything
}
