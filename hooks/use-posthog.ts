import { useEffect } from 'react'
import posthog from 'posthog-js'

export function usePostHog() {
  useEffect(() => {
    // Initialize PostHog if it hasn't been initialized yet
    if (typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
      })
    }
  }, [])

  return {
    // Track custom events
    track: (event: string, properties?: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        posthog.capture(event, properties)
      }
    },
    
    // Identify users
    identify: (userId: string, properties?: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        posthog.identify(userId, properties)
      }
    },
    
    // Reset user (for logout)
    reset: () => {
      if (typeof window !== 'undefined') {
        posthog.reset()
      }
    },
    
    // Feature flags
    isFeatureEnabled: (flagKey: string) => {
      if (typeof window !== 'undefined') {
        return posthog.isFeatureEnabled(flagKey)
      }
      return false
    },
    
    // Get feature flag value
    getFeatureFlag: (flagKey: string) => {
      if (typeof window !== 'undefined') {
        return posthog.getFeatureFlag(flagKey)
      }
      return undefined
    },
    
    // Group analytics
    group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        posthog.group(groupType, groupKey, properties)
      }
    }
  }
}
