'use client';

import { useBrandingContext } from '@/contexts/branding-context';
import { Branding } from '@/lib/branding';

/**
 * Custom hook to access branding data from the BrandingContext
 * 
 * @returns {Object} Branding context with branding data, loading state, error state, and refresh function
 * @returns {Branding} branding - The current branding configuration
 * @returns {boolean} isLoading - Whether branding data is currently loading
 * @returns {string|null} error - Any error that occurred while loading branding
 * @returns {function} refreshBranding - Function to refresh the branding data
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { branding, isLoading, error } = useBranding();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return <div>{branding.name}</div>;
 * }
 * ```
 */
export function useBranding() {
  const context = useBrandingContext();
  
  return {
    branding: context.branding,
    isLoading: context.isLoading,
    error: context.error,
    refreshBranding: context.refreshBranding,
  };
}

/**
 * Hook to get specific branding properties with fallbacks
 * 
 * @returns {Object} Object with commonly used branding properties
 */
export function useBrandingData() {
  const { branding, isLoading, error } = useBranding();
  
  return {
    // Basic company info
    name: branding.name,
    website: branding.website,
    email: branding.email,
    phone: branding.phone,
    logo: branding.logo,
    description: branding.description,
    
    // Colors
    colors: branding.colors,
    primaryColor: branding.colors.primary,
    secondaryColor: branding.colors.secondary,
    accentColor: branding.colors.accent,
    
    // Social media
    social: branding.social,
    
    // Reviews and testimonials
    reviews: branding.reviews,
    testimonials: branding.testimonials,
    
    // Equipment and pricing
    equipment: branding.equipment,
    pricing: branding.pricing,
    energy: branding.energy,
    
    // Email branding
    emailBranding: branding.emailBranding,
    
    // State
    isLoading,
    error,
  };
}

/**
 * Hook to get equipment options by category
 * 
 * @param category - The equipment category ('solarPanels', 'inverters', 'batteries', 'evChargers')
 * @returns {Object} Equipment options and loading state
 */
export function useEquipment(category: keyof Branding['equipment']) {
  const { branding, isLoading, error } = useBranding();
  
  return {
    equipment: branding.equipment[category],
    isLoading,
    error,
  };
}

/**
 * Hook to get pricing configuration
 * 
 * @returns {Object} Pricing configuration and loading state
 */
export function usePricing() {
  const { branding, isLoading, error } = useBranding();
  
  return {
    pricing: branding.pricing,
    energy: branding.energy,
    isLoading,
    error,
  };
}

export default useBranding;
