/**
 * Navigation tracking utility to detect if user navigated within the app
 */

export const setAppNavigation = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('app_navigation', 'true')
  }
}

export const hasAppNavigation = (): boolean => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('app_navigation') === 'true'
}

export const clearAppNavigation = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('app_navigation')
  }
}
