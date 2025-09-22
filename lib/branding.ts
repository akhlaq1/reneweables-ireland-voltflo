// Centralized branding, equipment, pricing, and energy assumptions
// All brand-related data (logos, contact, equipment catalogs, pricing formulas) lives here.
// Extend or add new brands by updating the brands map below.

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
}

export interface PricingFormulaConfig {
  basePanelThreshold: number; // Number of panels included in base price
  baseSystemPrice: number; // Price covering basePanelThreshold panels + default inverter & panel option
  additionalPanelCost: number; // Incremental cost per panel beyond threshold
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
  description?: string; // Company description
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
  const { basePanelThreshold, baseSystemPrice, additionalPanelCost } = pricing;
  const panelAdj = panel.priceAdjustment || 0;
  const inverterAdj = inverter.priceAdjustment || 0;
  if (panelCount <= basePanelThreshold) {
    return baseSystemPrice + panelAdj + inverterAdj;
  }
  return baseSystemPrice + (panelCount - basePanelThreshold) * additionalPanelCost + panelAdj + inverterAdj;
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

// Brand definitions
const brands: Record<string, Branding> = {
  voltflo: {
    slug: 'voltflo',
    name: 'Voltflo inc.',
    website: 'https://voltflo.com',
    email: 'solarpotential@voltflo.com',
    phone: '(085) 834-9461',
    logo: '/logo.png',
    description: "Ireland's trusted SEAI-registered solar installer, delivering reliable energy solutions for your home and future.",
    colors: { primary: '#1d4ed8', secondary: '#059669', accent: '#f59e0b' },
    social: {
      instagram: 'https://www.instagram.com/voltflo.ie/',
      facebook: 'https://www.facebook.com/VoltfloSolar/',
      linkedin: 'https://www.linkedin.com/company/voltflo/'
    },
    founder: {
      name: 'David Joyce',
      title: 'Founder & Lead Electrician',
      photo: '/images/stephen.png',
      description: 'David has over 18 years of hands-on electrical experience and personally oversees every solar install for quality and safety.',
      quote: 'Our goal is simple: deliver solar installations you can trust for decades to come.',
      experience: '18+ years'
    },
    certifications: [
      { name: 'SEAI Registered', verified: true },
      { name: 'RECI Certified', verified: true },
      { name: 'Fully Insured', verified: true },
      { name: '18+ Years\' Experience', verified: true }
    ],
    testimonials: [
      {
        name: "Emer Bowens",
        location: "Galway",
        text: "Voltflo inc. recently completed work at our house in Galway. Stephen and his team installed solar panels and an electric car charger. Stephen was extremely professional in all our dealings with him and provided a fast and efficient service. I would highly recommend Voltflo inc. to friends and family.",
        rating: 5,
      },
      {
        name: "Cliona Murphy",
        location: "Co. Galway",
        text: "Stephen and his lads did a brilliant job on installing solar panels in our house in Co. Galway recently. Very professional and helpful from the start. Would definitely recommend Stephen for any solar jobs.",
        rating: 5,
      },
    ],

    equipment: {
      solarPanels: [
        {
          id: 'jinko',
            name: 'JinkoSolar 440W',
            tier: 'Tier 1',
            warranty: '25-Year Performance',
            efficiency: '21.4%',
            priceAdjustment: 0,
            recommended: true,
            reason: 'Higher efficiency, premium pricing',
            datasheet: '/pdf/jinko_panel.pdf'
        }
      ],
      inverters: [
        {
          id: 'sigenergy',
          name: 'Sigenergy Inverter',
          tier: 'Premium',
          warranty: '10-Year Product',
          efficiency: '98.4%',
          priceAdjustment: 0,
          recommended: true,
          reason: 'Industry-leading reliability',
          datasheet: '/pdf/sig_inverter.pdf'
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
          datasheet: '/pdf/sig_battery.pdf'
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
          features: ['Solar integration', 'Smart scheduling', 'Load balancing', 'Mobile app control']
        }
      ]
    },
    pricing: {
      basePanelThreshold: 8,
      baseSystemPrice: 7550,
      additionalPanelCost: 350,
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
      company_name: 'Voltflo inc.',
      company_tagline: 'SEAI Registered Solar Installation Company',
      support_email: 'solarpotential@voltflo.com',
      phone_number: '(085) 834-9461',
      phone_number_clean: '0858349461',
      website_url: 'https://staging.installer.voltflo.com',
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
  
  jrenergy: {
    slug: 'jrenergy',
    name: 'JR Energy',
    website: 'https://jrenergy.ie',
    email: 'info@jrenergy.ie',
    phone: '(085) 834-9461',
    logo: '/images/jrenergy.png',
    description: "Ireland's trusted SEAI-registered solar installer, delivering reliable energy solutions for your home and future.",
    colors: { primary: '#059669', secondary: '#1d4ed8', accent: '#f59e0b' },
    social: {
      instagram: 'https://www.instagram.com/jrenergy.ie/',
      facebook: 'https://www.facebook.com/Joyceelectrical/',
      linkedin: 'https://www.linkedin.com/in/stephen-joyce-043153101/'
    },
    reviews: {
      rating: 5.0,
      count: 86,
      url: 'https://www.google.com/search?sca_esv=ab8db249d156b33c&hl=en-JP&sxsrf=AE3TifN-LagWmY0BkQKqe6y4gRwkF9q-4w:1754465366632&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E1DcjeChbzMgLGM6ManPei2PXu1b61LopSKgAp-FdJo3Mt3YlmA3eYYPA8JQF096dn7HtXMKFSupKoa89jYCkKKM4kFcZhEl8CkbT2W4YzaC5J-gXw%3D%3D&q=JREnergy+Electrical+and+Solar+Reviews&sa=X&ved=2ahUKEwiAq8vn1PWOAxUXrlYBHZAHM8sQ0bkNegQIIhAE&biw=1512&bih=738&dpr=2',
      warranty: '5-Year Workmanship Warranty'
    },
    certifications: [
      { name: 'SEAI Registered', verified: true },
      { name: 'RECI Certified', verified: true },
      { name: 'Fully Insured', verified: true },
      { name: '18+ Years\' Experience', verified: true }
    ],
    founder: {
      name: 'Stephen Joyce',
      title: 'Founder & Lead Electrician',
      photo: '/images/stephen.png',
      description: 'Stephen has over 18 years of hands-on electrical experience and personally oversees every solar install for quality and safety.',
      quote: 'Our goal is simple: deliver solar installations you can trust for decades to come.',
      experience: '18+ years'
    },
    testimonials: [
      {
        name: "Emer Bowens",
        location: "Galway",
        text: "JR Energy recently completed work at our house in Galway. Stephen and his team installed solar panels and an electric car charger. Stephen was extremely professional in all our dealings with him and provided a fast and efficient service. I would highly recommend JR Energy to friends and family.",
        rating: 5,
      },
      {
        name: "Cliona Murphy",
        location: "Co. Galway",
        text: "Stephen and his lads did a brilliant job on installing solar panels in our house in Co. Galway recently. Very professional and helpful from the start. Would definitely recommend Stephen for any solar jobs.",
        rating: 5,
      },
    ],
    equipment: {} as any,
    pricing: {} as any,
    energy: {} as any,
    emailBranding: {
      company_name: 'JR Energy',
      company_tagline: 'SEAI Registered Solar Installation Company',
      support_email: 'solarpotential@voltflo.com',
      phone_number: '(085) 834-9461',
      phone_number_clean: '0858349461',
      website_url: 'https://staging.installer.voltflo.com',
      backend_url: 'https://staging-installerflow.voltflo.com',
      logo_url: null,
      platform_name: 'Voltflo',
      report_primary_color: '#10b981',
      report_secondary_color: '#2563eb',
      call_primary_color: '#28a745',
      call_secondary_color: '#007bff',
      background_gradient: 'linear-gradient(90deg,#f0fdf4,#eff6ff)',
      calendar_button_color: '#4285f4',
    }
  }
};

// Simple inheritance for brands that reuse core config from voltflo
['jrenergy'].forEach(slug => {
  const base = brands.voltflo;
  const target = brands[slug];
  brands[slug] = {
    ...target,
    equipment: target.equipment && Object.keys(target.equipment).length ? target.equipment : base.equipment,
    pricing: target.pricing && Object.keys(target.pricing).length ? target.pricing : base.pricing,
    energy: target.energy && Object.keys(target.energy).length ? target.energy : base.energy,
    // Inherit additional properties if not defined
    description: target.description || base.description,
    certifications: target.certifications || base.certifications,
    testimonials: target.testimonials || base.testimonials,
    founder: target.founder || base.founder,
  };
});

export function resolveBrandSlugFromHostname(host?: string): string {
  if (!host) return 'voltflo';
  const h = host.toLowerCase();
  if (h.includes('jrenergy')) return 'jrenergy';
  return 'voltflo';
}

export function getBranding(hostname?: string): Branding {
  const slug = resolveBrandSlugFromHostname(hostname || (typeof window !== 'undefined' ? window.location.hostname : undefined));
  return brands[slug] || brands.voltflo;
}

export function listBrands(): Branding[] { return Object.values(brands); }

// Convenience helpers
export function getPrimaryColor() { return getBranding().colors.primary }
export function getSecondaryColor() { return getBranding().colors.secondary }
export function getAccentColor() { return getBranding().colors.accent }
export function getSupportEmail() { return getBranding().email }
export function getEmailBranding(hostname?: string): EmailBranding { 
  return getBranding(hostname).emailBranding 
}
