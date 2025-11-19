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
  price?: number; // Absolute price (e.g., battery, EV charger unit price). For batteries: set to 0 when using inverter-specific slab pricing (price will be calculated dynamically)
  capacity?: number; // kWh for batteries
  power?: string; // kW rating for EV charger
  grant?: number; // Applicable grant for this equipment (e.g. EV charger grant)
  recommended: boolean;
  reason: string;
  datasheet?: string; // Path to downloadable PDF if available
  features?: string[];
  image?: string; // Path to equipment image/logo
  compatibleBatteries?: string[]; // IDs of compatible batteries (for inverters)
  compatibleInverters?: string[]; // IDs of compatible inverters (for batteries)
  pricingConfig?: InverterPricingConfig; // Inverter-specific pricing configuration
}


/**
 * Battery-specific pricing configuration for an inverter
 * Each battery (identified by ID) can have its own slab pricing
 * The batteryId references the actual battery object which contains the capacity
 */
export interface BatteryPricingConfig {
  batteryId: string; // Battery ID (e.g., 'sigenergy5', 'sigenergy8', 'tesla5')
  slabPricing: PricingSlabTier[]; // Pricing slabs for this battery configuration
}

/**
 * Inverter-specific pricing configuration
 * Supports different pricing for:
 * - Inverter only (no battery)
 * - Inverter + Battery (different slabs per battery capacity)
 */
export interface InverterPricingConfig {
  inverterId: string; // Reference to the inverter ID
  inverterOnlyPricing: PricingSlabTier[]; // Pricing when no battery is included
  withBatteryPricing: BatteryPricingConfig[]; // Pricing for each battery configuration
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
  panelWattage?: number; // Wattage per panel for dynamic SEAI grant calculation (default: 440W)
  useDynamicSEAIGrant?: boolean; // If true, calculate SEAI grant based on system size
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
export function calculateSystemBaseCost(
  panelCount: number, 
  panel: EquipmentOption, 
  inverter: EquipmentOption, 
  pricing: PricingFormulaConfig,
  includeBattery: boolean = false,
  battery?: EquipmentOption // Changed: now accepts full battery object instead of just capacity
) {
  const panelAdj = panel.priceAdjustment || 0;
  const inverterAdj = inverter.priceAdjustment || 0;
  
  // Check if inverter has its own pricing configuration
  if (inverter.pricingConfig) {
    return calculateInverterSpecificCost(
      panelCount,
      inverter.pricingConfig,
      panelAdj,
      inverterAdj,
      includeBattery,
      battery?.id // Pass battery ID for matching
    );
  }
  
  // Fallback to brand-level pricing (legacy support)
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

// export function calculateSystemBaseCost(panelCount: number, panel: EquipmentOption, inverter: EquipmentOption, pricing: PricingFormulaConfig) {
//   const panelAdj = panel.priceAdjustment || 0;
//   const inverterAdj = inverter.priceAdjustment || 0;
  
//   if (pricing.pricingType === 'slab_pricing' && pricing.slabPricing) {
//     // Find the appropriate slab tier for the panel count
//     const slabTier = findSlabTierForPanelCount(panelCount, pricing.slabPricing);
//     return slabTier.price + panelAdj + inverterAdj;
//   } else {
//     // Use original base + incremental pricing
//     const { basePanelThreshold, baseSystemPrice, additionalPanelCost } = pricing;
//     if (panelCount <= basePanelThreshold) {
//       return baseSystemPrice + panelAdj + inverterAdj;
//     }
//     return baseSystemPrice + (panelCount - basePanelThreshold) * additionalPanelCost + panelAdj + inverterAdj;
//   }
// }

/**
 * Calculate system cost using inverter-specific pricing configuration
 * Supports different pricing slabs for inverter-only vs inverter+battery configurations
 */
export function calculateInverterSpecificCost(
  panelCount: number,
  pricingConfig: InverterPricingConfig,
  panelAdj: number,
  inverterAdj: number,
  includeBattery: boolean,
  batteryId?: string
): number {
  let baseCost: number;
  
  if (includeBattery && batteryId) {
    // Find pricing for this specific battery ID
    const batteryConfig = pricingConfig.withBatteryPricing.find(
      config => config.batteryId === batteryId
    );
    
    if (batteryConfig) {
      const slabTier = findSlabTierForPanelCount(panelCount, batteryConfig.slabPricing);
      baseCost = slabTier.price;
    } else {
      // Fallback to inverter-only pricing if battery config not found
      const slabTier = findSlabTierForPanelCount(panelCount, pricingConfig.inverterOnlyPricing);
      baseCost = slabTier.price;
    }
  } else {
    // Use inverter-only pricing
    const slabTier = findSlabTierForPanelCount(panelCount, pricingConfig.inverterOnlyPricing);
    baseCost = slabTier.price;
  }
  
  return baseCost + panelAdj + inverterAdj;
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

/**
 * Calculate the actual price of a battery for a given configuration
 * When using inverter-specific pricing, the battery price is the difference between
 * the withBatteryPricing and inverterOnlyPricing slabs
 * 
 * @param battery Battery equipment option
 * @param inverter Inverter equipment option
 * @param panelCount Number of panels in the system
 * @returns Battery price in euros
 */
export function calculateBatteryPrice(
  battery: EquipmentOption,
  inverter: EquipmentOption,
  panelCount: number
): number {
  // If battery has a static price defined, use it (legacy pricing)
  if (battery.price && battery.price > 0) {
    return battery.price;
  }
  
  // If inverter has pricing config, calculate dynamic battery price
  if (inverter.pricingConfig) {
    const { pricingConfig } = inverter;
    
    // Find the inverter-only pricing for this panel count
    const inverterOnlyTier = findSlabTierForPanelCount(panelCount, pricingConfig.inverterOnlyPricing);
    const inverterOnlyPrice = inverterOnlyTier.price;
    
    // Find the pricing with this specific battery
    const batteryConfig = pricingConfig.withBatteryPricing.find(
      config => config.batteryId === battery.id
    );
    
    if (batteryConfig) {
      const withBatteryTier = findSlabTierForPanelCount(panelCount, batteryConfig.slabPricing);
      const withBatteryPrice = withBatteryTier.price;
      
      // Battery price is the difference
      return Math.max(0, withBatteryPrice - inverterOnlyPrice);
    }
    
    // If no battery config found, return 0 (fallback)
    return 0;
  }
  
  // No pricing config available, return static price or 0
  return battery.price || 0;
}


/**
 * Get the SEAI grant for a specific panel count, considering brand pricing configuration
 * Uses dynamic calculation if enabled, otherwise returns default grant
 * 
 * @param panelCount Number of solar panels
 * @param pricing Pricing configuration from branding
 * @returns SEAI grant amount in euros
 */
export function getSEAIGrant(panelCount: number, pricing: PricingFormulaConfig): number {
  if (pricing.useDynamicSEAIGrant) {
    const panelWattage = pricing.panelWattage || 440;
    return calculateSEAIGrant(panelCount, panelWattage);
  }
  return pricing.seaiGrant;
}

/**
 * Check if a battery is compatible with the selected inverter
 */
export function isBatteryCompatibleWithInverter(battery: EquipmentOption, inverter: EquipmentOption): boolean {
  // If no compatibility constraints defined, assume all are compatible (backward compatibility)
  if (!inverter.compatibleBatteries || inverter.compatibleBatteries.length === 0) {
    return true;
  }
  
  return inverter.compatibleBatteries.includes(battery.id);
}

/**
 * Check if an inverter is compatible with the selected battery
 */
export function isInverterCompatibleWithBattery(inverter: EquipmentOption, battery: EquipmentOption): boolean {
  // If no compatibility constraints defined, assume all are compatible (backward compatibility)
  if (!battery.compatibleInverters || battery.compatibleInverters.length === 0) {
    return true;
  }
  
  return battery.compatibleInverters.includes(inverter.id);
}

/**
 * Filter batteries that are compatible with the selected inverter
 */
export function getCompatibleBatteries(batteries: EquipmentOption[], inverter: EquipmentOption): EquipmentOption[] {
  return batteries.filter(battery => isBatteryCompatibleWithInverter(battery, inverter));
}

/**
 * Filter inverters that are compatible with the selected battery
 */
export function getCompatibleInverters(inverters: EquipmentOption[], battery: EquipmentOption): EquipmentOption[] {
  return inverters.filter(inverter => isInverterCompatibleWithBattery(inverter, battery));
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
    slug: 'renewables-ireland',
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
          image: '/images/inverters/huawei.png',
          compatibleBatteries: ['huawei5','huawei10'],
          pricingConfig: {
            inverterId: 'huawei',
             // Pricing for Huawei inverter without battery
            inverterOnlyPricing:[
              { panelCount: 8, price: 7360 },
              { panelCount: 10, price: 7660 },
              { panelCount: 12, price: 7800 },
              { panelCount: 14, price: 8165 },
              { panelCount: 16, price: 8350 },
            ],
             // Pricing for Huawei inverter with different batteries
            withBatteryPricing: [
              {
                batteryId: 'huawei5', // Sigen 5kWh battery
                slabPricing: [
                  { panelCount: 8, price: 9855 },
                  { panelCount: 10, price: 10155 },
                  { panelCount: 12, price: 10295 },
                  { panelCount: 14, price: 10660 },
                  { panelCount: 16, price: 10845 },
                    ]
              },
              {
                batteryId: 'huawei10', // Sigen 5kWh battery
                slabPricing: [
                  { panelCount: 8, price: 12350 },
                  { panelCount: 10, price: 12650 },
                  { panelCount: 12, price: 12790 },
                  { panelCount: 14, price: 13155 },
                  { panelCount: 16, price: 13340 }
                    ]
              },
            ]
          }
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
          image: '/images/batteries/huwaei5kw.jpg',
          compatibleInverters: ['huawei']
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
          image: '/images/batteries/huawei10kw.jpg',
          compatibleInverters: ['huawei']
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
      slabPricing: [
        { panelCount: 8, price: 6500 },
        { panelCount: 9, price: 6600 },
        { panelCount: 10, price: 6750 },
        { panelCount: 11, price: 7050 },
        { panelCount: 12, price: 7350 },
        { panelCount: 13, price: 7600 },
        { panelCount: 14, price: 7850 },
        { panelCount: 15, price: 8100 },
        { panelCount: 16, price: 8300 },
        { panelCount: 17, price: 8550 },
        { panelCount: 18, price: 8850 },
      ],
      seaiGrant: 1800, // Default fallback value
      panelWattage: 450, // Wattage per panel for SEAI grant calculation
      useDynamicSEAIGrant: true, // Enable dynamic SEAI grant calculation based on system size
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
    logo_with_name: '/logo_with_name.png',
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
  return 'renewables-ireland';
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
