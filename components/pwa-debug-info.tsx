'use client'

import { useState, useEffect } from 'react'

export default function PWADebugInfo() {
  const [pwaInfo, setPwaInfo] = useState<any>({})

  useEffect(() => {
    const checkPWAStatus = () => {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const info = {
        environment: process.env.NODE_ENV || 'unknown',
        isDevelopment,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isIOSWebApp: (window.navigator as any).standalone === true,
        hasServiceWorker: 'serviceWorker' in navigator,
        isSecureContext: window.isSecureContext,
        userAgent: navigator.userAgent,
        hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window,
        manifestPresent: document.querySelector('link[rel="manifest"]') !== null,
        currentUrl: window.location.href,
        dismissedBefore: localStorage.getItem('pwa-install-dismissed'),
        dismissedTime: localStorage.getItem('pwa-install-dismissed-time'),
        serviceWorkerActive: null as string | null,
        serviceWorkerRegistered: false,
      }
      
      // Check service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          info.serviceWorkerRegistered = !!registration
          info.serviceWorkerActive = registration?.active?.state || null
          setPwaInfo({...info})
        }).catch(() => {
          info.serviceWorkerRegistered = false
          setPwaInfo({...info})
        })
      }
      
      setPwaInfo(info)
    }

    checkPWAStatus()
  }, [])

  const clearDismissal = () => {
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-dismissed-time')
    window.location.reload()
  }

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        console.log('Service Worker Registration:', registration)
        alert(registration ? 'Service Worker is registered' : 'No Service Worker found')
      } catch (error) {
        console.error('Service Worker check failed:', error)
        alert('Service Worker check failed: ' + error)
      }
    }
  }

  const clearAllCaches = async () => {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      
      // Also unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(registration => registration.unregister()))
      }
      
      alert('All caches and service workers cleared! Please refresh the page.')
    } catch (error) {
      console.error('Cache clearing failed:', error)
      alert('Cache clearing failed: ' + error)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md text-xs z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2 text-yellow-400">PWA Debug Info</h3>
      
      {pwaInfo.isDevelopment && (
        <div className="mb-3 p-2 bg-yellow-900 border border-yellow-600 rounded text-yellow-200">
          <strong>⚠️ DEVELOPMENT MODE</strong><br/>
          PWA features are disabled in development.<br/>
          Build and deploy to test PWA functionality.
        </div>
      )}
      
      <div className="space-y-1">
        <div>Environment: <span className="text-cyan-300">{pwaInfo.environment}</span></div>
        <div>Standalone: {pwaInfo.isStandalone ? '✅' : '❌'}</div>
        <div>iOS WebApp: {pwaInfo.isIOSWebApp ? '✅' : '❌'}</div>
        <div>SW Support: {pwaInfo.hasServiceWorker ? '✅' : '❌'}</div>
        <div>SW Registered: {pwaInfo.serviceWorkerRegistered ? '✅' : '❌'}</div>
        {pwaInfo.serviceWorkerActive && (
          <div>SW State: <span className="text-green-300">{pwaInfo.serviceWorkerActive}</span></div>
        )}
        <div>Secure Context: {pwaInfo.isSecureContext ? '✅' : '❌'}</div>
        <div>Install Prompt: {pwaInfo.hasBeforeInstallPrompt ? '✅' : '❌'}</div>
        <div>Manifest: {pwaInfo.manifestPresent ? '✅' : '❌'}</div>
        <div>Dismissed: {pwaInfo.dismissedBefore ? '✅' : '❌'}</div>
        {pwaInfo.dismissedTime && (
          <div>Dismissed at: {new Date(parseInt(pwaInfo.dismissedTime)).toLocaleString()}</div>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        <button 
          onClick={clearDismissal}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white w-full text-xs"
        >
          Clear Dismissal
        </button>
        <button 
          onClick={checkServiceWorker}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white w-full text-xs"
        >
          Check SW
        </button>
        <button 
          onClick={clearAllCaches}
          className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-white w-full text-xs"
        >
          Clear All Caches
        </button>
      </div>
      
      {!pwaInfo.isDevelopment && !pwaInfo.serviceWorkerRegistered && (
        <div className="mt-3 p-2 bg-red-900 border border-red-600 rounded text-red-200 text-xs">
          <strong>Service Worker Issue:</strong><br/>
          SW not registered. Check console for errors.
        </div>
      )}
    </div>
  )
}
