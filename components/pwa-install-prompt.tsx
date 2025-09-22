'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installStatus, setInstallStatus] = useState<string>('')
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInstallable = isStandalone || isInWebAppiOS
    
    if (isInstallable) {
      setIsInstalled(true)
      setInstallStatus('Already installed')
      return
    }

    // Check if previously dismissed (but allow retry after 24 hours)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    if (dismissed && dismissedTime) {
      const dismissTime = parseInt(dismissedTime)
      if (now - dismissTime < oneDay) {
        setInstallStatus('Recently dismissed')
        return
      } else {
        // Clear old dismissal
        localStorage.removeItem('pwa-install-dismissed')
        localStorage.removeItem('pwa-install-dismissed-time')
      }
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setInstallStatus('Install prompt available')
      // Show the prompt after a delay to not be intrusive
      setTimeout(() => setIsVisible(true), 3000)
    }

    const handleAppInstalled = () => {
      console.log('PWA: appinstalled event fired')
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
      setInstallStatus('Successfully installed')
      // Clear any dismissal flags
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-dismissed-time')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setInstallStatus('No install prompt available')
      return
    }

    try {
      setInstallStatus('Showing install prompt...')
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('PWA: User choice outcome:', outcome)
      
      if (outcome === 'accepted') {
        setInstallStatus('Installation accepted')
        // Don't hide immediately, wait for appinstalled event
      } else {
        setInstallStatus('Installation dismissed by user')
        localStorage.setItem('pwa-install-dismissed', 'true')
        localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
        setTimeout(() => setIsVisible(false), 2000)
      }
    } catch (error) {
      console.error('PWA: Installation error:', error)
      setInstallStatus('Installation failed')
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
    setInstallStatus('Dismissed by user')
  }

  const handleForceShow = () => {
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-dismissed-time')
    setIsVisible(true)
    setInstallStatus('Force showing prompt')
  }

  // Debug mode toggle (double-click on logo area)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1' && e.shiftKey) {
        setDebugMode(!debugMode)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [debugMode])

  // Don't show if already installed or no prompt available (unless debug mode)
  if (!debugMode && (isInstalled || (!isVisible && !deferredPrompt))) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Download className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Install App</h3>
            {debugMode && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                DEBUG
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Install Voltflo for quick access and offline features
          </p>
          
          {debugMode && (
            <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
              <p><strong>Status:</strong> {installStatus}</p>
              <p><strong>Installed:</strong> {isInstalled ? 'Yes' : 'No'}</p>
              <p><strong>Prompt Available:</strong> {deferredPrompt ? 'Yes' : 'No'}</p>
              <p><strong>Standalone:</strong> {window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt && !debugMode}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {installStatus.includes('Showing') ? 'Installing...' : 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-md transition-colors"
            >
              Maybe Later
            </button>
            {debugMode && (
              <button
                onClick={handleForceShow}
                className="bg-green-100 hover:bg-green-200 text-green-700 text-xs px-2 py-2 rounded-md transition-colors"
              >
                Force Show
              </button>
            )}
          </div>
          
          {installStatus && (
            <p className="text-xs text-gray-500 mt-2">{installStatus}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {debugMode && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          <p>Press Shift+F1 to toggle debug mode</p>
          <p>Clear dismissal and force show prompt for testing</p>
        </div>
      )}
    </div>
  )
}
