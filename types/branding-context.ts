import { Branding } from '@/lib/branding';

/**
 * TypeScript types for the branding context system
 */

export interface BrandingContextType {
  branding: Branding;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => void;
}

export interface BrandingProviderProps {
  children: React.ReactNode;
  hostname?: string;
}

export interface UseBrandingReturn {
  branding: Branding;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => void;
}

export interface UseBrandingDataReturn {
  // Basic company info
  name: string;
  website: string;
  email: string;
  phone: string;
  logo: string;
  description?: string;
  
  // Colors
  colors: Branding['colors'];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Social media
  social?: Branding['social'];
  
  // Reviews and testimonials
  reviews?: Branding['reviews'];
  testimonials?: Branding['testimonials'];
  
  // Equipment and pricing
  equipment: Branding['equipment'];
  pricing: Branding['pricing'];
  energy: Branding['energy'];
  
  // Email branding
  emailBranding: Branding['emailBranding'];
  
  // State
  isLoading: boolean;
  error: string | null;
}

export interface UseEquipmentReturn {
  equipment: Branding['equipment'][keyof Branding['equipment']];
  isLoading: boolean;
  error: string | null;
}

export interface UsePricingReturn {
  pricing: Branding['pricing'];
  energy: Branding['energy'];
  isLoading: boolean;
  error: string | null;
}

// Re-export Branding type for convenience
export type { Branding } from '@/lib/branding';
