"use client"

import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { ViewPotentialScreen } from "@/components/view-potential-screen"
import { useEffect, useState, useMemo } from "react"
import { saveSolarPlanData } from "@/lib/solar-plan-storage"
import {
  getBranding,
  calculateSystemBaseCost,
  getSEAIGrant,
  calculateBatteryPrice,
  EquipmentOption,
  Branding,
  resolveBrandSlugFromHostname
} from "@/lib/branding"
import companyService from "../api/company"

export default function SnapshotPage() {
  const router = useRouter()
  const [panelCount, setPanelCount] = useState<number>(0)
  const [annualSavings, setAnnualSavings] = useState<number>(0)
  const [treesEquivalent, setTreesEquivalent] = useState<number>(0)
  const [annualGeneration, setAnnualGeneration] = useState<number>(0)
  const [coveragePercentage, setCoveragePercentage] = useState<number>(0)
  const [systemSizeKw, setSystemSizeKw] = useState<number>(0)
  const [averageConsumption, setAverageConsumption] = useState<number>(4200)


  // Function to calculate annual savings
  const calculateAnnualSavings = (annualGeneration: number): number => {
    const gridRate = 0.35
    const exportRate = 0.2

    const selfConsumption = annualGeneration * 0.3 * gridRate
    const exportRevenue = annualGeneration * 0.7 * exportRate

    return Math.round(selfConsumption + exportRevenue)
  }


  // Calculate KPI values
  useEffect(() => {
    if (typeof window === 'undefined') return

    const businessProposal = localStorage.getItem("business_proposal")
    const personaliseAnswers = localStorage.getItem("personalise_answers")

    if (businessProposal) {
      const parsedBusinessProposal = JSON.parse(businessProposal)

      // Set panel wattage from environment variable
      const panelWattageValue = parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.44')
      // setPanelWattage(panelWattageValue)

      // Calculate system size in panels using the panel wattage
      const systemSizeKwValue = parseFloat((parseFloat(parsedBusinessProposal?.system_size || '0')).toFixed(1))

      const panelCountNum = Math.round(systemSizeKwValue / panelWattageValue)
      setPanelCount(panelCountNum)
      setSystemSizeKw(parseFloat((panelCountNum * panelWattageValue).toFixed(1))) // Convert to kW

      // Calculate trees equivalent from CO2 savings
      const trees = parseFloat(parsedBusinessProposal?.trees_planted || '0')
      setTreesEquivalent(trees)

      // Calculate annual generation from monthly forecast
      const annualGen = parsedBusinessProposal?.monthly_forecast?.reduce(
        (total: number, forecast: any) => total + (forecast?.monthly_sum || 0), 0
      ) || 0
      setAnnualGeneration(Math.round(annualGen))

      // Calculate annual savings using custom function
      const calculatedSavings = calculateAnnualSavings(annualGen)
      setAnnualSavings(calculatedSavings)

      // Calculate per panel generation for plan calculations
      // if (panelCountNum > 0 && annualGen > 0) {
      //   const perPanelGen = Math.round(annualGen / panelCountNum)
      //   setPerPanelGeneration(perPanelGen)
      // }

      // Calculate coverage percentage using dynamic average consumption
      let averageConsumptionValue = 4200 // Default fallback value
      if (personaliseAnswers) {
        const parsedPersonaliseAnswers = JSON.parse(personaliseAnswers)
        const billAmount = parseFloat(parsedPersonaliseAnswers?.billAmount || '0')
        if (billAmount > 0) {
          const annual_bill = billAmount * 12
          averageConsumptionValue = annual_bill / 0.35
          // setAnnualBillAmount(annual_bill) // Set annual bill amount for plan calculations
        }
      }
      setAverageConsumption(Math.round(averageConsumptionValue))
      const coverage = annualGen > 0 ? Math.min(Math.round((annualGen / averageConsumptionValue) * 100), 100) : 0
      setCoveragePercentage(coverage)
    }
  }, [])

  const handleContinue = () => {
    router.push("/personalise")
  }


  const handleBookCall = async () => {
    // console.log('Book Call clicked - performing fresh calculations...');

    try {
      // 1. Get fresh company/branding data
      let brandingData: Branding;
      let equipmentOptions: any = {};

      try {
        const payload = {
          "sub_domain": resolveBrandSlugFromHostname(typeof window !== "undefined" ? window.location.hostname : "") || "caldorsolar",
          "required_fields": ["equipment", "pricing", "energy", "email"]
        };
        
        const response = await companyService.getCompanyDatabySubDomain(payload);
        if (response.data) {
          brandingData = response.data.data;
          equipmentOptions = response.data.data.equipment || {};
          // console.log('Loaded fresh company data:', brandingData);
        } else {
          throw new Error('No company data received');
        }
      } catch (error) {
        console.log('Falling back to default branding due to error:', error);
        brandingData = await getBranding();
        equipmentOptions = brandingData.equipment || {};
      }

      // 2. Get business proposal and personalise data from localStorage
      const businessProposal = localStorage.getItem("business_proposal");
      const personaliseAnswers = localStorage.getItem("personalise_answers");
      
      if (!businessProposal) {
        // console.error('No business proposal found in localStorage');
        router.push("/call-page");
        return;
      }

      const parsedBusinessProposal = JSON.parse(businessProposal);
      let parsedPersonaliseAnswers = null;
      if (personaliseAnswers) {
        parsedPersonaliseAnswers = JSON.parse(personaliseAnswers);
      }

      // 3. Calculate system specifications
      const panelWattageValue = parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.44');
      const systemSizeKwValue = parseFloat(parsedBusinessProposal?.system_size || '0');
      const calculatedPanelCount = Math.round(systemSizeKwValue / panelWattageValue);
      
      // Calculate annual generation from monthly forecast
      const calculatedAnnualGeneration = parsedBusinessProposal?.monthly_forecast?.reduce(
        (total: number, forecast: any) => total + (forecast?.monthly_sum || 0), 0
      ) || 0;

      // Calculate per panel generation
      const calculatedPerPanelGeneration = calculatedPanelCount > 0 ? Math.round(calculatedAnnualGeneration / calculatedPanelCount) : 410;

      // Calculate annual bill amount
      let calculatedAnnualBillAmount = 2200; // Default
      if (parsedPersonaliseAnswers?.billAmount) {
        const monthlyBill = parseFloat(parsedPersonaliseAnswers.billAmount)
        const calculatedAnnualBill = Math.round(monthlyBill * 12)
        calculatedAnnualBillAmount = calculatedAnnualBill;
      }

      // 4. Set equipment selections (prioritize recommended options)
      // console.log("Equipment options available:", equipmentOptions);
      
      // For solar panels, get the one with recommended == true (if none has true then get the first one in the list)
      let calculatedSelectedSolarPanel = null;
      if (equipmentOptions.solarPanels && equipmentOptions.solarPanels.length > 0) {
        const recommendedSolarPanel = equipmentOptions.solarPanels.find((panel: any) => panel.recommended === true);
        if (recommendedSolarPanel) {
          calculatedSelectedSolarPanel = recommendedSolarPanel;
          // console.log("Selected recommended solar panel:", recommendedSolarPanel.name);
        } else {
          calculatedSelectedSolarPanel = equipmentOptions.solarPanels[0];
          // console.log("Selected first solar panel:", equipmentOptions.solarPanels[0].name);
        }
      }

      // For inverters, get the one with recommended == true (if none has true then get the first one in the list)
      let calculatedSelectedInverter = null;
      if (equipmentOptions.inverters && equipmentOptions.inverters.length > 0) {
        const recommendedInverter = equipmentOptions.inverters.find((inverter: any) => inverter.recommended === true);
        if (recommendedInverter) {
          calculatedSelectedInverter = recommendedInverter;
          // console.log("Selected recommended inverter:", recommendedInverter.name);
        } else {
          calculatedSelectedInverter = equipmentOptions.inverters[0];
          // console.log("Selected first inverter:", equipmentOptions.inverters[0].name);
        }
      }

      // For battery, get the compatibleBatteries of selected inverter, then in equipmentOptions.batteries list get the one with recommended == true (if none has true then get the first one in the list)
      let calculatedSelectedBattery = null;
      if (calculatedSelectedInverter && calculatedSelectedInverter.compatibleBatteries && equipmentOptions.batteries) {
        const compatibleBatteryIds = calculatedSelectedInverter.compatibleBatteries;
        // console.log("Compatible battery IDs for inverter:", compatibleBatteryIds);
        
        // Filter available batteries to only compatible ones
        const compatibleBatteries = equipmentOptions.batteries.filter((battery: any) => 
          compatibleBatteryIds.includes(battery.id)
        );
        // console.log("Compatible batteries found:", compatibleBatteries);
        
        if (compatibleBatteries.length > 0) {
          // First try to find a recommended battery
          const recommendedBattery = compatibleBatteries.find((battery: any) => battery.recommended === true);
          if (recommendedBattery) {
            calculatedSelectedBattery = recommendedBattery;
            // console.log("Selected recommended compatible battery:", recommendedBattery.name);
          } else {
            // If no recommended battery, use the first compatible one
            calculatedSelectedBattery = compatibleBatteries[0];
            // console.log("Selected first compatible battery:", compatibleBatteries[0].name);
          } 
        } else {
          // If no compatible batteries found, fall back to first available battery
          calculatedSelectedBattery = equipmentOptions.batteries[0] || null;
          // console.log("No compatible batteries found, using first available battery");
        }
      } else {
        // If no inverter selected or no compatibility info, use first available battery
        calculatedSelectedBattery = equipmentOptions.batteries?.[0] || null;
        // console.log("No inverter compatibility info, using first available battery");
      }
      
      // console.log("Final selected battery:", calculatedSelectedBattery ? calculatedSelectedBattery : "None");
      const calculatedSelectedEVCharger = equipmentOptions.evChargers?.[0] || null;

      // 5. Configuration (default to basic solar system for snapshot)
      const calculatedIncludeBattery = false;
      const calculatedBatteryCount = 1;
      const calculatedIncludeEVCharger = false;
      const calculatedIncludeEVChargerEquipment = false;
      const calculatedIncludeHeatPump = false;
      const calculatedPowerOutageBackup = false;
      const calculatedIsEligibleForSEAIGrant = true;

      // 6. Calculate costs and savings
      // console.log("\n BEFORE ENREGY:",brandingData)
      const gridRate = brandingData.energy?.gridRateDay || 0.35;
      const exportRate = brandingData.energy?.exportRate || 0.20;

      // Annual PV Generation
      const calculatedAnnualPVGeneration = Math.round(calculatedPanelCount * calculatedPerPanelGeneration);

      // Solar-only savings (30% self-use / 70% export)
      const calculatedSolarAnnualSavings = Math.round(calculatedAnnualPVGeneration * (0.30 * gridRate + 0.70 * exportRate));

      // For snapshot (solar only), total savings = solar savings
      const calculatedTotalAnnualSavings = calculatedSolarAnnualSavings;
      const calculatedBatteryAnnualSavings = 0;
      const calculatedBatteryNightChargeSavings = 0;

      // System cost calculations
      let calculatedSystemBaseCost = 0;
      let calculatedBatteryCost = 0;
      let calculatedSystemCombinedCost = 0;
      
      if (calculatedSelectedSolarPanel && calculatedSelectedInverter && brandingData?.pricing) {
        calculatedSystemCombinedCost = calculateSystemBaseCost(
          calculatedPanelCount,
          calculatedSelectedSolarPanel,
          calculatedSelectedInverter,
          brandingData.pricing,
          calculatedIncludeBattery,
          calculatedSelectedBattery || undefined,
        );
        
        if (calculatedIncludeBattery && calculatedSelectedBattery) {
          calculatedBatteryCost = calculateBatteryPrice(calculatedSelectedBattery, calculatedSelectedInverter, calculatedPanelCount) * calculatedBatteryCount;
        }
        
        calculatedSystemBaseCost = calculatedSystemCombinedCost - calculatedBatteryCost;
      }

      const calculatedEVChargerCost = calculatedIncludeEVChargerEquipment ? (calculatedSelectedEVCharger?.price || 0) : 0;
      const calculatedTotalSystemCost = calculatedSystemBaseCost + calculatedBatteryCost + calculatedEVChargerCost;

      // SEAI Grant calculation
      const calculatedSeaiGrant = calculatedIsEligibleForSEAIGrant && brandingData?.pricing ? 
        getSEAIGrant(calculatedPanelCount, brandingData.pricing) : 0;
      
      const calculatedEVChargerGrant = calculatedIncludeEVChargerEquipment ? (calculatedSelectedEVCharger?.grant || 0) : 0;
      const calculatedTotalGrants = calculatedSeaiGrant + calculatedEVChargerGrant;
      const calculatedFinalPrice = calculatedTotalSystemCost - calculatedTotalGrants;

      // Payback calculation
      const calculatedPaybackSystemCost = calculatedSystemBaseCost + calculatedBatteryCost;
      const calculatedPaybackGrants = calculatedSeaiGrant;
      const calculatedPaybackPrice = calculatedPaybackSystemCost - calculatedPaybackGrants;
      const calculatedPaybackPeriod = calculatedTotalAnnualSavings > 0 ? 
        (calculatedPaybackPrice / calculatedTotalAnnualSavings).toFixed(1) : '0.0';

      const calculatedBillOffset = calculatedIncludeBattery ? 94 : 65;
      const calculatedGridIndependence = calculatedBatteryCount >= 2 ? 95 : (calculatedIncludeBattery ? 90 : 30);

      // 7. Create plan data with all fresh calculations
      const planData = {
        // System Configuration
        systemConfiguration: {
          basePanelCount: calculatedPanelCount,
          totalPanelCount: calculatedPanelCount,
          selectedSolarPanel: calculatedSelectedSolarPanel,
          selectedInverter: calculatedSelectedInverter,
          selectedBattery: calculatedSelectedBattery,
          selectedEVCharger: calculatedSelectedEVCharger,
          includeBattery: calculatedIncludeBattery,
          batteryCount: calculatedBatteryCount,
          includeEVCharger: calculatedIncludeEVCharger,
          includeEVChargerEquipment: calculatedIncludeEVChargerEquipment,
          includeHeatPump: calculatedIncludeHeatPump,
          powerOutageBackup: calculatedPowerOutageBackup,
          evPanelsNeeded: calculatedIncludeEVCharger ? 3 : 0,
          heatPumpPanelsNeeded: calculatedIncludeHeatPump ? 3 : 0,
        },

        // System Specifications
        systemSpecs: {
          systemSizeKwp: (calculatedPanelCount * panelWattageValue),
          annualPVGenerated: calculatedAnnualPVGeneration,
          perPanelGeneration: calculatedPerPanelGeneration,
          originalBusinessProposalPanelCount: calculatedPanelCount,
          annualBillAmount: calculatedAnnualBillAmount,
          customAnnualBill: calculatedAnnualBillAmount,
        },

        // Cost Breakdown
        costs: {
          systemBaseCost: calculatedSystemBaseCost,
          batteryCost: calculatedBatteryCost,
          evChargerCost: calculatedEVChargerCost,
          heatPumpAdditionalCost: calculatedIncludeHeatPump ? 800 : 0,
          totalSystemCost: calculatedTotalSystemCost,
          seaiGrant: calculatedSeaiGrant,
          evChargerGrant: calculatedEVChargerGrant,
          totalGrants: calculatedTotalGrants,
          finalPrice: calculatedFinalPrice,
          monthlyFinancing: Math.round(calculatedFinalPrice / 84),
        },

        // Savings Breakdown
        savings: {
          solarAnnualSavings: calculatedSolarAnnualSavings,
          batteryAnnualSavings: calculatedBatteryAnnualSavings,
          batteryNightChargeSavings: calculatedBatteryNightChargeSavings,
          evChargerSavings: calculatedIncludeEVCharger ? 320 : 0,
          heatPumpSavings: calculatedIncludeHeatPump ? 180 : 0,
          totalAnnualSavings: calculatedTotalAnnualSavings,
          paybackPeriod: parseFloat(calculatedPaybackPeriod),
          billOffset: calculatedBillOffset,
          gridIndependence: calculatedGridIndependence,
          annualBillReduction: Math.round(calculatedAnnualBillAmount * (calculatedBillOffset / 100)),
          newAnnualBill: Math.round(calculatedAnnualBillAmount * (1 - calculatedBillOffset / 100)),
        },

        // Equipment Details
        equipment: {
          solarPanel: {
            ...calculatedSelectedSolarPanel,
            quantity: calculatedPanelCount,
            totalWattage: calculatedPanelCount * 440,
          },
          inverter: calculatedSelectedInverter,
          battery: calculatedIncludeBattery ? {
            ...calculatedSelectedBattery,
            quantity: calculatedBatteryCount,
            totalCapacity: (calculatedSelectedBattery?.capacity || 0) * calculatedBatteryCount,
          } : null,
          evCharger: calculatedIncludeEVChargerEquipment ? {
            ...calculatedSelectedEVCharger,
            included: true,
            additionalPanels: calculatedIncludeEVCharger ? 3 : 0,
          } : null,
          heatPump: calculatedIncludeHeatPump ? {
            included: true,
            estimatedCost: 800,
            additionalPanels: calculatedIncludeHeatPump ? 3 : 0,
          } : null,
        },

        // Property Impact
        propertyImpact: {
          berImprovement: "D2 → C1",
          propertyValueUplift: 9000,
          valueUpliftPercentage: "4-6%",
        },

        // Personalise Answers
        personalise_answers: parsedPersonaliseAnswers,

        // Metadata
        metadata: {
          planCreatedAt: new Date().toISOString(),
          planVersion: "1.0",
          businessProposal: {
            systemSize: (calculatedPanelCount * panelWattageValue).toFixed(1),
            electricityBillSavings: parsedBusinessProposal.electricity_bill_savings,
            monthlyPerformance: parsedBusinessProposal.monthly_performance,
          },
        }
      };

      // 8. Save the plan data
      saveSolarPlanData(planData);

      // 9. Navigate to call page
      router.push("/call-page");

    } catch (error) {
      console.error('Error in handleBookCall:', error);
      // Still navigate to call page even if there's an error
      router.push("/call-page");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader maxWidth="max-w-4xl" />
      <ViewPotentialScreen
        panelCount={panelCount}
        annualSolarKwh={annualGeneration}
        energyOffset={coveragePercentage}
        annualSavings={annualSavings}
        treesSaved={treesEquivalent}
        systemSizeKw={systemSizeKw}
        annualHomeKwh={averageConsumption} // Dynamic annual home consumption
        onContinue={handleContinue}
        onBookCall={handleBookCall}
      />
      <AvatarAssistant step={1} pageType="snapshot" />
    </div>
  )
}
