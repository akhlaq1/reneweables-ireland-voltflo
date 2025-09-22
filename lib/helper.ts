
// 1. Tier dictionary
export const tierData = [
    {
      tier: "Tier 1 – Competitive Urban",
      counties: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
      solar: [1500, 1650],
      battery: [550, 650],
      ev: [1200, 1400],
    },
    {
      tier: "Tier 2 – Standard Regional",
      counties: ["Kildare", "Meath", "Wicklow", "Louth", "Clare", "Laois", "Kilkenny", "Tipperary", "Wexford"],
      solar: [1650, 1750],
      battery: [600, 700],
      ev: [1300, 1450],
    },
    {
      tier: "Tier 3 – Rural West/Midlands",
      counties: ["Mayo", "Roscommon", "Offaly", "Westmeath", "Longford", "Cavan"],
      solar: [1700, 1850],
      battery: [650, 750],
      ev: [1300, 1500],
    },
    {
      tier: "Tier 4 – Remote/Low-Coverage",
      counties: ["Donegal", "Leitrim", "Sligo", "Monaghan", "Kerry", "Carlow"],
      solar: [1800, 2000],
      battery: [700, 800],
      ev: [1400, 1600],
    },
];

// 2. Helper to get county from address
export function extractCounty(address: string): string | null {
    // This is a simple heuristic; you may want to improve it for your address format
    for (const tier of tierData) {
      for (const county of tier.counties) {
        if (address.toLowerCase().includes(county.replace(/\\(.*\\)/, '').trim().toLowerCase())) {
          return county;
        }
      }
    }
    return null;
  }
  
// 3. Helper to get tier by county
export function getTierByCounty(county: string) {
    return tierData.find(tier => tier.counties.some(c => c.toLowerCase() === county.toLowerCase()));
  }
  
// 4. Helper to get median
export function median([min, max]: [number, number]) {
    return Math.round((min + max) / 2);
  }
