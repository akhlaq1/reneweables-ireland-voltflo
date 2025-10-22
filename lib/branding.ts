// Centralized branding, equipment, pricing, and energy assumptions
// All brand-related data (logos, contact, equipment catalogs, pricing formulas) lives here.
// Extend or add new brands by updating the brands map below.

import companyService from '../app/api/company';

export interface EquipmentOption {
  id: string;
  name: string;
  tier: string;
  warranty: string;
  efficiency?: string;
  priceAdjustment?: number; // For panels/inverters where base system price is adjusted
  price?: number; // Absolute price (e.g., battery, EV charger unit price)
  capacity?: number; // kWh for batteries
  power?: string; // kW rating for EV charger
  grant?: number; // Applicable grant for this equipment (e.g. EV charger grant)
  recommended: boolean;
  reason: string;
  datasheet?: string; // Path to downloadable PDF if available
  features?: string[];
  image?: string; // Path to equipment image/logo
}

/**
 * PRICING SYSTEM DOCUMENTATION
 * ============================
 * 
 * This branding system supports two different pricing models:
 * 
 * 1. BASE + INCREMENTAL PRICING ('base_plus_incremental')
 *    - Uses a base system price for a threshold number of panels
 *    - Adds a fixed cost per additional panel beyond the threshold
 *    - Example: €7,360 for 8 panels, then €200 per additional panel
 * 
 * 2. SLAB PRICING ('slab_pricing')
 *    - Uses predefined price tiers for specific panel counts
 *    - More flexible pricing that doesn't follow a linear pattern
 *    - Example pricing structure as requested:
 *      - 8 panels: €7,360
 *      - 10 panels: €7,660
 *      - 12 panels: €7,960
 *      - 14 panels: €8,165
 *      - 16 panels: €8,350
 * 
 * To switch between pricing systems:
 * - Set `pricingType` to 'base_plus_incremental' or 'slab_pricing'
 * - For slab pricing, provide the `slabPricing` array with panel counts and prices
 * - The calculateSystemBaseCost() function automatically handles both systems
 * 
 * The system will automatically find the appropriate price tier for any panel count.
 * If the panel count exceeds all defined tiers, it uses the highest tier price.
 */

export interface PricingSlabTier {
  panelCount: number; // Number of panels for this tier
  price: number; // Total system price for this panel count
}

export interface PricingFormulaConfig {
  pricingType: 'base_plus_incremental' | 'slab_pricing'; // Determines which pricing method to use
  // Base + Incremental pricing (original method)
  basePanelThreshold: number; // Number of panels included in base price
  baseSystemPrice: number; // Price covering basePanelThreshold panels + default inverter & panel option
  additionalPanelCost: number; // Incremental cost per panel beyond threshold
  // Slab pricing (new method)
  slabPricing?: PricingSlabTier[]; // Array of panel count -> price mappings
  seaiGrant: number; // Default SEAI grant (if eligible)
  defaultEVGrant: number; // Default EV charger grant (if equipment entry has grant undefined)
}

export interface EnergyAssumptions {
  gridRateDay: number; // €/kWh day rate
  gridRateNight: number; // €/kWh night rate
  exportRate: number; // €/kWh export remuneration
  annualPriceIncrease: number; // % annual escalation (e.g., 0.03 for 3%)
  batteryRoundTripEfficiency: number; // e.g. 0.9
}

export interface Reviews {
  rating: number; // e.g., 5.0
  count: number; // e.g., 86
  url?: string; // Link to reviews page
  warranty?: string; // e.g., "5-Year Workmanship Warranty"
}

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

export interface Certification {
  name: string;
  description?: string;
  verified?: boolean;
}

export interface FounderInfo {
  name: string;
  title: string;
  photo?: string;
  description: string;
  quote?: string;
  experience?: string;
}

export interface EmailBranding {
  company_id?: number; // Optional ID if linked to a company in backend
  company_name: string;
  company_tagline: string;
  support_email: string;
  phone_number: string;
  phone_number_clean: string;
  website_url: string;
  backend_url: string;
  logo_url?: string | null;
  platform_name: string;
  report_primary_color: string;
  report_secondary_color: string;
  call_primary_color: string;
  call_secondary_color: string;
  background_gradient: string;
  calendar_button_color: string;
}

export interface Branding {
  slug: string;
  name: string;
  website: string;
  email: string;
  phone: string;
  logo: string; // Path to logo asset
  logo_with_name: string;
  description?: string; // Company description
  address_template?: number; // Template ID for address page (0-5, defaults to 0)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  reviews?: Reviews; // Optional reviews data
  testimonials?: Testimonial[]; // Customer testimonials
  certifications?: Certification[]; // Company certifications
  founder?: FounderInfo; // Founder/key person information
  tags?: string[]; // Optional marketing tags
  emailBranding: EmailBranding; // Email branding configuration
  equipment: {
    solarPanels: EquipmentOption[];
    inverters: EquipmentOption[];
    batteries: EquipmentOption[];
    evChargers: EquipmentOption[];
  };
  pricing: PricingFormulaConfig;
  energy: EnergyAssumptions;
}

// Helper calculation utilities centralised here for reuse
export function calculateSystemBaseCost(panelCount: number, panel: EquipmentOption, inverter: EquipmentOption, pricing: PricingFormulaConfig) {
  const panelAdj = panel.priceAdjustment || 0;
  const inverterAdj = inverter.priceAdjustment || 0;
  
  if (pricing.pricingType === 'slab_pricing' && pricing.slabPricing) {
    // Find the appropriate slab tier for the panel count
    const slabTier = findSlabTierForPanelCount(panelCount, pricing.slabPricing);
    return slabTier.price + panelAdj + inverterAdj;
  } else {
    // Use original base + incremental pricing
    const { basePanelThreshold, baseSystemPrice, additionalPanelCost } = pricing;
    if (panelCount <= basePanelThreshold) {
      return baseSystemPrice + panelAdj + inverterAdj;
    }
    return baseSystemPrice + (panelCount - basePanelThreshold) * additionalPanelCost + panelAdj + inverterAdj;
  }
}

// Helper function to find the appropriate slab tier for a given panel count
export function findSlabTierForPanelCount(panelCount: number, slabPricing: PricingSlabTier[]): PricingSlabTier {
  // Sort the slab pricing by panel count in ascending order
  const sortedSlabs = [...slabPricing].sort((a, b) => a.panelCount - b.panelCount);
  
  // Find the exact match or the next higher tier
  let selectedTier = sortedSlabs[0]; // Default to first tier
  
  for (const tier of sortedSlabs) {
    if (panelCount <= tier.panelCount) {
      selectedTier = tier;
      break;
    }
    selectedTier = tier; // Keep updating to the highest tier if panel count exceeds all tiers
  }
  
  return selectedTier;
}

export function getBatteryCost(includeBattery: boolean, battery: EquipmentOption, count: number) {
  if (!includeBattery) return 0;
  return (battery.price || 0) * count;
}

export function getEVChargerCost(includeCharger: boolean, charger: EquipmentOption) {
  if (!includeCharger) return 0;
  return charger.price || 0;
}

export function getEVGrant(includeCharger: boolean, charger: EquipmentOption, pricing: PricingFormulaConfig) {
  if (!includeCharger) return 0;
  return charger.grant ?? pricing.defaultEVGrant;
}

export function estimateAnnualSolarSavings(annualPV: number, selfUseFraction: number, energy: EnergyAssumptions) {
  const exportFraction = 1 - selfUseFraction;
  return annualPV * (selfUseFraction * energy.gridRateDay + exportFraction * energy.exportRate);
}

/**
 * Calculate SEAI Solar PV Grant based on panel count
 * Grant structure (as of 2025):
 * - €700 per kWp up to 2kWp
 * - €200 for every additional kWp up to 4kWp
 * - Total grant capped at €1800
 * 
 * Assuming 450W (0.45kW) per panel:
 * - Up to 5 panels (2.2kWp): €1400
 * - 6-7 panels (2.64-3.08kWp): €1600
 * - 8+ panels (3.52kWp+): €1800
 * 
 * @param panelCount - Number of solar panels
 * @param wattsPerPanel - Wattage per panel (default 450W)
 * @returns SEAI grant amount in euros
 */
export function calculateSEAIGrant(panelCount: number, wattsPerPanel: number = 450): number {
 const systemSizeKWp = (panelCount * wattsPerPanel) / 1000; // Convert to kWp
  
  if (systemSizeKWp <= 2) {
    return 1400;
  } else if (systemSizeKWp <= 4) {
    return 1600;
  } else {
    return 1800;
  }
}

// Brand definitions
const brands: Record<string, Branding> = {
  renewables: {
    slug: 'renewables',
    name: 'Renewables Ireland Limited',
    website: 'https://renewables-ireland.ie',
    email: 'info@renewables-ireland.ie',
    phone: '+353 (0)1 298 6140',
    logo: '/renewables.png',
    logo_with_name: 'logo_with_name.png',
    description: "Big enough to get the job done & small enough to care",
    address_template: 0, // Default template
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
    // founder: {
    //   name: 'David Joyce',
    //   title: 'Founder & Lead Electrician',
    //   photo: '/images/stephen.png',
    //   description: 'David has over 18 years of hands-on electrical experience and personally oversees every solar install for quality and safety.',
    //   quote: 'Our goal is simple: deliver solar installations you can trust for decades to come.',
    //   experience: '18+ years'
    // },
    certifications: [
      { name: 'SEAI Registered', verified: true },
      { name: 'RECI Certified', verified: true },
      { name: 'Huawei Certified', verified: true },
      { name: 'Van Der Valk Certified', verified: true }
    ],
    testimonials: [
      {
        name: "Andrea Webb",
        location: "Galway",
        text: "The team at Renewables were so helpful and supportive. Great advice to help choose the right solar solution for my home and family and the app tracks all the data for me.",
        rating: 5,
      },
      {
        name: "Paddy Duffy",
        location: "Co. Galway",
        text: "Renewables Ireland recently installed solar panels at our home. I would highly recommend the team. From the office to the installation team and follow up support, they were very professional, clearly experts in how to maximise usage, and courteous. A great local company.",
        rating: 5,
      },
    ],

    equipment: {
      solarPanels: [
        {
          id: 'astro',
          name: 'Astro N7s',
          tier: 'Tier 1',
          warranty: '30-Year Performance',
          efficiency: '21.4%',
          priceAdjustment: 0,
          recommended: true,
          reason: 'Higher efficiency, premium pricing',
          datasheet: '/pdf/astron7s.pdf',
          image: '/images/solar-panels/astron7s.png'
        }
      ],
      inverters: [
        {
          id: 'huawei',
          name: 'Huawei SUN2000 Inverter',
          tier: 'Premium',
          warranty: '10-Year Product',
          efficiency: '98%',
          priceAdjustment: 0,
          recommended: true,
          reason: 'Industry-leading reliability',
          datasheet: '/pdf/huawei_inverter.pdf',
          image: '/images/inverters/huawei.png'
        }
      ],
      batteries: [
        {
          id: 'huawei5',
          name: 'Huawei LUNA2000 5kWh',
          capacity: 5,
          price: 2495,
          tier: 'Standard',
          warranty: '10-Year Product',
          recommended: false,
          reason: 'Compact solution, lower capacity',
          datasheet: '/pdf/huawei_battery.pdf',
          image: '/images/batteries/huwaei5kw.jpg'
        },
        {
          id: 'huawei10',
          name: 'Huawei LUNA2000 10kWh',
          capacity: 10,
          price: 4990,
          tier: 'Standard',
          warranty: '10-Year Product',
          recommended: false,
          reason: 'Compact solution, lower capacity',
          datasheet: '/pdf/huawei_battery.pdf',
          image: '/images/batteries/huawei10kw.jpg'
        },
      ],
      evChargers: [
        {
          id: 'myenergi_zappi',
          name: 'Myenergi Zappi 7KW',
          power: '7kW',
          price: 1580,
          grant: 300,
          tier: 'Premium',
          warranty: '3-Year Product',
          recommended: true,
          reason: 'Smart charging with solar integration',
          features: ['Solar integration', 'Smart scheduling', 'Load balancing', 'Mobile app control'],
          datasheet: '/pdf/myenergi_zappi.pdf',
          image: '/images/ev-chargers/myenergi_zappi.png'
        }
      ]
    },
    pricing: {
      pricingType: 'base_plus_incremental',
      basePanelThreshold: 8,
      baseSystemPrice: 7360,
      additionalPanelCost: 200,
      seaiGrant: 1800,
      defaultEVGrant: 300
    },
    energy: {
      gridRateDay: 0.35,
      gridRateNight: 0.08,
      exportRate: 0.20,
      annualPriceIncrease: 0.03,
      batteryRoundTripEfficiency: 0.9
    },
    emailBranding: {
      company_id: 3,
      company_name: 'Renewables Ireland',
      company_tagline: 'Big enough to get the job done & small enough to care.',
      support_email: 'info@renewables-ireland.ie',
      phone_number: '+353 (0)1 298 6140',
      phone_number_clean: '+353 (0)1 298 6140',
      website_url: 'https://renewables-ireland.voltflo.ie',
      backend_url: 'https://staging-installerflow.voltflo.com',
      logo_url: null,
      platform_name: 'Voltflo',
      report_primary_color: '#1d4ed8',
      report_secondary_color: '#059669',
      call_primary_color: '#28a745',
      call_secondary_color: '#007bff',
      background_gradient: 'linear-gradient(90deg,#dbeafe,#ecfdf5)',
      calendar_button_color: '#1d4ed8',
    }
  },

  // Example brand with base + incremental pricing for comparison
  renewables_incremental: {
    slug: 'renewables_incremental',
    name: 'Renewables Ireland Limited (Incremental Pricing)',
    website: 'https://renewables-ireland.ie',
    email: 'info@renewables-ireland.ie',
    phone: '+353 (0)1 298 6140',
    logo: '/renewables.png',
    description: "Example configuration using base + incremental pricing",
    address_template: 1, // Use template 1
    colors: { primary: '#1d4ed8', secondary: '#059669', accent: '#f59e0b' },
    equipment: {
      solarPanels: [
        {
          id: 'astro',
          name: 'Astro N7s',
          tier: 'Tier 1',
          warranty: '30-Year Performance',
          efficiency: '21.4%',
          priceAdjustment: 0,
          recommended: true,
          reason: 'Higher efficiency, premium pricing',
        }
      ],
      inverters: [
        {
          id: 'huawei',
          name: 'Huawei SUN2000 Inverter',
          tier: 'Premium',
          warranty: '10-Year Product',
          efficiency: '98.4%',
          priceAdjustment: 0,
          recommended: true,
          reason: 'Industry-leading reliability',
        }
      ],
      batteries: [
        {
          id: 'sigenergy',
          name: 'SigEnergy Battery 8kWh',
          capacity: 8,
          price: 3000,
          tier: 'Premium',
          warranty: '10-Year Product',
          recommended: true,
          reason: 'Most reliable, excellent cycle life',
        },
        {
          id: 'huawei',
          name: 'Huawei Battery 5kWh',
          capacity: 5,
          price: 2200,
          tier: 'Standard',
          warranty: '10-Year Product',
          recommended: false,
          reason: 'Compact solution, lower capacity',
        },
        {
          id: 'tesla',
          name: 'Tesla Powerwall 10kWh',
          capacity: 10,
          price: 4500,
          tier: 'Premium+',
          warranty: '10-Year Product',
          recommended: false,
          reason: 'High capacity, premium brand',
        }
      ],
      evChargers: [
        {
          id: 'myenergi_zappi',
          name: 'Myenergi Zappi 7KW',
          power: '7kW',
          price: 1600,
          grant: 300,
          tier: 'Premium',
          warranty: '3-Year Product',
          recommended: true,
          reason: 'Smart charging with solar integration',
          features: ['Solar integration', 'Smart scheduling', 'Load balancing', 'Mobile app control'],
          datasheet: '/pdf/myenergi_zappi.pdf',
        }
      ]
    },
    pricing: {
      pricingType: 'base_plus_incremental',
      basePanelThreshold: 8,
      baseSystemPrice: 7360,
      additionalPanelCost: 200,
      seaiGrant: 1800,
      defaultEVGrant: 300
    },
    energy: {
      gridRateDay: 0.35,
      gridRateNight: 0.08,
      exportRate: 0.20,
      annualPriceIncrease: 0.03,
      batteryRoundTripEfficiency: 0.9
    },
    emailBranding: {
      company_name: 'Renewables Ireland',
      company_tagline: 'Big enough to get the job done & small enough to care.',
      support_email: 'akhlaq@voltflo.com',
      phone_number: '+353 (0)1 298 6140',
      phone_number_clean: '+353 (0)1 298 6140',
      website_url: 'https://renewables-ireland.netlify.app',
      backend_url: 'https://staging-installerflow.voltflo.com',
      logo_url: null,
      platform_name: 'Voltflo',
      report_primary_color: '#1d4ed8',
      report_secondary_color: '#059669',
      call_primary_color: '#28a745',
      call_secondary_color: '#007bff',
      background_gradient: 'linear-gradient(90deg,#dbeafe,#ecfdf5)',
      calendar_button_color: '#1d4ed8',
    }
  },
  
  
};

export function resolveBrandSlugFromHostname(host?: string): string {
  return 'jr';
}

// create a async api function
export async function getBranding(hostname?: string): Promise<Branding> {
  const slug = resolveBrandSlugFromHostname(hostname || (typeof window !== 'undefined' ? window.location.hostname : undefined));
  return companyService.getCompanyDatabySubDomain({
    "sub_domain": slug,
    "required_fields": ["name", "logo","slug"]
  }).then((res) => {
    return {
      ...res.data.data
    };
   
  }).catch((error) => {
    console.error('Error fetching branding:', error);
    return brands[slug] || brands.renewables;
  });
  
}

// export function getBranding1(hostname?: string): Branding {
//   const slug = resolveBrandSlugFromHostname(hostname || (typeof window !== 'undefined' ? window.location.hostname : undefined));
//   return brands[slug] || brands.renewables;
  
// }

// export function listBrands(): Branding[] { return Object.values(brands); }

// Convenience helpers
// export function getPrimaryColor() { return getBranding().colors.primary }
// export function getSecondaryColor() { return getBranding().colors.secondary }
// export function getAccentColor() { return getBranding().colors.accent }
// export function getSupportEmail() { return getBranding().email }

// export function getEmailBranding1(hostname?: string): EmailBranding { 
//   return getBranding(hostname).emailBranding 
// }


// export async function getEmailBranding(hostname?: string): Promise<EmailBranding> {
//   try {
//     const currentHostname = resolveBrandSlugFromHostname(hostname || (typeof window !== 'undefined' ? window.location.hostname : undefined));
    
//     console.log("Fetching email branding for hostname:", currentHostname);

//     const response = await companyService.getCompanyDatabySubDomain({
//       "sub_domain": currentHostname,
//       "required_fields": ["emailBranding"]
//     });
    
//     console.log("API response:", response);
    
//     if (response.status !== 200) {
//       throw new Error(`Failed to fetch email branding: ${response.statusText}`);
//     }
    
//     // Extract email branding from the response
//     const emailBranding = response.data.emailBranding;
//     console.log("Extracted email branding:", emailBranding);
    
//     if (!emailBranding) {
//       throw new Error('Email branding data not found in response');
//     }
    
//     return emailBranding;
//   } catch (error) {
//     console.error('Error fetching email branding from API:', error);
//     // Fallback to static branding on error
//     const fallbackBranding = getBranding(hostname).emailBranding;
//     console.log("Using fallback email branding:", fallbackBranding);
//     return fallbackBranding;
//   }
// }