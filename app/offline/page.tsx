'use client'

import { getBranding } from '@/lib/branding'

export default function OfflinePage() {
  const branding = getBranding()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img 
          src={branding.logo} 
          alt={`${branding.name} Logo`} 
          className="mx-auto h-16 w-auto mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          It looks like you've lost your internet connection. Don't worry, you can still browse some of our content that's been saved on your device.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-500">
            Check your internet connection and try again
          </p>
        </div>
      </div>
    </div>
  )
}
