// Solar Plan Data Storage Utilities

// Types for the personalise answers data
export interface PersonaliseAnswers {
  "time-of-use"?: string;
  "motivation"?: string[];
  billAmount?: string;
}

// Types for the solar plan data structure
export interface SolarPlanData {
  systemConfiguration: {
    basePanelCount: number;
    totalPanelCount: number;
    selectedSolarPanel: any;
    selectedInverter: any;
    selectedBattery: any;
    selectedEVCharger?: any;
    includeBattery: boolean;
    batteryCount?: number;
    includeEVCharger: boolean;
    includeEVChargerEquipment?: boolean;
    includeHeatPump: boolean;
    powerOutageBackup: boolean;
    evPanelsNeeded: number;
    heatPumpPanelsNeeded: number;
  };
  systemSpecs: {
    systemSizeKwp: number;
    annualPVGenerated: number;
    perPanelGeneration: number;
    annualBillAmount: number;
  };
  costs: {
    systemBaseCost: number;
    batteryCost: number;
    evChargerCost: number;
    heatPumpAdditionalCost: number;
    totalSystemCost: number;
    seaiGrant: number;
    evChargerGrant?: number;
    totalGrants?: number;
    finalPrice: number;
    monthlyFinancing: number;
  };
  savings: {
    solarAnnualSavings: number;
    batteryAnnualSavings: number;
    evChargerSavings: number;
    heatPumpSavings: number;
    totalAnnualSavings: number;
    paybackPeriod: number;
    billOffset: number;
    gridIndependence: number;
    annualBillReduction: number;
    newAnnualBill: number;
  };
  equipment: {
    solarPanel: any;
    inverter: any;
    battery: any | null;
    evCharger: any | null;
    heatPump: any | null;
  };
  propertyImpact: {
    berImprovement: string;
    propertyValueUplift: number;
    valueUpliftPercentage: string;
  };
  personalise_answers?: PersonaliseAnswers | null;
  metadata: {
    planCreatedAt: string;
    planVersion: string;
    businessProposal: any | null;
  };
  userInfo?: {
    fullName: string;
    email: string;
    agreeToTerms: boolean;
    submittedAt: string;
  };
}

export interface UserContactInfo {
  fullName: string;
  email: string;
  submittedAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  SOLAR_PLAN: 'solar_plan_data',
  USER_CONTACT: 'user_contact_info',
} as const;

/**
 * Save solar plan data to localStorage
 */
export const saveSolarPlanData = (planData: SolarPlanData): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.SOLAR_PLAN, JSON.stringify(planData));
    console.log('Solar plan data saved successfully:', planData);
    return true;
  } catch (error) {
    console.error('Error saving solar plan data:', error);
    return false;
  }
};

/**
 * Retrieve solar plan data from localStorage
 */
export const getSolarPlanData = (): SolarPlanData | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.SOLAR_PLAN);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error retrieving solar plan data:', error);
    return null;
  }
};

/**
 * Save user contact information to localStorage
 */
export const saveUserContactInfo = (userInfo: UserContactInfo): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_CONTACT, JSON.stringify(userInfo));
    console.log('User contact info saved successfully:', userInfo);
    return true;
  } catch (error) {
    console.error('Error saving user contact info:', error);
    return false;
  }
};

/**
 * Retrieve user contact information from localStorage
 */
export const getUserContactInfo = (): UserContactInfo | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.USER_CONTACT);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error retrieving user contact info:', error);
    return null;
  }
};

/**
 * Update existing solar plan data with user information
 */
export const addUserInfoToPlan = (userInfo: Omit<UserContactInfo, 'submittedAt'> & { agreeToTerms: boolean }): boolean => {
  try {
    const existingPlan = getSolarPlanData();
    if (!existingPlan) {
      console.error('No existing plan data found');
      return false;
    }

    const updatedPlan: SolarPlanData = {
      ...existingPlan,
      userInfo: {
        ...userInfo,
        submittedAt: new Date().toISOString(),
      },
    };

    return saveSolarPlanData(updatedPlan);
  } catch (error) {
    console.error('Error adding user info to plan:', error);
    return false;
  }
};

/**
 * Clear all solar plan data from localStorage
 */
export const clearSolarPlanData = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SOLAR_PLAN);
    localStorage.removeItem(STORAGE_KEYS.USER_CONTACT);
    console.log('Solar plan data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing solar plan data:', error);
    return false;
  }
};

/**
 * Check if solar plan data exists in localStorage
 */
export const hasSolarPlanData = (): boolean => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SOLAR_PLAN);
    return data !== null && data !== undefined;
  } catch (error) {
    console.error('Error checking for solar plan data:', error);
    return false;
  }
};

/**
 * Get a summary of the solar plan for quick display
 */
export const getSolarPlanSummary = () => {
  const planData = getSolarPlanData();
  if (!planData) return null;

  return {
    totalPanels: planData.systemConfiguration.totalPanelCount,
    systemSize: `${planData.systemSpecs.systemSizeKwp.toFixed(1)}kWp`,
    finalPrice: planData.costs.finalPrice,
    annualSavings: planData.savings.totalAnnualSavings,
    paybackPeriod: planData.savings.paybackPeriod,
    includeBattery: planData.systemConfiguration.includeBattery,
    includeEVCharger: planData.systemConfiguration.includeEVCharger,
    includeHeatPump: planData.systemConfiguration.includeHeatPump,
    planCreatedAt: planData.metadata.planCreatedAt,
    hasUserInfo: !!planData.userInfo,
  };
};

/**
 * Export plan data as a formatted object for PDF generation or API calls
 */
export const exportPlanData = () => {
  const planData = getSolarPlanData();
  if (!planData) return null;

  return {
    // Basic system info
    systemSize: `${planData.systemSpecs.systemSizeKwp.toFixed(1)}kWp`,
    panelCount: planData.systemConfiguration.totalPanelCount,
    
    // Equipment
    solarPanel: planData.equipment.solarPanel.name,
    inverter: planData.equipment.inverter.name,
    battery: planData.systemConfiguration.includeBattery ? planData.equipment.battery?.name : 'None',
    
    // Costs
    systemCost: planData.costs.totalSystemCost,
    seaiGrant: planData.costs.seaiGrant,
    finalPrice: planData.costs.finalPrice,
    monthlyFinancing: planData.costs.monthlyFinancing,
    
    // Savings
    annualSavings: planData.savings.totalAnnualSavings,
    paybackPeriod: `${planData.savings.paybackPeriod} years`,
    billReduction: `${planData.savings.billOffset}%`,
    
    // User info (if available)
    customerName: planData.userInfo?.fullName || null,
    customerEmail: planData.userInfo?.email || null,
    
    // Metadata
    planDate: planData.metadata.planCreatedAt,
    planVersion: planData.metadata.planVersion,
  };
}; 