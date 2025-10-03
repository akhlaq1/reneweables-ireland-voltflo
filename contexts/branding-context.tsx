'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Branding, getBranding } from '@/lib/branding';

// Default branding fallback
const getDefaultBranding = (): Branding => ({
  slug: 'renewables',
  name: 'Renewables Ireland Limited',
  website: 'https://renewables-ireland.ie',
  email: 'info@renewables-ireland.ie',
  phone: '+353 (0)1 298 6140',
  logo: '/renewables.png',
  description: "Big enough to get the job done & small enough to care",
  address_template: 0,
  colors: { primary: '#1d4ed8', secondary: '#059669', accent: '#f59e0b' },
  social: {
    instagram: 'https://www.instagram.com/stories/renewablesireland.ie/3725637469225194131/',
    facebook: 'https://www.facebook.com/higconrenewablesireland/',
    linkedin: 'https://www.linkedin.com/company/renewables-ireland-limited/?viewAsMember=true'
  },
  reviews: {
    rating: 5.0,
    count: 117,
    url: 'https://www.google.com/search?sca_esv=9594ada01a48a169&rlz=1C5CHFA_enNL1151CN1151&sxsrf=AE3TifOLVIRREnjf2ydlbYTV2tkTXeJTkw:1758561478793&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E1ubApUpwoeV_DuAxkE_TYKKgzVbiT_bBHZ4WYKu7vkmt3eKiqLNVWGAcl4x0HIfQcTO1v53QxUk-jWrhFTqvSs2N4sdeEYbrxDNIneWCpnJlyVmbA%3D%3D&q=Renewables+Ireland+Reviews&sa=X&ved=2ahUKEwjykYmC8OyPAxXOk1YBHUQANYQQ0bkNegQIIhAE&biw=2560&bih=1198&dpr=2',
    warranty: '2-Year Workmanship Warranty'
  },
  equipment: {
    solarPanels: [],
    inverters: [],
    batteries: [],
    evChargers: []
  },
  pricing: {
    pricingType: 'base_plus_incremental',
    basePanelThreshold: 8,
    baseSystemPrice: 7360,
    additionalPanelCost: 200,
    slabPricing: [],
    seaiGrant: 2400,
    defaultEVGrant: 600
  },
  energy: {
    gridRateDay: 0.30,
    gridRateNight: 0.20,
    exportRate: 0.21,
    annualPriceIncrease: 0.03,
    batteryRoundTripEfficiency: 0.9
  },
  emailBranding: {
    company_name: 'Renewables Ireland',
    company_tagline: 'Big enough to get the job done & small enough to care',
    support_email: 'info@renewables-ireland.ie',
    phone_number: '+353 (0)1 298 6140',
    phone_number_clean: '+35312986140',
    website_url: 'https://renewables-ireland.ie',
    backend_url: 'https://renewables-ireland.ie',
    platform_name: 'Renewables Ireland',
    report_primary_color: '#1d4ed8',
    report_secondary_color: '#059669',
    call_primary_color: '#1d4ed8',
    call_secondary_color: '#059669',
    background_gradient: 'linear-gradient(135deg, #1d4ed8 0%, #059669 100%)',
    calendar_button_color: '#1d4ed8'
  },
  testimonials: []
});

interface BrandingContextType {
  branding: Branding;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: React.ReactNode;
  hostname?: string;
}

export function BrandingProvider({ children, hostname }: BrandingProviderProps) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get branding based on hostname or current hostname
      const currentHostname = hostname || (typeof window !== 'undefined' ? window.location.hostname : undefined);
      const brandingData = await getBranding(currentHostname);
      
      setBranding(brandingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branding');
      console.error('Error loading branding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBranding = () => {
    loadBranding();
  };

  useEffect(() => {
    loadBranding();
  }, [hostname]);

  const value: BrandingContextType = {
    branding: branding || getDefaultBranding(), // Fallback to default renewables branding
    isLoading,
    error,
    refreshBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBrandingContext() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBrandingContext must be used within a BrandingProvider');
  }
  return context;
}

// Export the context for advanced usage
export { BrandingContext };
