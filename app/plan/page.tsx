"use client"

import React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Sun,
  Battery,
  Zap,
  Home,
  TrendingUp,
  Info,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  Play,
  Moon,
  DollarSign,
  Pause,
  Minus,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Edit3,
  Calendar,
  Shield,
  Wrench,
  ArrowLeft,
  User,
  Mail,
  Settings,
  Clipboard,
  Clock,
  FileText,
  ThumbsUp,
  Phone,
  Eye,
  Flame,
  FileChartColumnIncreasing
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { saveSolarPlanData, addUserInfoToPlan, saveUserContactInfo } from "@/lib/solar-plan-storage"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import api from "@/app/api/api"
import { AppHeader } from "@/components/app-header"
import { ProgressBars } from "@/components/progress-bars"
import { setAppNavigation } from "@/lib/navigation-tracker"
import { getEmailBranding, getBranding, calculateSystemBaseCost, calculateSEAIGrant } from "@/lib/branding"

// Helper function to extract filename from datasheet path
const getDownloadFilename = (datasheetPath: string | undefined, fallbackName: string): string => {
  if (!datasheetPath) return fallbackName
  const parts = datasheetPath.split('/')
  return parts[parts.length - 1] || fallbackName
}

// Custom Dropdown Component for Desktop
interface CustomDropdownProps {
  value: string
  options: any[]
  onChange: (value: string) => void
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  placeholder?: string
  renderOption: (option: any) => React.ReactNode
  renderValue: (option: any) => React.ReactNode
}

const CustomDropdown = ({ value, options, onChange, isOpen, onOpen, onClose, placeholder, renderOption, renderValue }: CustomDropdownProps) => {
  const selectedOption = options.find(option => option.id === value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleToggle = () => {
    if (isOpen) {
      onClose()
    } else {
      onOpen()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full h-8 px-3 py-1 text-left text-xs bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none flex items-center justify-between"
        onClick={handleToggle}
      >
        <span className="truncate">
          {selectedOption ? renderValue(selectedOption) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                onChange(option.id)
                onClose()
              }}
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ProgressStep component for navigation
const ProgressStep = ({ icon: Icon, label, isActive = false }: { icon: any; label: string; isActive?: boolean }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mb-1 ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
      }`}
    >
      {isActive ? <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />}
    </div>
    <span className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>{label}</span>
  </div>
)

const energyUsagePatterns = [
  {
    id: "morning",
    label: "Morning Heavy (6am-12pm)",
    description: "Most energy use before noon",
    gridRelianceWithoutBattery: 60,
  },
  {
    id: "daytime",
    label: "Daytime Heavy (12pm-4pm)",
    description: "Most energy use during peak solar hours",
    gridRelianceWithoutBattery: 45,
  },
  {
    id: "evening",
    label: "Evening Heavy (4pm-10pm)",
    description: "Most energy use after work/school",
    gridRelianceWithoutBattery: 75,
  },
]

export default function SolarEnergyPlanner() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const branding = getBranding()
  
  // Equipment options from branding
  const solarPanelOptions = branding.equipment.solarPanels
  const inverterOptions = branding.equipment.inverters
  const batteryOptions = branding.equipment.batteries
  const evChargerOptions = branding.equipment.evChargers
  const [isLoading, setIsLoading] = useState(true)
  const [basePanelCount, setBasePanelCount] = useState(15)
  const [maxPanels, setMaxPanels] = useState(22) // Default to 22, will be loaded from localStorage
  const [selectedSolarPanel, setSelectedSolarPanel] = useState(solarPanelOptions[0])
  const [selectedInverter, setSelectedInverter] = useState(inverterOptions[0])
  const [selectedBattery, setSelectedBattery] = useState(batteryOptions[0])
  const [selectedEVCharger, setSelectedEVCharger] = useState(evChargerOptions[0])
  const [includeBattery, setIncludeBattery] = useState(false)
  const [batteryCount, setBatteryCount] = useState(1)
  const [includeEVCharger, setIncludeEVCharger] = useState(false)
  const [includeEVChargerEquipment, setIncludeEVChargerEquipment] = useState(false)
  const [includeHeatPump, setIncludeHeatPump] = useState(false)
  const [powerOutageBackup, setPowerOutageBackup] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [showSystemBreakdown, setShowSystemBreakdown] = useState(false)
  const [dailyFlowType, setDailyFlowType] = useState<"solar" | "solar-battery">("solar-battery")
  const [businessProposal, setBusinessProposal] = useState<any>(null)
  const [originalBusinessProposalPanelCount, setOriginalBusinessProposalPanelCount] = useState<number | null>(null)
  const [annualBillAmount, setAnnualBillAmount] = useState(2200) // Default fallback value
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [showSolarEquipment, setShowSolarEquipment] = useState(false)
  const [showBatteryEquipment, setShowBatteryEquipment] = useState(false)
  const [showEVChargerEquipment, setShowEVChargerEquipment] = useState(false)
  const [showBillEditor, setShowBillEditor] = useState(false)
  const [customAnnualBill, setCustomAnnualBill] = useState(2640)
  const [billInputMode, setBillInputMode] = useState<"annual" | "monthly">("annual")
  const [perPanelGeneration, setPerPanelGeneration] = useState(410) // Default fallback value
  
  // Custom dropdown states for desktop
  const [showSolarPanelDropdown, setShowSolarPanelDropdown] = useState(false)
  const [showInverterDropdown, setShowInverterDropdown] = useState(false)
  const [showBatteryDropdown, setShowBatteryDropdown] = useState(false)
  const [showEVChargerDropdown, setShowEVChargerDropdown] = useState(false)

  // Helper function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowSolarPanelDropdown(false)
    setShowInverterDropdown(false)
    setShowBatteryDropdown(false)
    setShowEVChargerDropdown(false)
  }

  // Helper functions to toggle dropdowns while closing others
  const toggleSolarPanelDropdown = () => {
    closeAllDropdowns()
    setShowSolarPanelDropdown(true)
  }

  const toggleInverterDropdown = () => {
    closeAllDropdowns()
    setShowInverterDropdown(true)
  }

  const toggleBatteryDropdown = () => {
    closeAllDropdowns()
    setShowBatteryDropdown(true)
  }

  const toggleEVChargerDropdown = () => {
    closeAllDropdowns()
    setShowEVChargerDropdown(true)
  }
  
  // Enhanced Savings Modal states
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [savingsModalTab, setSavingsModalTab] = useState("solarOnly")
  const [showMaths, setShowMaths] = useState<string | null>(null)
  const [showEnergyProfileModal, setShowEnergyProfileModal] = useState(false)
  const [energyProfile, setEnergyProfile] = useState("family")
  const [tempMonthlyBill, setTempMonthlyBill] = useState<string>("220")
  
  // SEAI Grant eligibility state
  const [isEligibleForSEAIGrant, setIsEligibleForSEAIGrant] = useState(true) // Default to true for backward compatibility

  // Sync modal tab with main battery toggle - prefer Battery Arbitrage when battery is on
  useEffect(() => {
    setSavingsModalTab(includeBattery ? "nightCharge" : "solarOnly")
  }, [includeBattery])

  // Function to save new bill amount
  const handleSaveBillAmount = () => {
    console.log('handleSaveBillAmount called with tempMonthlyBill:', tempMonthlyBill)
    const monthlyAmount = parseFloat(tempMonthlyBill) || 0
    const newAnnualBill = monthlyAmount * 12
    
    // Update localStorage - preserve existing personalise_answers and only update billAmount
    const storedPersonaliseAnswers = localStorage.getItem('personalise_answers')
    console.log('Current localStorage personalise_answers:', storedPersonaliseAnswers)
    let personaliseData: any = {}
    
    if (storedPersonaliseAnswers) {
      try {
        personaliseData = JSON.parse(storedPersonaliseAnswers)
        console.log('Parsed personaliseData:', personaliseData)
      } catch (error) {
        console.error('Error parsing personaliseAnswers from localStorage:', error)
        personaliseData = {}
      }
    }
    
    // Update only the billAmount property
    personaliseData.billAmount = tempMonthlyBill
    console.log('Updated personaliseData with new billAmount:', personaliseData)
    localStorage.setItem('personalise_answers', JSON.stringify(personaliseData))
    
    // Verify the save
    const verifyData = localStorage.getItem('personalise_answers')
    console.log('Verified localStorage after save:', verifyData)
    
    // Update state variables
    console.log('Updating annualBillAmount from', annualBillAmount, 'to', newAnnualBill)
    setAnnualBillAmount(newAnnualBill)
    setCustomAnnualBill(newAnnualBill)
    
    // Force a small delay to ensure state has updated
    setTimeout(() => {
      console.log('Forced update - annualBillAmount should now be:', newAnnualBill)
      console.log('Monthly bill should now be:', Math.round(newAnnualBill / 12))
    }, 100)
    
    console.log('State updated - new calculations should trigger')
    
    // Close the edit modal
    setShowEnergyProfileModal(false)
    
    // Determine energy profile based on monthly bill
    if (monthlyAmount <= 150) {
      setEnergyProfile("small")
    } else if (monthlyAmount <= 250) {
      setEnergyProfile("family")
    } else {
      setEnergyProfile("big")
    }
  }
  
  // Save Plan Dialog states
  const [showSavePlanDialog, setShowSavePlanDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [emailSubmissionSuccess, setEmailSubmissionSuccess] = useState(false)

  // Check localStorage for email submission success on component mount
  useEffect(() => {
    const savedEmailSuccess = localStorage.getItem('email_submission_success')
    const savedEmail = localStorage.getItem('submitted_email')
    if (savedEmailSuccess === 'true' && savedEmail) {
      setEmailSubmissionSuccess(true)
      setEmail(savedEmail)
    }
  }, [])

  // Calculate additional panels needed (for display and savings calculation only)
  const evPanelsNeeded = includeEVCharger ? 3 : 0
  const heatPumpPanelsNeeded = includeHeatPump ? 3 : 0
  
  const totalPanelCount = basePanelCount

  const recommendedPanelCount = businessProposal?.system_size ? Math.round(businessProposal.system_size / parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')) : 12

  // Calculations - Make system cost dynamic based on BASE panel count only (EV/heat pump don't affect price)
  const basePanelThreshold = branding.pricing.basePanelThreshold

  // Calculate actual annual PV generation dynamically based on current panel count
  // This scales with panel count changes to update savings correctly
  const annualPVGeneration = useMemo(() => {
    // Calculate based on current panel count and per-panel generation
    return Math.round(totalPanelCount * perPanelGeneration);
  }, [totalPanelCount, perPanelGeneration]);

  // Grid and export rates for savings calculation
  const gridRate = branding.energy.gridRateDay
  const exportRate = branding.energy.exportRate

  // Base solar-only savings (30% self-use / 70% export) retained for breakdown displays
  const solarAnnualSavings = useMemo(() => {
    const selfUseFraction = 0.30
    const exportFraction = 0.70
    return Math.round(annualPVGeneration * (selfUseFraction * gridRate + exportFraction * exportRate)) || 0
  }, [annualPVGeneration])

  console.log("Solar Annual Savings:", solarAnnualSavings)
  console.log("Annual PV Generation:", annualPVGeneration)

  // Determine scenario self-use/export fractions based on battery count
  const scenarioFractions = useMemo(() => {
    if (!includeBattery) return { selfUse: 0.30, export: 0.70 }
    if (batteryCount >= 2) return { selfUse: 0.90, export: 0.10 } // 2 batteries
    return { selfUse: 0.70, export: 0.30 } // 1 battery
  }, [includeBattery, batteryCount])

  // Calculate total savings for the active scenario
  const totalAnnualSavings = useMemo(() => {
    // If battery is enabled, use the Solar + Battery (Arbitrage) calculation
    if (includeBattery) {
      const solarExportIncome = annualPVGeneration * 1.0 * exportRate // 100% export at €0.20/kWh for arbitrage mode
      const batteryCapacity = (selectedBattery.capacity || 0) * batteryCount // Total kWh capacity
      const batteryArbitrageSavings = batteryCapacity * 0.9 * 315 * 0.27 // 90% efficiency, 315 cycles, €0.27 savings per kWh
      return Math.round(solarExportIncome + batteryArbitrageSavings) || 0
    }
    
    // For solar only, use the standard calculation
    const { selfUse, export: exportFrac } = scenarioFractions
    return Math.round(annualPVGeneration * (selfUse * gridRate + exportFrac * exportRate)) || 0
  }, [annualPVGeneration, scenarioFractions, gridRate, exportRate, includeBattery, batteryCount, selectedBattery.capacity])

  // Calculate Battery Night Charge Savings specifically for display in Battery Storage card
  const batteryNightChargeSavings = useMemo(() => {
    if (!includeBattery) return 0
    const batteryCapacity = (selectedBattery.capacity || 0) * batteryCount // Total kWh capacity
    const chargeEfficiency = 0.9 // 90% efficiency
    const nightRateDays = 315 // days per year when night rate is cheaper
    const nightRateSavings = 0.27 // €/kWh savings from night rate vs day rate
    return Math.round(batteryCapacity * chargeEfficiency * nightRateDays * nightRateSavings)
  }, [includeBattery, batteryCount, selectedBattery.capacity])

  // Additional savings attributable to batteries (difference vs solar-only base)
  const batteryAnnualSavings = useMemo(() => {
    if (!includeBattery) return 0
    
    // If night charge mode is selected, use the night charge calculation
    if (savingsModalTab === "nightCharge") {
      const solarExportIncome = annualPVGeneration * 1.0 * exportRate // 100% export for arbitrage mode
      return Math.round(solarExportIncome + batteryNightChargeSavings)
    }
    
    // For Battery Storage card display, always include night charge savings
    // This ensures the card shows the full potential of battery savings
    const hybridSavings = Math.max(0, totalAnnualSavings - solarAnnualSavings)
    return Math.max(hybridSavings, batteryNightChargeSavings)
  }, [includeBattery, totalAnnualSavings, solarAnnualSavings, savingsModalTab, annualPVGeneration, batteryCount, batteryNightChargeSavings])

  // Calculate system cost using the centralized function that supports both pricing methods
  const systemBaseCost = calculateSystemBaseCost(basePanelCount, selectedSolarPanel, selectedInverter, branding.pricing)
  const batteryCost = includeBattery ? (selectedBattery.price || 0) * batteryCount : 0
  // IMPORTANT: use full EV charger price here (not netPrice) so the grant is applied only once
  const evChargerCost = includeEVChargerEquipment ? (selectedEVCharger.price || 0) : 0

  const totalSystemCost = systemBaseCost + batteryCost + evChargerCost
  const seaiGrant = isEligibleForSEAIGrant ? calculateSEAIGrant(basePanelCount) : 0
  const evChargerGrant = includeEVChargerEquipment ? (selectedEVCharger.grant || 0) : 0
  const totalGrants = seaiGrant + evChargerGrant
  const finalPrice = totalSystemCost - totalGrants


  console.log("Per Panel Generation:", perPanelGeneration);

  // totalAnnualSavings now computed above using scenario fractions (0 batteries: 30/70, 1 battery: 70/30, 2 batteries: 90/10)

  const paybackPeriod = useMemo(() => 
    totalAnnualSavings > 0 ? (finalPrice / totalAnnualSavings).toFixed(1) : '0.0'
  , [finalPrice, totalAnnualSavings])
  const billOffset = includeBattery ? 94 : 65
  const gridIndependence = batteryCount >= 2 ? 95 : (includeBattery ? 90 : 30)
  const gridRelianceWithoutBattery = 70 // Changed from 65 to 70
  const gridRelianceWithBattery = 15

  // Enhanced Modal Calculations
  const dailyUsageKwh = useMemo(() => {
    const annualUsage = annualBillAmount / gridRate
    const result = Math.round(annualUsage / 365)
    console.log('dailyUsageKwh recalculated:', result, 'from annualBillAmount:', annualBillAmount)
    return result
  }, [annualBillAmount, gridRate])

  const monthlyBill = Math.round(annualBillAmount / 12)
  console.log('monthlyBill recalculated:', monthlyBill, 'from annualBillAmount:', annualBillAmount)
  console.log('Current display values - dailyUsageKwh:', dailyUsageKwh, 'monthlyBill:', monthlyBill, 'energyProfile:', energyProfile)

  // Update temp bill when monthly bill changes
  useEffect(() => {
    setTempMonthlyBill(monthlyBill.toString())
  }, [monthlyBill])

  const scenarios = useMemo(() => {
    const solarOnlyDirectSavings = Math.round(annualPVGeneration * 0.3 * gridRate)
    const solarOnlyExportIncome = Math.round(annualPVGeneration * 0.7 * exportRate)
    const solarOnlyTotal = solarOnlyDirectSavings + solarOnlyExportIncome

    const { selfUse, export: exportFrac } = scenarioFractions
    const hybridDirectSavings = Math.round(annualPVGeneration * selfUse * gridRate)
    const hybridExportIncome = Math.round(annualPVGeneration * exportFrac * exportRate)
    const hybridTotal = hybridDirectSavings + hybridExportIncome

    // Battery throughput calculation (kWh/year through battery)
    const batteryThroughput = includeBattery ? Math.round((selectedBattery.capacity || 0) * batteryCount * 300) : 0 // 300 cycles/year
    
    // Night rate arbitrage (for EV tariff users)
    const nightRateArbitrage = includeBattery ? Math.round((selectedBattery.capacity || 0) * batteryCount * 300 * (gridRate - branding.energy.gridRateNight)) : 0
    
    // Battery utilization percentage 
    const batteryUtilization = includeBattery && batteryThroughput > 0 ? 
      Math.round((batteryThroughput / ((selectedBattery.capacity || 0) * batteryCount * 365)) * 100) : 0

    // Energy independence calculation
    const annualUsageKwh = annualBillAmount / gridRate
    const solarSelfUse = annualPVGeneration * selfUse
    const energyIndependence = Math.min(95, Math.round((solarSelfUse / annualUsageKwh) * 100))
    console.log('scenarios recalculated - energyIndependence:', energyIndependence, 'from annualBillAmount:', annualBillAmount)

    return {
      solarOnly: {
        directSavings: solarOnlyDirectSavings,
        exportIncome: solarOnlyExportIncome,
        total: solarOnlyTotal,
        calculations: {
          generation: annualPVGeneration,
          baseSelfUseKWh: Math.round(annualPVGeneration * 0.3),
          exportKWh: Math.round(annualPVGeneration * 0.7),
        }
      },
      hybrid: {
        directSavings: hybridDirectSavings,
        exportIncome: hybridExportIncome,
        total: hybridTotal,
        nightRateArbitrage: nightRateArbitrage,
        batteryUtilization: batteryUtilization,
        energyIndependence: energyIndependence,
        calculations: {
          generation: annualPVGeneration,
          totalSelfUseKWh: Math.round(annualPVGeneration * selfUse),
          exportKWh: Math.round(annualPVGeneration * exportFrac),
          batteryThroughput: batteryThroughput,
        }
      }
    }
  }, [annualPVGeneration, scenarioFractions, gridRate, exportRate, includeBattery, selectedBattery, batteryCount, annualBillAmount])

  // EV and Heat Pump presence (inferred from includes)
  const hasEV = includeEVCharger
  const hasHeatPump = includeHeatPump

  // Panel sizing feedback
  const getPanelSizingMessage = () => {
    // Check if at maximum roof capacity
    if (totalPanelCount >= maxPanels) {
      return {
        type: "max_capacity",
        message: `Maximum panel count reached - Your roof can accommodate ${maxPanels} panels`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      }
    } else if (basePanelCount > recommendedPanelCount) {
      const extraPanels = basePanelCount - recommendedPanelCount
      return {
        type: "oversized",
        message: `+${extraPanels} panels above recommended - Future-ready for electric vehicles, heat pumps, or increased usage`,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      }
    } 
    // else if (basePanelCount < recommendedPanelCount) {
    //   const missingPanels = recommendedPanelCount - basePanelCount
    //   const coveragePercent = Math.round((basePanelCount / recommendedPanelCount) * 100)
    //   return {
    //     type: "undersized",
    //     message: `${missingPanels} panels below recommended - Will cover ~${coveragePercent}% of your typical energy needs`,
    //     color: "text-orange-600",
    //     bgColor: "bg-orange-50",
    //     borderColor: "border-orange-200",
    //   }
    // }
    return null
  }

  const panelSizingMessage = getPanelSizingMessage()

  // Dynamic recommendation text
  const getRecommendationText = () => {
    const features = []
    if (includeEVCharger) features.push("EV ready")
    if (includeHeatPump) features.push("heat pump ready")

    if (features.length === 0) {
      return `✓ ${recommendedPanelCount} panels recommended for your home size`
    }
    
    return `✓ ${recommendedPanelCount} panels recommended + ${features.join(", ")}`
  }

  // Animation scenes - now with two versions
  const solarOnlyScenes = [
    {
      title: "Daytime Generation (6am-6pm)",
      description: "Solar panels power your home directly, excess exported to grid",
      icon: Sun,
      color: "bg-yellow-500",
    },
    {
      title: "Peak Hours (4-7pm)",
      description: "Solar reduces, must import expensive peak-rate electricity",
      icon: Zap,
      color: "bg-orange-500",
    },
    {
      title: "Night (7pm-6am)",
      description: "Complete reliance on grid electricity at standard rates",
      icon: Home,
      color: "bg-gray-500",
    },
  ]

  const solarBatteryScenes = [
    {
      title: "Night Charging (2-6am)",
      description: "Low-cost night electricity charges your battery",
      icon: Moon,
      color: "bg-indigo-500",
    },
    {
      title: "Morning Generation (6-10am)",
      description: "Solar panels power home, excess charges battery",
      icon: Sun,
      color: "bg-yellow-500",
    },
    {
      title: "Midday Export (10am-4pm)",
      description: "Battery full, excess solar exported to grid for credits",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Evening Use (4-8pm)",
      description: "Battery powers home during expensive peak hours",
      icon: Battery,
      color: "bg-purple-500",
    },
    {
      title: "Night Cycle (8pm-2am)",
      description: "Battery continues powering home, minimal grid import",
      icon: Home,
      color: "bg-blue-500",
    },
  ]

  const currentScenes = dailyFlowType === "solar-battery" ? solarBatteryScenes : solarOnlyScenes

  // Auto-play animation
  useEffect(() => {
    if (isAnimationPlaying) {
      const interval = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= currentScenes.length - 1) {
            return 0
          }
          return prev + 1
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isAnimationPlaying, currentScenes.length])

  // Reset animation when switching types
  useEffect(() => {
    setAnimationStep(0)
    setIsAnimationPlaying(false)
  }, [dailyFlowType])

  // Add this effect after the existing useEffect hooks
  useEffect(() => {
    if (powerOutageBackup) {
      // Switch to hybrid inverter when backup is enabled
      const hybridInverter = inverterOptions.find((inv) => inv.id === "growatt")
      if (hybridInverter) {
        setSelectedInverter(hybridInverter)
      }
    } else {
      // Switch back to recommended inverter when backup is disabled
      const recommendedInverter = inverterOptions.find((inv) => inv.recommended)
      if (recommendedInverter) {
        setSelectedInverter(recommendedInverter)
      }
    }
  }, [powerOutageBackup])

  const toggleAnimation = () => {
    setIsAnimationPlaying(!isAnimationPlaying)
    if (!isAnimationPlaying) {
      setAnimationStep(0)
    }
  }

  // Optimized input handlers using useCallback to prevent unnecessary re-renders
  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (submitError) setSubmitError("");
  }, [submitError]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (submitError) setSubmitError("");
  }, [submitError]);

  // Function to save all plan data to localStorage
  const savePlanToLocalStorage = () => {
    // Get personalise_answers from localStorage to include in plan data
    let personaliseAnswers = null;
    try {
      const storedPersonaliseAnswers = localStorage.getItem('personalise_answers');
      if (storedPersonaliseAnswers) {
        personaliseAnswers = JSON.parse(storedPersonaliseAnswers);
      }
    } catch (error) {
      console.error('Error parsing personalise_answers from localStorage:', error);
    }

    const planData = {
      // System Configuration
      systemConfiguration: {
        basePanelCount,
        totalPanelCount,
        selectedSolarPanel,
        selectedInverter,
        selectedBattery,
        selectedEVCharger,
        includeBattery,
        batteryCount,
        includeEVCharger,
        includeEVChargerEquipment,
        includeHeatPump,
        powerOutageBackup,
        evPanelsNeeded,
        heatPumpPanelsNeeded,
      },
      
      // System Specifications
      systemSpecs: {
        systemSizeKwp: (totalPanelCount * parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')),
        annualPVGenerated: annualPVGeneration, // Total annual PV generation from all panels
        perPanelGeneration: perPanelGeneration, // Per panel generation calculated from base panels
        originalBusinessProposalPanelCount: originalBusinessProposalPanelCount, // Store the original panel count for scaling
        annualBillAmount,
        customAnnualBill,
      },
      
      // Cost Breakdown
      costs: {
        systemBaseCost,
        batteryCost,
        evChargerCost,
        heatPumpAdditionalCost: includeHeatPump ? 800 : 0,
        totalSystemCost,
        seaiGrant,
        evChargerGrant,
        totalGrants,
        finalPrice,
        monthlyFinancing: Math.round(finalPrice / 84),
      },
      
      // Savings Breakdown
      savings: {
        solarAnnualSavings,
        batteryAnnualSavings,
        batteryNightChargeSavings,
        evChargerSavings: includeEVCharger ? 320 : 0,
        heatPumpSavings: includeHeatPump ? 180 : 0,
        totalAnnualSavings,
        paybackPeriod: parseFloat(paybackPeriod),
        billOffset,
        gridIndependence,
        annualBillReduction: Math.round(annualBillAmount * (billOffset / 100)),
        newAnnualBill: Math.round(annualBillAmount * (1 - billOffset / 100)),
      },
      
      // Equipment Details
      equipment: {
        solarPanel: {
          ...selectedSolarPanel,
          quantity: totalPanelCount,
          totalWattage: totalPanelCount * 450, // Assuming 450W panels
        },
        inverter: selectedInverter,
        battery: includeBattery ? {
          ...selectedBattery,
          quantity: batteryCount,
          totalCapacity: (selectedBattery.capacity || 0) * batteryCount,
        } : null,
        evCharger: includeEVChargerEquipment ? {
          ...selectedEVCharger,
          included: true,
          additionalPanels: evPanelsNeeded,
        } : null,
        heatPump: includeHeatPump ? {
          included: true,
          estimatedCost: 800,
          additionalPanels: heatPumpPanelsNeeded,
        } : null,
      },
      
      // Property Impact
      propertyImpact: {
        berImprovement: "D2 → C1",
        propertyValueUplift: 9000,
        valueUpliftPercentage: "4-6%",
      },
      
      // Personalise Answers - Include the personalise_answers data within the plan
      personalise_answers: personaliseAnswers,
      
      // Metadata
      metadata: {
        planCreatedAt: new Date().toISOString(),
        planVersion: "1.0",
        businessProposal: businessProposal ? {
          systemSize: (totalPanelCount * parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')).toFixed(1),
          electricityBillSavings: businessProposal.electricity_bill_savings,
          monthlyPerformance: businessProposal.monthly_performance,
        } : null,
      }
    };

    // Use the utility function to save the data
    saveSolarPlanData(planData);
  };

  // Handle save plan form submission
  const handleSavePlan = async () => {
    if (!fullName.trim() || !email.trim() || !agreeToTerms) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError("")
    
    try {
      // Save plan data with user information using utility functions
      addUserInfoToPlan({
        fullName: fullName.trim(),
        email: email.trim(),
        agreeToTerms,
      });

      // Also save user contact info separately
      saveUserContactInfo({
        fullName: fullName.trim(),
        email: email.trim(),
        submittedAt: new Date().toISOString(),
      });
      
      // Collect data from localStorage for API call
      const solarPlanData = localStorage.getItem('solar_plan_data');
      const personaliseAnswers = localStorage.getItem('personalise_answers');
      const selectedLocation = localStorage.getItem('selectedLocation');
      
      // Prepare API request body
      const requestBody = {
        email: email.trim(),
        name: fullName.trim(),
        solar_plan_data: solarPlanData ? JSON.parse(solarPlanData) : null,
        personalise_answers: personaliseAnswers ? JSON.parse(personaliseAnswers) : null,
        selectedLocation: selectedLocation ? JSON.parse(selectedLocation) : null,
        branding: getEmailBranding(),
        company_id: 3,
      };
      
      console.log('Submitting plan data:', requestBody);
      
      // Make API call
      const response = await api.post('public_users/new-journey-installer-user', requestBody);
      
      console.log('API response:', response.data);
      
      // Save email submission success to localStorage
      localStorage.setItem('email_submission_success', 'true')
      localStorage.setItem('submitted_email', email.trim())
      
      // Update state
      setEmailSubmissionSuccess(true)
      
      // Close dialog
      setShowSavePlanDialog(false);
      
      // Redirect to PDF preview page with email parameter and from=plan indicator
      const encodedEmail = encodeURIComponent(email.trim());
      router.push(`/pdf-preview?email=${encodedEmail}&from=plan`);
      
    } catch (error: any) {
      console.error('Error submitting plan:', error);
      setSubmitError(
        error?.response?.data?.message || 
        'Failed to save your plan. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate current and new annual bills for circular progress
  const currentAnnualBill = annualBillAmount
  const newAnnualBill = Math.round(currentAnnualBill * (1 - billOffset / 100))

  // Enhanced initialization to load all data from localStorage
  useEffect(() => {
    try {
      console.log("Loading data from localStorage...")
      
      // Load business proposal
      const storedProposal = localStorage.getItem("business_proposal")
      if (storedProposal) {
        const proposalData = JSON.parse(storedProposal)
        setBusinessProposal(proposalData)
        console.log("Loaded business proposal from localStorage:", proposalData)
        
        // Calculate basePanelCount from system_size and panel wattage
        if (proposalData.system_size) {
          const systemSizeKw = parseFloat(proposalData.system_size)
          const panelWattageKw = parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')
          const calculatedPanelCount = Math.round(systemSizeKw / panelWattageKw)
          setBasePanelCount(calculatedPanelCount)
          setOriginalBusinessProposalPanelCount(calculatedPanelCount) // Store the original count for scaling
          console.log(`Calculated basePanelCount: ${calculatedPanelCount} (${systemSizeKw}kW / ${panelWattageKw}kW)`)
        }
      }

      // Load bill amount from personalise_answers
      const storedPersonaliseAnswers = localStorage.getItem("personalise_answers")
      console.log("Initial load - localStorage personalise_answers:", storedPersonaliseAnswers)
      if (storedPersonaliseAnswers) {
        const personaliseData = JSON.parse(storedPersonaliseAnswers)
        console.log("Initial load - parsed personaliseData:", personaliseData)
        
        // Check SEAI grant eligibility based on house build date
        if (personaliseData["house-built-date"]) {
          const houseBuildDate = personaliseData["house-built-date"]
          const isEligible = houseBuildDate === "before-2021" || houseBuildDate === "not-sure"
          setIsEligibleForSEAIGrant(isEligible)
          console.log(`SEAI grant eligibility: ${isEligible} (house built: ${houseBuildDate})`)
        } else {
          // Default to eligible for backward compatibility
          setIsEligibleForSEAIGrant(true)
          console.log("No house build date found, defaulting to SEAI grant eligible")
        }
        
        if (personaliseData.billAmount) {
          const monthlyBill = parseFloat(personaliseData.billAmount)
          const calculatedAnnualBill = Math.round(monthlyBill * 12)
          setAnnualBillAmount(calculatedAnnualBill)
          setCustomAnnualBill(calculatedAnnualBill)
          console.log(`Initial load - monthly bill: €${monthlyBill}, calculated annual bill: €${calculatedAnnualBill}`)
          
          // Set energy profile based on monthly bill
          if (monthlyBill <= 150) {
            setEnergyProfile("small")
          } else if (monthlyBill <= 250) {
            setEnergyProfile("family")
          } else {
            setEnergyProfile("big")
          }
          console.log("Initial load - energy profile set based on bill amount")
        } else {
          console.log("No billAmount found in localStorage, using default")
        }
      } else {
        console.log("No personalise_answers found in localStorage, using defaults")
      }
      
      // Mark data as loaded
      setIsDataLoaded(true)

      // Load previously saved plan data to restore user selections
      const storedPlanData = localStorage.getItem("solar_plan_data")
      if (storedPlanData) {
        const planData = JSON.parse(storedPlanData)
        console.log("Loading previously saved plan data:", planData)
        
        // Restore system configuration
        if (planData.systemConfiguration) {
          const config = planData.systemConfiguration
          
          // Restore panel count (but only if not overridden by business proposal)
          if (config.basePanelCount && !storedProposal) {
            setBasePanelCount(config.basePanelCount)
            console.log(`Restored basePanelCount: ${config.basePanelCount}`)
          }
          
          // Restore equipment selections
          if (config.selectedSolarPanel?.id) {
            const panel = solarPanelOptions.find(p => p.id === config.selectedSolarPanel.id)
            if (panel) {
              setSelectedSolarPanel(panel)
              console.log(`Restored solar panel: ${panel.name}`)
            }
          }
          
          if (config.selectedInverter?.id) {
            const inverter = inverterOptions.find(i => i.id === config.selectedInverter.id)
            if (inverter) {
              setSelectedInverter(inverter)
              console.log(`Restored inverter: ${inverter.name}`)
            }
          }
          
          if (config.selectedBattery?.id) {
            const battery = batteryOptions.find(b => b.id === config.selectedBattery.id)
            if (battery) {
              setSelectedBattery(battery)
              console.log(`Restored battery: ${battery.name}`)
            }
          }
          
          if (config.selectedEVCharger?.id) {
            const evCharger = evChargerOptions.find(c => c.id === config.selectedEVCharger.id)
            if (evCharger) {
              setSelectedEVCharger(evCharger)
              console.log(`Restored EV charger: ${evCharger.name}`)
            }
          }
          
          // Restore feature toggles
          if (typeof config.includeBattery === 'boolean') {
            setIncludeBattery(config.includeBattery)
            console.log(`Restored includeBattery: ${config.includeBattery}`)
          }
          
          if (typeof config.includeEVCharger === 'boolean') {
            setIncludeEVCharger(config.includeEVCharger)
            console.log(`Restored includeEVCharger: ${config.includeEVCharger}`)
          }
          
          if (typeof config.includeEVChargerEquipment === 'boolean') {
            setIncludeEVChargerEquipment(config.includeEVChargerEquipment)
            console.log(`Restored includeEVChargerEquipment: ${config.includeEVChargerEquipment}`)
          }
          
          if (typeof config.includeHeatPump === 'boolean') {
            setIncludeHeatPump(config.includeHeatPump)
            console.log(`Restored includeHeatPump: ${config.includeHeatPump}`)
          }
          
          if (typeof config.powerOutageBackup === 'boolean') {
            setPowerOutageBackup(config.powerOutageBackup)
            console.log(`Restored powerOutageBackup: ${config.powerOutageBackup}`)
          }
          
          // Set daily flow type based on battery inclusion
          setDailyFlowType(config.includeBattery ? "solar-battery" : "solar")
        }
        
        // Restore system specs including custom bill amount
        // Only restore bill amount from plan data if not already loaded from personalise_answers
        if (planData.systemSpecs) {
          if (planData.systemSpecs.annualBillAmount && !storedPersonaliseAnswers) {
            setAnnualBillAmount(planData.systemSpecs.annualBillAmount)
            setCustomAnnualBill(planData.systemSpecs.annualBillAmount)
            console.log(`Restored annual bill amount from plan data: €${planData.systemSpecs.annualBillAmount}`)
          } else if (planData.systemSpecs.annualBillAmount && storedPersonaliseAnswers) {
            console.log(`Skipping plan data bill amount (€${planData.systemSpecs.annualBillAmount}) - using personalise_answers instead`)
          }
          
          // Restore per panel generation if it exists
          if (planData.systemSpecs.perPanelGeneration) {
            setPerPanelGeneration(planData.systemSpecs.perPanelGeneration)
            console.log(`Restored perPanelGeneration: ${planData.systemSpecs.perPanelGeneration} kWh/panel/year`)
          }
          
          // Restore original business proposal panel count if it exists
          if (planData.systemSpecs.originalBusinessProposalPanelCount) {
            setOriginalBusinessProposalPanelCount(planData.systemSpecs.originalBusinessProposalPanelCount)
            console.log(`Restored originalBusinessProposalPanelCount: ${planData.systemSpecs.originalBusinessProposalPanelCount}`)
          }
        }
        
        // Restore user information if it exists
        if (planData.userInfo) {
          setFullName(planData.userInfo.fullName || "")
          setEmail(planData.userInfo.email || "")
          console.log(`Restored user info: ${planData.userInfo.fullName}, ${planData.userInfo.email}`)
        }
      }

      // Load user contact info separately
      const storedUserContact = localStorage.getItem("user_contact_info")
      if (storedUserContact) {
        const userContact = JSON.parse(storedUserContact)
        if (userContact.fullName && !fullName) {
          setFullName(userContact.fullName)
        }
        if (userContact.email && !email) {
          setEmail(userContact.email)
        }
        console.log("Loaded user contact info:", userContact)
      }

      // Load max_panels from localStorage, default to 22 if not found
      const storedMaxPanels = localStorage.getItem("max_panels")
      if (storedMaxPanels) {
        const maxPanelsValue = parseInt(storedMaxPanels, 10)
        if (!isNaN(maxPanelsValue) && maxPanelsValue > 0) {
          setMaxPanels(maxPanelsValue)
          console.log(`Loaded max_panels from localStorage: ${maxPanelsValue}`)
        } else {
          console.log("Invalid max_panels value in localStorage, using default: 22")
        }
      } else {
        console.log("max_panels not found in localStorage, using default: 22")
      }

    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      // If there's an error, we'll fall back to defaults
      setBusinessProposal(null)
    } finally {
      // Set loading to false regardless of success or failure
      setIsLoading(false)
      console.log("Finished loading data from localStorage")
    }
  }, [])

  // Calculate perPanelGeneration once when business proposal data is loaded
  useEffect(() => {
    if (businessProposal && businessProposal.monthly_forecast && originalBusinessProposalPanelCount) {
      // Calculate per panel generation from business proposal data using the original panel count
      const calculatedAnnualPVGeneration = Math.round(
        businessProposal.monthly_forecast.reduce(
          (total: number, forecast: any) => total + forecast.monthly_sum, 0
        )
      );
      const calculatedPerPanelGeneration = Math.round(calculatedAnnualPVGeneration / originalBusinessProposalPanelCount);
      setPerPanelGeneration(calculatedPerPanelGeneration);
      console.log(`Calculated perPanelGeneration: ${calculatedPerPanelGeneration} kWh/panel/year from business proposal (${calculatedAnnualPVGeneration} kWh / ${originalBusinessProposalPanelCount} panels)`);
    } else if (!businessProposal) {
      // Use fallback calculation only if we have no business proposal
      const fallbackPerPanelGeneration = 410; // Default value
      setPerPanelGeneration(fallbackPerPanelGeneration);
      console.log(`Using fallback perPanelGeneration: ${fallbackPerPanelGeneration} kWh/panel/year`);
    }
  }, [businessProposal, originalBusinessProposalPanelCount]); // React to both businessProposal and originalBusinessProposalPanelCount changes

  // Auto-save plan data when key values change
  useEffect(() => {
    // Only save if we have meaningful data (not in loading state)
    if (!isLoading && totalPanelCount > 0) {
      savePlanToLocalStorage();
    }
  }, [
    basePanelCount,
    selectedSolarPanel.id,
    selectedInverter.id,
    selectedBattery.id,
    selectedEVCharger.id,
    includeBattery,
    batteryCount,
    includeEVCharger,
    includeEVChargerEquipment,
    includeHeatPump,
    powerOutageBackup,
    perPanelGeneration,
    isLoading,
    totalPanelCount,
  ]);

  // Show loading screen while data is being loaded
  // Show loading screen for at least 3 seconds
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Building Your Energy Plan</h2>
            <p className="text-gray-600">
              Calculating your personalised energy system based on your home and responses...
            </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppHeader  maxWidth="max-w-6xl"/>
      {/* Progress Bar */}
      <ProgressBars 
        addressActive={true}
        potentialActive={true}
        personaliseActive={true}
        planActive={true}
        maxWidth="max-w-6xl"
      />

      {/* Conditional rendering based on device type */}
      {isMobile ? (
        <SolarDashboardMobile
          basePanelCount={basePanelCount}
          setBasePanelCount={setBasePanelCount}
          totalPanelCount={totalPanelCount}
          maxPanels={maxPanels}
          recommendedPanelCount={recommendedPanelCount}
          powerOutageBackup={powerOutageBackup}
          setPowerOutageBackup={setPowerOutageBackup}
          includeBattery={includeBattery}
          setIncludeBattery={setIncludeBattery}
          batteryCount={batteryCount}
          setBatteryCount={setBatteryCount}
          includeEVCharger={includeEVCharger}
          setIncludeEVCharger={setIncludeEVCharger}
          includeEVChargerEquipment={includeEVChargerEquipment}
          setIncludeEVChargerEquipment={setIncludeEVChargerEquipment}
          includeHeatPump={includeHeatPump}
          setIncludeHeatPump={setIncludeHeatPump}
          selectedSolarPanel={selectedSolarPanel}
          setSelectedSolarPanel={setSelectedSolarPanel}
          selectedInverter={selectedInverter}
          setSelectedInverter={setSelectedInverter}
          selectedBattery={selectedBattery}
          setSelectedBattery={setSelectedBattery}
          selectedEVCharger={selectedEVCharger}
          setSelectedEVCharger={setSelectedEVCharger}
          solarPanelOptions={solarPanelOptions}
          inverterOptions={inverterOptions}
          batteryOptions={batteryOptions}
          evChargerOptions={evChargerOptions}
          systemBaseCost={systemBaseCost}
          batteryCost={batteryCost}
          evChargerCost={evChargerCost || 0}
          totalSystemCost={totalSystemCost}
          seaiGrant={seaiGrant}
          isEligibleForSEAIGrant={isEligibleForSEAIGrant}
          evChargerGrant={evChargerGrant || 0}
          totalGrants={totalGrants}
          solarAnnualSavings={solarAnnualSavings}
          batteryAnnualSavings={batteryAnnualSavings}
          batteryNightChargeSavings={batteryNightChargeSavings}
          totalAnnualSavings={totalAnnualSavings}
          finalPrice={finalPrice}
          paybackPeriod={paybackPeriod}
          billOffset={billOffset}
          customAnnualBill={customAnnualBill}
          setCustomAnnualBill={setCustomAnnualBill}
          showBillEditor={showBillEditor}
          setShowBillEditor={setShowBillEditor}
          billInputMode={billInputMode}
          setBillInputMode={setBillInputMode}
          getRecommendationText={getRecommendationText}
          evPanelsNeeded={evPanelsNeeded}
          heatPumpPanelsNeeded={heatPumpPanelsNeeded}
          perPanelGeneration={perPanelGeneration}
          annualPVGeneration={annualPVGeneration}
          router={router}
          showSavePlanDialog={showSavePlanDialog}
          setShowSavePlanDialog={setShowSavePlanDialog}
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          agreeToTerms={agreeToTerms}
          setAgreeToTerms={setAgreeToTerms}
          isSubmitting={isSubmitting}
          submitError={submitError}
          handleFullNameChange={handleFullNameChange}
          handleEmailChange={handleEmailChange}
          handleSavePlan={handleSavePlan}
          emailSubmissionSuccess={emailSubmissionSuccess}
          scenarioFractions={scenarioFractions}
          showSavingsModal={showSavingsModal}
          setShowSavingsModal={setShowSavingsModal}
          savingsModalTab={savingsModalTab}
          setSavingsModalTab={setSavingsModalTab}
          showEnergyProfileModal={showEnergyProfileModal}
          setShowEnergyProfileModal={setShowEnergyProfileModal}
          tempMonthlyBill={tempMonthlyBill}
          setTempMonthlyBill={setTempMonthlyBill}
          handleSaveBillAmount={handleSaveBillAmount}
          energyProfile={energyProfile}
          dailyUsageKwh={dailyUsageKwh}
          monthlyBill={monthlyBill}
          gridRate={gridRate}
          hasEV={includeEVCharger}
          hasHeatPump={includeHeatPump}
          scenarios={scenarios}
          showMaths={showMaths}
          setShowMaths={setShowMaths}
          branding={branding}
        />
      ) : (
        // ==================== DESKTOP VIEW START ====================
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Your Personal Energy Plan</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              An interactive tool to build your perfect solar + battery system.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8" style={{alignItems: 'start'}}>
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8" style={{contain: 'layout'}}>
              {/* Enhanced Hero Image */}
              <div className="relative overflow-hidden rounded-xl">
                <div className="relative h-48 md:h-80">
                  <img
                    src="/images/plan-hero-image.png"
                    alt="Modern home with comprehensive solar system and EV charging"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold mb-1">Complete Energy Independence</h2>
                        <p className="text-sm md:text-base opacity-90">Solar + Battery + EV Charging Solution</p>
                      </div>
                      <div className="mt-2 md:mt-0 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {totalPanelCount} Panels | {(totalPanelCount * parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')).toFixed(1)} kWp System
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Your System Builder */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      1
                    </div>
                    Customize Your System
                  </CardTitle>
                  <p className="text-sm md:text-base text-gray-600">
                    Select your hardware. All costs and savings will update instantly.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 md:space-y-8">
                  {/* Solar System Configuration */}
                  <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Sun className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base md:text-lg font-bold">
                              Solar System{" "}
                              <span className="text-xs font-medium text-gray-600">
                                (€{solarAnnualSavings} savings/year)
                              </span>
                            </h3>
                            <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              <p className="font-medium mb-1">Solar Panels:</p>
                              <p>
                                Convert sunlight into free electricity for your home and sell excess back to the grid.
                              </p>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                          </div>
                          <p className="text-sm md:text-base text-gray-600">
                            {totalPanelCount} panels generating {(annualPVGeneration).toLocaleString()} kWh annually
                          </p>
                          <p className="text-xs text-green-600 font-medium">{getRecommendationText()}</p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newBasePanelCount = Math.max(8, basePanelCount - 1)
                              setBasePanelCount(newBasePanelCount)
                            }}
                            disabled={basePanelCount <= 8}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-lg">{totalPanelCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newBasePanelCount = Math.min(maxPanels, basePanelCount + 1)
                              setBasePanelCount(newBasePanelCount)
                            }}
                            disabled={totalPanelCount >= maxPanels}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xl md:text-2xl font-bold">€{systemBaseCost.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Panel Sizing Feedback */}
                    {panelSizingMessage && (
                      <div
                        className={`p-3 rounded-lg border ${panelSizingMessage.bgColor} ${panelSizingMessage.borderColor}`}
                      >
                        <p className={`text-xs font-medium ${panelSizingMessage.color}`}>
                          {panelSizingMessage.message}
                        </p>
                      </div>
                    )}

                    {/* Visual Equipment Display */}
                    {/* Compact Equipment Selection for Solar */}
                    <Collapsible open={showSolarEquipment} onOpenChange={setShowSolarEquipment}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between text-sm bg-transparent">
                          <span>Recommended Equipment</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${showSolarEquipment ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        {/* Solar Panel Selection */}
                        <div className="grid md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border">
                          <div className="md:col-span-1">
                            <img
                              src={selectedSolarPanel.image || `/images/solar-panels/${selectedSolarPanel.id}.png`}
                              alt={selectedSolarPanel.name}
                              className="w-full h-32 object-contain rounded bg-gray-100 p-1"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">Solar Panel</h4>
                            </div>
                            <CustomDropdown
                              value={selectedSolarPanel.id}
                              options={solarPanelOptions}
                              onChange={(value) => {
                                const panel = solarPanelOptions.find((p) => p.id === value)
                                if (panel) setSelectedSolarPanel(panel)
                              }}
                              isOpen={showSolarPanelDropdown}
                              onOpen={toggleSolarPanelDropdown}
                              onClose={closeAllDropdowns}
                              renderValue={(panel) => (
                                <span className="text-xs">
                                  {panel.name}{" "}
                                  {(panel.priceAdjustment || 0) !== 0 &&
                                    `(${(panel.priceAdjustment || 0) > 0 ? "+" : ""}€${panel.priceAdjustment || 0})`}
                                </span>
                              )}
                              renderOption={(panel) => (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs">
                                    {panel.name}{" "}
                                    {(panel.priceAdjustment || 0) !== 0 &&
                                      `(${(panel.priceAdjustment || 0) > 0 ? "+" : ""}€${panel.priceAdjustment || 0})`}
                                  </span>
                                  {panel.recommended && (
                                    <Badge className="ml-1 bg-green-600 text-xs px-1">Recommended</Badge>
                                  )}
                                </div>
                              )}
                            />
                            <p className="text-xs text-gray-600">
                              {selectedSolarPanel.reason}
                            </p>
                            <a href={selectedSolarPanel.datasheet || "/pdf/jinko_panel.pdf"} download={getDownloadFilename(selectedSolarPanel.datasheet, "JinkoSolar_450W_Spec_Sheet.pdf")}>
                              <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                                <Download className="w-3 h-3 mr-1" />
                                Download Spec Sheet
                              </Button>
                            </a>
                          </div>
                        </div>

                        {/* Inverter Selection */}
                        <div className="grid md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border">
                          <div className="md:col-span-1">
                            <img
                              src={selectedInverter.image || `/images/inverters/${selectedInverter.id}.png`}
                              alt={selectedInverter.name}
                              className="w-full h-32 object-contain rounded bg-gray-100 p-1"
                            />
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">Inverter</h4>
                              <div className="flex items-center gap-2">
                                {powerOutageBackup && <Badge className="bg-orange-600 text-xs">Hybrid</Badge>}
                              </div>
                            </div>
                            <CustomDropdown
                              value={selectedInverter.id}
                              options={inverterOptions}
                              onChange={(value) => {
                                const inverter = inverterOptions.find((i) => i.id === value)
                                if (inverter) setSelectedInverter(inverter)
                              }}
                              isOpen={showInverterDropdown}
                              onOpen={toggleInverterDropdown}
                              onClose={closeAllDropdowns}
                              renderValue={(inverter) => (
                                <span className="text-xs">
                                  {inverter.name}{" "}
                                  {(inverter.priceAdjustment || 0) !== 0 &&
                                    `(${(inverter.priceAdjustment || 0) > 0 ? "+" : ""}€${inverter.priceAdjustment || 0})`}
                                </span>
                              )}
                              renderOption={(inverter) => (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs">
                                    {inverter.name}{" "}
                                    {(inverter.priceAdjustment || 0) !== 0 &&
                                      `(${(inverter.priceAdjustment || 0) > 0 ? "+" : ""}€${inverter.priceAdjustment || 0})`}
                                  </span>
                                  {inverter.recommended && !powerOutageBackup && (
                                    <Badge className="ml-1 bg-green-600 text-xs px-1">Recommended</Badge>
                                  )}
                                </div>
                              )}
                            />
                            <p className="text-xs text-gray-600">
                              {selectedInverter.reason}
                            </p>
                            <a href={selectedInverter.datasheet || "/pdf/sig_inverter.pdf"} download={getDownloadFilename(selectedInverter.datasheet, "Sigenergy_Inverter_Spec_Sheet.pdf")}>
                              <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                                <Download className="w-3 h-3 mr-1" />
                                Download Spec Sheet
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Improved Power Outage Question */}
                    <div className="flex items-start gap-3 py-2">
                      {/* <Checkbox 
                        checked={powerOutageBackup} 
                        onCheckedChange={(checked) => setPowerOutageBackup(checked === true)} 
                        className="mt-1" 
                      /> */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Power outage backup?</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-blue-600 hover:text-blue-700 underline text-xs flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Learn more
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[66vh] overflow-y-auto">
                              <DialogHeader className="relative">
                                <DialogClose asChild>
                                  <button
                                    className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    ×
                                  </button>
                                </DialogClose>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold pr-8">
                                  <AlertCircle className="w-6 h-6 text-orange-500" />
                                  Did You Know? Power Outage Backup Options
                                </DialogTitle>
                                <p className="text-sm text-gray-600">
                                  Important considerations for using your system during grid outages.
                                </p>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-800 mb-3">
                                    <strong>Most installers don't tell you this:</strong> To use your solar and battery during power outages, you need specific equipment installed from the start.
                                  </p>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                      <h4 className="font-semibold text-green-800">Option 1: Hybrid Inverter</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">Automatically switches to battery power during outages</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      <li>• Seamless backup power</li>
                                      <li>• No manual intervention needed</li>
                                      <li>• Premium option</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="w-5 h-5 text-orange-500" />
                                      <h4 className="font-semibold text-orange-800">Option 2: Standard Inverter + Changeover Switch</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">Requires manual switching during outages</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      <li>• Must be installed at point of solar installation</li>
                                      <li>• Manual switch to battery power</li>
                                      <li>• More affordable option</li>
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700">
                                  <p>
                                    Important: This cannot be easily added later - it must be planned and installed with your solar system.
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <p className="text-xs text-gray-600">Use your solar and battery when the grid goes down</p>
                        {powerOutageBackup && (
                          <div className="mt-1 p-2 bg-green-50 rounded text-xs text-green-700">
                            ✓ Hybrid inverter included
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compressed Battery Storage Section */}
                  <div className="space-y-4">
                    <div className="p-3 md:p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Battery className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base md:text-lg font-bold">
                                Add Battery Storage{" "}
                                <span className="text-xs font-medium text-gray-600">
                                  (€{batteryNightChargeSavings} savings/year)
                                </span>
                              </h3>
                              <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-56">
                              <p className="font-medium mb-1">Battery Storage Benefits:</p>
                              <p className="mb-2">Stores excess solar energy for use at night and during power outages.</p>
                              {includeBattery && (
                                <div className="border-t pt-2">
                                  <p className="font-medium text-blue-600 mb-1">Night Charge Savings:</p>
                                  <p>€{batteryNightChargeSavings}/year from storing cheap night electricity</p>
                                </div>
                              )}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                            </div>
                            <p className="text-sm md:text-base text-gray-600">
                              Store energy for night use
                            </p>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <Switch checked={includeBattery} onCheckedChange={setIncludeBattery} />
                          {includeBattery && (
                            <div className="mt-2 space-y-2">
                              <div className="text-xl md:text-2xl font-bold">€{batteryCost.toLocaleString()}</div>
                              
                              {/* Battery Quantity Controls */}
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setBatteryCount(Math.max(1, batteryCount - 1))}
                                  disabled={batteryCount <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[60px] text-center">
                                  {batteryCount}x {selectedBattery.capacity || 0}kWh
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setBatteryCount(Math.min(2, batteryCount + 1))}
                                  disabled={batteryCount >= 2}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                Total: {batteryCount * (selectedBattery.capacity || 0)}kWh storage
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Energy Independence Comparison Cards - Integrated within battery section */}
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-center text-sm text-gray-800">Choose Your Energy Solution</h4>
                        
                        {/* Comparison Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Solar Only Card - Clickable */}
                          <button
                            onClick={() => setIncludeBattery(false)}
                            className={`p-3 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-md ${
                              !includeBattery 
                                ? 'border-orange-400 bg-orange-50 shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-orange-200'
                            }`}
                          >
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center bg-orange-100 rounded-full">
                                <Sun className="w-5 h-5 text-orange-500" />
                              </div>
                              <h5 className="font-bold text-sm text-orange-600 mb-1">Solar Only</h5>
                              <div className="text-lg font-bold text-orange-600 mb-1">20-30%</div>
                              <p className="text-xs text-gray-600 mb-2">Grid-dependent at night</p>
                              <div className="text-xs font-semibold text-gray-500">€0 extra</div>
                            </div>
                          </button>

                          {/* Solar + Battery Card - Clickable */}
                          <button
                            onClick={() => setIncludeBattery(true)}
                            className={`p-3 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-md ${
                              includeBattery 
                                ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-100' 
                                : 'border-gray-200 bg-white hover:border-green-200'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-full ${
                                includeBattery ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                <Battery className={`w-5 h-5 ${includeBattery ? 'text-blue-600' : 'text-green-600'}`} />
                              </div>
                              <h5 className={`font-bold text-sm mb-1 ${includeBattery ? 'text-blue-700' : 'text-green-700'}`}>Solar + Battery</h5>
                              <div className={`text-lg font-bold mb-1 ${includeBattery ? 'text-blue-600' : 'text-green-600'}`}>{batteryCount >= 2 ? '80-90%' : '70-80%'}</div>
                              <p className="text-xs text-gray-600 mb-2">Power day & night</p>
                              <div className={`text-xs font-semibold ${includeBattery ? 'text-blue-600' : 'text-green-600'}`}>+€{batteryAnnualSavings}/year</div>
                            </div>
                          </button>
                        </div>

                        {/* Dynamic insight message based on selection */}
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            includeBattery 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Info
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                includeBattery ? 'text-blue-500' : 'text-orange-500'
                              }`}
                            />
                            <p className={`text-xs ${includeBattery ? 'text-blue-800' : 'text-orange-700'}`}>
                              {includeBattery
                                ? `With ${batteryCount > 1 ? `${batteryCount} batteries` : 'battery storage'} (${batteryCount * (selectedBattery.capacity || 0)}kWh total), you'll use your own solar power even after sunset, ${batteryCount >= 2 ? 'achieving near-complete' : 'dramatically reducing'} grid dependence.`
                                : "Adding battery storage can increase your energy independence from 30% to 85%, powering your home through nights and outages."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Compact Battery Equipment Selection */}
                      {includeBattery && (
                        <Collapsible open={showBatteryEquipment} onOpenChange={setShowBatteryEquipment}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-sm bg-transparent mt-4">
                              <span>Recommended Equipment</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${showBatteryEquipment ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 mt-4">
                            <div className="grid md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border">
                              <div className="md:col-span-1">
                                <img
                                  src={selectedBattery.image || `/images/batteries/${selectedBattery.id}.png`}
                                  alt={selectedBattery.name}
                                  className="w-full h-32 object-contain rounded bg-gray-100 p-1"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">Battery Storage</h4>
                                </div>
                                <CustomDropdown
                                  value={selectedBattery.id}
                                  options={batteryOptions}
                                  onChange={(value) => {
                                    const battery = batteryOptions.find((b) => b.id === value)
                                    if (battery) setSelectedBattery(battery)
                                  }}
                                  isOpen={showBatteryDropdown}
                                  onOpen={toggleBatteryDropdown}
                                  onClose={closeAllDropdowns}
                                  renderValue={(battery) => (
                                    <span className="text-xs">
                                      {battery.name} ({battery.capacity}kWh) - €{battery.price}
                                    </span>
                                  )}
                                  renderOption={(battery) => (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-xs">
                                        {battery.name} ({battery.capacity}kWh) - €{battery.price}
                                      </span>
                                      {battery.recommended && (
                                        <Badge className="ml-1 bg-green-600 text-xs px-1">Recommended</Badge>
                                      )}
                                    </div>
                                  )}
                                />
                                <p className="text-xs text-gray-600">
                                  {batteryCount}x {selectedBattery.capacity || 0}kWh = {batteryCount * (selectedBattery.capacity || 0)}kWh total • {selectedBattery.reason}
                                </p>
                                <a href={selectedBattery.datasheet || "/pdf/sig_battery.pdf"} download={getDownloadFilename(selectedBattery.datasheet, `SigEnergy_Battery_${selectedBattery.capacity || 0}kWh_Spec_Sheet.pdf`)}>
                                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                                    <Download className="w-3 h-3 mr-1" />
                                    Download Spec Sheet
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Future-Proof Your Home */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      2
                    </div>
                    Future-Proof Your Home
                  </CardTitle>
                  <p className="text-sm md:text-base text-gray-600">
                    Planning upgrades? We'll size your solar system to handle increased energy needs.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* EV Planning with Panel Addition */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">Planning for an Electric Vehicle?</h3>
                          <p className="text-xs md:text-sm text-gray-600">
                            Typical increase: +3,500 kWh/year electricity usage
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={includeEVCharger} 
                        onCheckedChange={(checked) => {
                          setIncludeEVCharger(checked)
                          // When EV planning is enabled, automatically enable EV charger equipment
                          if (checked) {
                            setIncludeEVChargerEquipment(true)
                          } else {
                            // When EV planning is disabled, automatically disable EV charger equipment
                            setIncludeEVChargerEquipment(false)
                          }
                        }} 
                      />
                    </div>
                    
                    {includeEVCharger && (
                      <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                        <div className="flex items-center gap-2 text-blue-800">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            We recommend using the maximum allowed panels and adding a battery
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {!includeEVCharger && (
                      <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-200">
                        Not driving electric yet? Your system can support it down the line - it's easy to upgrade.
                      </div>
                    )}
                  </div>

                  {/* EV Charger Equipment Option - Only visible when Planning for EV */}
                  {includeEVCharger && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-gray-600" />
                            <div>
                              <h4 className="font-medium text-sm">Add EV Charger</h4>
                              <p className="text-xs text-gray-600">Smart charging with solar integration</p>
                            </div>
                          </div>
                          <div className="text-center md:text-right">
                            <div className="flex items-center justify-end gap-3">
                              {includeEVChargerEquipment && (
                                <div className="text-sm font-bold">
                                  €{(evChargerCost || 0).toLocaleString()} (€{selectedEVCharger.grant || 0} Grant Available)
                                </div>
                              )}
                              <Switch checked={includeEVChargerEquipment} onCheckedChange={setIncludeEVChargerEquipment} />
                            </div>
                          </div>
                        </div>
                      </div>

                                              {/* EV Charger Equipment Selection */}
                      {includeEVChargerEquipment && (
                        <Collapsible open={showEVChargerEquipment} onOpenChange={setShowEVChargerEquipment}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-sm bg-transparent">
                              <span>Recommended Equipment</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${showEVChargerEquipment ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 mt-4">
                            <div className="grid md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border">
                              <div className="md:col-span-1">
                                <img
                                  src={selectedEVCharger.image || `/images/ev-chargers/${selectedEVCharger.id}.png`}
                                  alt={selectedEVCharger.name}
                                  className="w-full h-32 object-contain rounded bg-gray-100 p-1"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">EV Charger</h4>
                                </div>
                                <CustomDropdown
                                  value={selectedEVCharger.id}
                                  options={evChargerOptions}
                                  onChange={(value) => {
                                    const charger = evChargerOptions.find((c) => c.id === value)
                                    if (charger) setSelectedEVCharger(charger)
                                  }}
                                  isOpen={showEVChargerDropdown}
                                  onOpen={toggleEVChargerDropdown}
                                  onClose={closeAllDropdowns}
                                  renderValue={(charger) => (
                                    <span className="text-xs">
                                      {charger.name} (€{(charger.price || 0) - (charger.grant || 0)} after grant)
                                    </span>
                                  )}
                                  renderOption={(charger) => (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-xs">
                                        {charger.name} (€{(charger.price || 0) - (charger.grant || 0)} after grant)
                                      </span>
                                      {charger.recommended && (
                                        <Badge className="ml-1 bg-green-600 text-xs px-1">Recommended</Badge>
                                      )}
                                    </div>
                                  )}
                                />
                                <p className="text-xs text-gray-600">
                                  {selectedEVCharger.power} • {selectedEVCharger.reason}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(selectedEVCharger.features || []).map((feature, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs px-1">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                                <a href={selectedEVCharger.datasheet || "/pdf/myenergi_zappi.pdf"} download={getDownloadFilename(selectedEVCharger.datasheet, `${selectedEVCharger.name.replace(/\s+/g, '_')}_Spec_Sheet.pdf`)}>
                                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                                    <Download className="w-3 h-3 mr-1" />
                                    Download Spec Sheet
                                  </Button>
                                </a>
                              </div>
                            </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    </div>
                  )}

                  {/* Heat Pump Planning with Panel Addition */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 md:p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Home className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">Planning a Heat Pump?</h3>
                          <p className="text-xs md:text-sm text-gray-600">
                            Typical increase: +2,800 kWh/year electricity usage
                          </p>
                        </div>
                      </div>
                      <Switch checked={includeHeatPump} onCheckedChange={setIncludeHeatPump} />
                    </div>
                    {includeHeatPump && (
                      <div className="bg-orange-100 p-3 rounded-lg border border-orange-300">
                        <div className="flex items-center gap-2 text-orange-800">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            We recommend using the maximum allowed panels and adding a battery
                             </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simplified Smart Planning Benefits */}
                  {(includeEVCharger || includeHeatPump) && (
                    <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Future-Proofing Benefits</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Your solar system is now sized to handle your future energy needs, maximizing savings and
                        reducing reliance on expensive grid electricity.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 3: How Your System Works Daily - Two Options */}
            { false &&  <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      3
                    </div>
                    How Your System Works Daily
                  </CardTitle>
                  <p className="text-sm md:text-base text-gray-600">Interactive walkthrough of your energy system</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 md:space-y-6">
                    {/* System Type Tabs */}
                    <Tabs value={dailyFlowType} onValueChange={(value) => setDailyFlowType(value as any)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solar">Solar Only</TabsTrigger>
                        <TabsTrigger value="solar-battery">Solar + Battery</TabsTrigger>
                      </TabsList>

                      <TabsContent value="solar" className="mt-4">
                        <div className="text-center mb-4">
                          <Button onClick={toggleAnimation} className="bg-blue-600 hover:bg-blue-700" size="lg">
                            {isAnimationPlaying ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                Pause Animation
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Watch Solar-Only Flow
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="solar-battery" className="mt-4">
                        <div className="text-center mb-4">
                          <Button onClick={toggleAnimation} className="bg-blue-600 hover:bg-blue-700" size="lg">
                            {isAnimationPlaying ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                Pause Animation
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Watch Solar + Battery Flow
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Enhanced Animation Display */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6 rounded-lg border-2 border-blue-200">
                      <div className="aspect-video bg-white rounded-lg p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Current Scene Display */}
                        <div className="text-center z-10">
                          {(() => {
                            const scene = currentScenes[animationStep]
                            const IconComponent = scene.icon
                            return (
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${scene.color} flex items-center justify-center mb-4 transform transition-all duration-500 ${
                                    isAnimationPlaying ? "scale-110" : "scale-100"
                                  }`}
                                >
                                  <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2">{scene.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 max-w-md text-center">
                                  {scene.description}
                                </p>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Background animation effect */}
                        <div
                          className={`absolute inset-0 opacity-10 transition-all duration-1000 ${currentScenes[animationStep].color} ${isAnimationPlaying ? "scale-110" : "scale-100"}`}
                        />
                      </div>

                      {/* Progress Indicator */}
                      <div className="flex justify-center mt-4 space-x-2">
                        {currentScenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setAnimationStep(index)}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                              animationStep === index ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        Example only – setup and savings vary by home.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> 
}
              {/* Section 4: Property Value - Redesigned with Compact Cards */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      3
                    </div>
                    💡 How Solar Affects Property Value (example scenario)
                  </CardTitle>
                  <p className="text-sm md:text-base text-gray-600">Long-term benefits for your home</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Property Value Increase Card */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-blue-800">Property Value Increase</h4>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">+2% to +6%</div>
                        <p className="text-sm text-gray-600">~€8,000–24,000 on a €400,000 home</p>
                      </div>
                    </div>

                    {/* BER Rating Improvement Card */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Home className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-green-800">BER Rating Improvement</h4>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="bg-orange-500 text-white px-2 py-1 rounded font-bold text-sm">C2</div>
                          <p className="text-xs text-gray-600 mt-1">Before</p>
                        </div>
                        <div className="text-xl text-gray-400">→</div>
                        <div className="text-center">
                          <div className="bg-green-600 text-white px-2 py-1 rounded font-bold text-sm">B3</div>
                          <p className="text-xs text-gray-600 mt-1">After</p>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 text-center mt-2">Typically improves by 1 BER category</p>
                    </div>

                    {/* Market Benefits Card */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-purple-800">Market Benefits</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs">20% faster sale times</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs">Appeals to eco-conscious buyers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs">Better mortgage rates available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs">89% of buyers value efficiency</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      Based on industry averages for solar, battery, and EV charger installations. Actual impact depends
                      on the condition of the home and local property market. This is not a valuation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 5: Installation, Warranties, FAQ */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      4
                    </div>
                    Installation, Warranties, FAQ
                  </CardTitle>
                  <p className="text-sm md:text-base text-gray-600">Everything you need to know about the process</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Installation Timeline */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">Installation Timeline</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Site Survey & Design (1 day to 1 week)</h4>
                            <p className="text-sm text-gray-600">Technical assessment and system design</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Planning & Permits (2-4 weeks)</h4>
                            <p className="text-sm text-gray-600">Grid connection application and permits</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Installation Day (1-2 days)</h4>
                            <p className="text-sm text-gray-600">Professional installation and commissioning</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Warranty Coverage */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">Warranty Coverage</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                          <span className="font-medium">Solar Panels</span>
                          <span className="text-green-600 font-bold">30 Years Performance</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                          <span className="font-medium">Inverter</span>
                          <span className="text-blue-600 font-bold">10 Years Product</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                          <span className="font-medium">Battery Storage</span>
                          <span className="text-purple-600 font-bold">10 Years Product</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                          <span className="font-medium">Installation Work</span>
                          <span className="text-orange-600 font-bold">5 Years Workmanship</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* What if something breaks */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">What if something breaks?</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">24/7 Monitoring</h4>
                            <p className="text-sm text-gray-600">We monitor your system performance remotely</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">Rapid Response</h4>
                            <p className="text-sm text-gray-600">Same-day diagnosis, next-day repair in most cases</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">No Cost Repairs</h4>
                            <p className="text-sm text-gray-600">All warranty repairs covered at no charge</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                
                {/* What if I move house */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">What happens if I move house?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">System stays with the house</h4>
                          <p className="text-sm text-gray-600">Solar systems typically increase property value by 2-6%</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Warranties transfer to new owner</h4>
                          <p className="text-sm text-gray-600">All manufacturer warranties remain valid</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Strong selling point</h4>
                          <p className="text-sm text-gray-600">89% of buyers value energy-efficient homes</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Can I add more panels later */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Can I add more panels later?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Yes, but it's more expensive</h4>
                          <p className="text-sm text-gray-600">Adding panels later costs 20-30% more due to separate installation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Inverter capacity limits</h4>
                          <p className="text-sm text-gray-600">Your inverter must have spare capacity for additional panels</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Plan ahead and save</h4>
                          <p className="text-sm text-gray-600">Size your system for future needs (EV, heat pump) from the start</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* What maintenance is required */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">What maintenance is required?</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 bg-white border rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Minimal maintenance required</h4>
                          <p className="text-sm text-gray-600">Solar panels are self-cleaning in Irish weather</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Annual visual inspection</h4>
                          <p className="text-sm text-gray-600">Check for debris, damage, or shading issues</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Monitor performance</h4>
                          <p className="text-sm text-gray-600">We provide monitoring app to track system performance</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                </CardContent>
              </Card>
            </div>


            {/* Updated Sidebar with Circular Progress Design */}
            <div className="sticky top-4 max-h-screen overflow-y-auto">
              <Card className="sticky top-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" style={{willChange: 'transform'}}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-900 text-base md:text-lg">Your Solar Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group relative border-2 border-green-200 hover:border-green-400 h-24"
                      onClick={() => {
                        setShowSavingsModal(true)
                        // Tab will be set by useEffect based on includeBattery state
                      }}
                    >
                      <CardContent className="p-3 text-center h-full flex flex-col justify-center">
                        <p className="text-xs text-gray-600 mb-1">ANNUAL SAVINGS</p>
                        <p className="text-xl font-bold text-green-600" style={{minWidth: '80px', fontVariantNumeric: 'tabular-nums'}}>
                          €{totalAnnualSavings}
                        </p>
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          <Eye className="w-3 h-3" />
                        </div>
                        <div className="absolute bottom-1 right-1 text-xs text-gray-500 opacity-70">
                          Click for details
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className="bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group relative border-2 border-blue-200 hover:border-blue-400 h-24"
                      onClick={() => {
                        setShowSavingsModal(true)
                        // Tab will be set by useEffect based on includeBattery state
                      }}
                    >
                      <CardContent className="p-3 text-center h-full flex flex-col justify-center">
                        <p className="text-xs text-gray-600 mb-1">PAYBACK PERIOD</p>
                        <p className="text-xl font-bold text-blue-600" style={{minWidth: '70px', fontVariantNumeric: 'tabular-nums'}}>{paybackPeriod} yrs</p>
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          <Eye className="w-3 h-3" />
                        </div>
                        <div className="absolute bottom-1 right-1 text-xs text-gray-500 opacity-70">
                          Click for details
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Investment Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800">Your Investment</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">System price</span>
                        <span className="font-semibold" style={{fontVariantNumeric: 'tabular-nums', minWidth: '80px', textAlign: 'right'}}>€{systemBaseCost.toLocaleString()}</span>
                      </div>

                      {includeBattery && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Battery cost ({batteryCount * (selectedBattery.capacity || 0)}kWh)</span>
                          <span className="font-semibold" style={{fontVariantNumeric: 'tabular-nums', minWidth: '80px', textAlign: 'right'}}>€{batteryCost.toLocaleString()}</span>
                        </div>
                      )}

                      {includeEVChargerEquipment && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">EV charger <span className="text-xs text-gray-500">incl. 13.5% VAT</span></span>
                          <span className="font-semibold" style={{fontVariantNumeric: 'tabular-nums', minWidth: '80px', textAlign: 'right'}}>€{(selectedEVCharger.price || 0).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-gray-700 font-medium">Price you pay</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold" style={{fontVariantNumeric: 'tabular-nums', minWidth: '90px', textAlign: 'right'}}>€{totalSystemCost.toLocaleString()}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              {/* <Button variant="ghost" size="icon" className="w-5 h-5 text-blue-600">
                                <Info className="w-3 h-3" />
                              </Button> */}
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader className="relative">
                                <DialogClose asChild>
                                  <button
                                    className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    ×
                                  </button>
                                </DialogClose>
                                <DialogTitle className="pr-8">System Cost Breakdown</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                  <span>Solar Hardware</span>
                                  <span>€{systemBaseCost.toLocaleString()}</span>
                                </div>
                                {includeBattery && (
                                  <div className="flex justify-between py-2 border-b">
                                    <span>Battery Hardware ({batteryCount * (selectedBattery.capacity || 0)}kWh)</span>
                                    <span>€{batteryCost.toLocaleString()}</span>
                                  </div>
                                )}
                                {includeEVChargerEquipment && (
                                  <div className="flex justify-between py-2 border-b">
                                    <span>EV Charger <span className="text-xs text-gray-500">incl. 13.5% VAT</span></span>
                                    <span>€{(selectedEVCharger.price || 0).toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between py-2 font-bold">
                                  <span>Total</span>
                                  <span>€{totalSystemCost.toLocaleString()}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {isEligibleForSEAIGrant && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>SEAI Grant</span>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-5 h-5 text-blue-600">
                                  <Info className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[66vh] overflow-y-auto">
                                <DialogHeader className="relative">
                                  <DialogClose asChild>
                                    <button
                                      className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </DialogClose>
                                  <DialogTitle className="flex items-center gap-2 text-xl font-bold pr-8">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                    SEAI Grant Information
                                  </DialogTitle>
                                  <p className="text-sm text-gray-600">
                                    Learn about the government grant available for solar PV installations.
                                  </p>
                                </DialogHeader>
                                <div className="space-y-3">
                                  <p className="text-gray-700">
                                    The Sustainable Energy Authority of Ireland (SEAI) provides grants up to €1,800 for solar
                                    PV installations to encourage renewable energy adoption.
                                  </p>
                                  
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-base font-medium text-blue-800 mb-1">
                                      Was your house built before 31st December 2020?
                                    </p>
                                    <p className="text-sm text-blue-700">
                                      SEAI grant only applies to homes built before this date.
                                    </p>
                                  </div>

                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>• Max grant amount: €1,800</li>
                                    <li>• Eligibility criteria apply (e.g., BER rating, property type)</li>
                                    <li>• Applied directly by your installer</li>
                                  </ul>
                                  <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700">
                                    <p>
                                      Disclaimer: Grant amounts and eligibility are subject to SEAI terms and conditions and may change.
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <span className="font-semibold">-€{seaiGrant.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {includeEVChargerEquipment && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>EV Charger Grant</span>
                          <span className="font-semibold">-€{evChargerGrant.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">Net investment</span>
                        <span className="text-2xl font-bold text-green-600">€{finalPrice.toLocaleString()}</span>
                      </div>
                        {/* <p className="text-center text-sm text-gray-600 mt-1">
                        or from €{(() => {
                          // 5 year term, 4.99% APR, finalPrice is principal
                          const principal = (systemBaseCost + batteryCost);
                          const annualRate = 0.0499;
                          const monthlyRate = annualRate / 12;
                          const months = 60;
                          // Monthly payment formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
                          const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
                          return Math.round(payment);
                        })()}/month with financing
                        </p> */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 italic text-center">
                          Price excludes any current promotional offers. Please contact us for details about available promotions.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 pt-2">
                    {/* Primary CTA - Book Free Consultation */}
                    <Button 
                      className="w-full h-12 !px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl" 
                      onClick={() => router.push('/call-page')}
                    >
                      <Calendar className="w-5 h-5" />
                      Book Free Consultation
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        No Obligation
                      </span>
                    </Button>
                    
                   

                    {/* Secondary CTA - Download Plan */}
                    <Dialog 
                      open={showSavePlanDialog} 
                      onOpenChange={(open) => {
                        setShowSavePlanDialog(open);
                        if (!open) {
                          // Reset form state when dialog closes
                          setSubmitError("");
                          setIsSubmitting(false);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all duration-200"
                        >
                          <FileChartColumnIncreasing className="w-4 h-4 mr-2" />
                          View My Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        {emailSubmissionSuccess ? (
                          // Success State
                          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-5 relative">
                            {/* Close Button */}
                            <DialogClose asChild>
                              <button
                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
                              >
                                ×
                              </button>
                            </DialogClose>
                            
                            {/* Header Section - More friendly */}
                            <div className="text-center space-y-1 sm:space-y-2">
                              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                                <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              </div>
                              <div>
                                <h1 className="text-base sm:text-lg font-bold text-foreground">Your Report is On Its Way! 🚀</h1>
                                <p className="text-xs sm:text-sm text-muted-foreground">We've got your solar plan ready</p>
                              </div>
                            </div>

                            {/* Email Confirmation - More friendly */}
                            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 border border-blue-200">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                <p className="text-xs sm:text-sm font-medium text-foreground break-all">Sent to: {email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">Should arrive within 60 seconds</p>
                              </div>
                              <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                                <p className="text-xs font-medium text-gray-800">
                                  📧 Check your inbox, spam & promotions folders (just in case) 😊
                                </p>
                              </div>
                            </div>

                            {/* Value Proposition - More friendly */}
                            <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                              <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Got questions about your plan? 🤔</p>
                              <p className="text-xs text-muted-foreground">
                                Let's chat! No pressure, just friendly advice on design & grants
                              </p>
                            </div>

                            {/* Action Buttons - More human phrasing */}
                            <div className="space-y-1 sm:space-y-2">
                              <Button
                                onClick={() => {
                                  setShowSavePlanDialog(false);
                                  setAppNavigation();
                                  router.push('/call-page');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Let's Chat - No Pressure! ☎️
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowSavePlanDialog(false);
                                  router.push('/review-report');
                                }}
                                className="w-full border border-blue-200 text-gray-700 hover:bg-blue-50 font-medium py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 bg-white"
                              >
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                I'll Take a Look First 👀
                              </Button>
                            </div>

                            {/* Footer - Minimal */}
                            <div className="text-center pt-1 sm:pt-2 border-t border-blue-100">
                              <p className="text-xs text-gray-600">
                                Questions or need help?{" "}
                                    {branding.email && (
                                      <a href={`mailto:${branding.email}`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                      {branding.email}
                                      </a>
                                    )}
                              </p>
                            </div>
                          </div>
                        
                        ) : (
                          // Form State
                          <>
                            <DialogHeader className="text-center pb-4 relative">
                              <DialogClose asChild>
                                <button
                                  className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  ×
                                </button>
                              </DialogClose>
                              <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                                View My Proposal
                              </DialogTitle>
                              <p className="text-gray-600 mt-2">
                                Get your detailed plan emailed to you with financing options and next steps.
                              </p>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Full Name Field */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    type="text"
                                    placeholder="Your Full Name"
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    className="pl-10 h-12 text-gray-600"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Email Field */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                  <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="pl-10 h-12 text-gray-600"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Agreement Checkbox */}
                              <div className="flex items-start space-x-2 pt-2">
                                <Checkbox 
                                  id="agree-terms"
                                  checked={agreeToTerms}
                                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                                  className="mt-1"
                                />
                                <label htmlFor="agree-terms" className="text-sm text-gray-700 leading-5">
                                  I agree to receive my personalised energy upgrade report by email from Voltflo. No spam, no follow-ups. <span className="text-red-500">*</span>
                                </label>
                              </div>

                              {/* Error Message */}
                              {submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm text-red-600">{submitError}</p>
                                </div>
                              )}

                              {/* Submit Button */}
                              <Button 
                                onClick={handleSavePlan}
                                disabled={!fullName.trim() || !email.trim() || !agreeToTerms || isSubmitting}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium mt-6 disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending Plan...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email My Solar Plan
                                  </>
                                )}
                              </Button>

                              {/* Footer Text */}
                              <div className="text-xs text-gray-600 text-center pt-2 leading-4">
                                By clicking 'Email My Solar Plan', you agree to Voltflo's{" "}
                                <a target="_blank" href="https://voltflo.com/PrivacyPolicy" className="text-green-600 underline">Privacy Policy</a> and{" "}
                                <a target="_blank" href="https://voltflo.com/TermsOfUse" className="text-green-600 underline">Terms of Use</a>. 
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <span className="font-medium">Provisional figures</span> - Final costs confirmed after site visit
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Bill Editor Dialog */}
      <Dialog open={showBillEditor} onOpenChange={setShowBillEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader className="relative">
            <DialogClose asChild>
              <button
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                ×
              </button>
            </DialogClose>
            <DialogTitle className="pr-8">Edit Your Current Energy Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Average Irish household: €2,200-€3,000/year</p>
            </div>

            {/* Toggle between monthly/annual */}
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setBillInputMode("monthly")}
                  className={`px-3 py-1 rounded text-sm ${
                    billInputMode === "monthly" ? "bg-white shadow-sm font-medium" : "text-gray-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillInputMode("annual")}
                  className={`px-3 py-1 rounded text-sm ${
                    billInputMode === "annual" ? "bg-white shadow-sm font-medium" : "text-gray-600"
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            {/* Slider and input */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  €{billInputMode === "monthly" ? Math.round(customAnnualBill / 12) : customAnnualBill}
                </div>
                <div className="text-sm text-gray-600">{billInputMode === "monthly" ? "per month" : "per year"}</div>
              </div>

              <input
                type="range"
                min={billInputMode === "monthly" ? 100 : 1200}
                max={billInputMode === "monthly" ? 500 : 6000}
                step={billInputMode === "monthly" ? 10 : 100}
                value={billInputMode === "monthly" ? Math.round(customAnnualBill / 12) : customAnnualBill}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  setCustomAnnualBill(billInputMode === "monthly" ? value * 12 : value)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>€{billInputMode === "monthly" ? "100" : "1,200"}</span>
                <span>€{billInputMode === "monthly" ? "500" : "6,000"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCustomAnnualBill(2640)} className="flex-1">
                Reset to Default
              </Button>
              <Button onClick={() => setShowBillEditor(false)} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-xl mx-auto bg-background border-0 shadow-2xl">
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-5">
            {/* Header Section - More friendly */}
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground">Your Report is On Its Way! 🚀</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">We've got your solar plan ready</p>
              </div>
            </div>

            {/* Email Confirmation - More friendly */}
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 border border-blue-200">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-foreground break-all">Sent to: {email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">Should arrive within 60 seconds</p>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                <p className="text-xs font-medium text-gray-800">
                  📧 Check your inbox, spam & promotions folders (just in case) 😊
                </p>
              </div>
            </div>

            {/* Value Proposition - More friendly */}
            <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Got questions about your plan? 🤔</p>
              <p className="text-xs text-muted-foreground">
                Let's chat! No pressure, just friendly advice on design & grants
              </p>
            </div>

            {/* Action Buttons - More human phrasing */}
            <div className="space-y-1 sm:space-y-2">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/call-page');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Let's Chat - No Pressure! ☎️
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/review-report');
                }}
                className="w-full border border-blue-200 text-gray-700 hover:bg-blue-50 font-medium py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 bg-white"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                I'll Take a Look First 👀
              </Button>
            </div>

            {/* Footer - Minimal */}
            <div className="text-center pt-1 sm:pt-2 border-t border-blue-100">
              <p className="text-xs text-gray-600">
               Questions or need help?{" "}
                {branding.email && (
                  <a href={`mailto:${branding.email}`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  {branding.email}
                  </a>
                )}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Savings Modal */}
      <Dialog open={showSavingsModal} onOpenChange={setShowSavingsModal}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader className="relative">
            <DialogClose asChild>
              <button
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </DialogClose>
            <DialogTitle className="flex items-center gap-2 pr-8">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              How Your Savings Are Calculated
            </DialogTitle>
          </DialogHeader>
          <Tabs value={savingsModalTab} onValueChange={(value) => {
            setSavingsModalTab(value)
            // Sync with main battery toggle
            if (value === "solarOnly") {
              setIncludeBattery(false)
            } else if (value === "hybrid" || value === "nightCharge") {
              setIncludeBattery(true)
            }
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="solarOnly">Solar Only</TabsTrigger>
              <TabsTrigger value="nightCharge">Solar + Battery (Arbitrage)</TabsTrigger>
              <TabsTrigger value="hybrid">Solar + Battery</TabsTrigger>  
            </TabsList>

            <TabsContent value="solarOnly" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className="bg-blue-100 p-4 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => setShowEnergyProfileModal(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Current Profile:{" "}
                          {energyProfile === "family"
                            ? "Family home"
                            : energyProfile === "small"
                              ? "Small home"
                              : energyProfile === "big"
                                ? "Big energy use"
                                : "Custom"}
                        </p>
                        <p className="text-xs text-blue-600">
                          Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <span className="text-xs">Edit</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Solar Only</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your panels power your home during the day. Extra energy is sold back to the grid.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Direct Solar Use</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              30% × annual generation × €0.35
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-green-600 font-medium">€{scenarios.solarOnly.directSavings}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Export Income</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              70% × annual generation × €0.20
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium">€{scenarios.solarOnly.exportIncome}</span>
                      </div>

                      <div className="border-t pt-3 flex justify-between font-bold">
                        <span>Total Benefit</span>
                        <span className="text-green-600 text-lg">€{scenarios.solarOnly.total}</span>
                      </div>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={() => setShowMaths(showMaths === "solarOnly" ? null : "solarOnly")}
                        className="w-full p-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>Show calculation breakdown</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showMaths === "solarOnly" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showMaths === "solarOnly" && (
                        <div className="px-3 pb-3 text-xs text-gray-600 bg-gray-50 border-t">
                          <div className="space-y-1">
                            <div>• Annual generation: {scenarios.solarOnly.calculations.generation} kWh</div>
                            <div>
                              • Direct use (
                              {Math.round(
                                (scenarios.solarOnly.calculations.baseSelfUseKWh /
                                  scenarios.solarOnly.calculations.generation) *
                                  100,
                              )}
                              %): {scenarios.solarOnly.calculations.baseSelfUseKWh} kWh × €0.35 = €
                              {scenarios.solarOnly.directSavings}
                            </div>
                            <div>
                              • Export (
                              {Math.round(
                                (scenarios.solarOnly.calculations.exportKWh /
                                  scenarios.solarOnly.calculations.generation) *
                                  100,
                              )}
                              %): {scenarios.solarOnly.calculations.exportKWh} kWh × €0.20 = €
                              {scenarios.solarOnly.exportIncome}
                            </div>
                            <div className="font-medium pt-1 border-t">Total: €{scenarios.solarOnly.total}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Figures are estimates based on your inputs, typical Irish tariffs, and average conditions. Final
                    design and pricing confirmed after site visit.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hybrid" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className="bg-blue-100 p-4 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => setShowEnergyProfileModal(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Current Profile:{" "}
                          {energyProfile === "family"
                            ? "Family home"
                            : energyProfile === "small"
                              ? "Small home"
                              : energyProfile === "big"
                                ? "Big energy use"
                                : "Custom"}
                        </p>
                        <p className="text-xs text-blue-600">
                          Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <span className="text-xs">Edit</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">Solar + Battery</h3>
                      <div className="relative group">
                        <Info className="w-4 h-4 text-blue-500 cursor-help hover:text-blue-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="font-medium mb-2">Battery Benefits</div>
                          <div className="text-gray-600 mb-2">
                            Maximize your solar energy consumption and reduce grid dependency:
                          </div>
                          <div className="text-xs text-gray-700 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span><strong>Without battery:</strong> Only 30% solar consumption</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span><strong>With 1 battery:</strong> 70-80% solar consumption</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span><strong>With 2 batteries:</strong> 80-90% solar consumption</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="text-gray-600 mb-1">
                                <strong>Economic Benefit:</strong>
                              </div>
                              <div>• Grid rate: €0.35/kWh</div>
                              <div>• Export rate: €0.20/kWh</div>
                              <div className="text-green-600 font-medium mt-1">
                                Self-consumption saves €0.15/kWh more than exporting!
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Solar powers your home first. Extra solar charges your battery for evening use. Any leftover is sold
                      back to the grid.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Direct Solar + Battery Use</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              Self-use includes baseline + battery benefit.
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-green-600 font-medium">€{scenarios.hybrid.directSavings}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Export Income</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              Any remaining generation sold at €0.20/kWh.
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium">€{scenarios.hybrid.exportIncome}</span>
                      </div>

                      <div className="border-t pt-3 flex justify-between font-bold">
                        <span>Total Benefit</span>
                        <span className="text-green-600 text-lg">€{scenarios.hybrid.total}</span>
                      </div>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={() => setShowMaths(showMaths === "hybrid" ? null : "hybrid")}
                        className="w-full p-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>Show calculation breakdown</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showMaths === "hybrid" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showMaths === "hybrid" && (
                        <div className="px-3 pb-3 text-xs text-gray-600 bg-gray-50 border-t">
                          <div className="space-y-1">
                            <div>• Annual generation: {scenarios.hybrid.calculations.generation} kWh</div>
                            <div>
                              • Total self-use: {scenarios.hybrid.calculations.totalSelfUseKWh} kWh × €0.35 = €
                              {scenarios.hybrid.directSavings}
                            </div>
                            <div>
                              • Export: {scenarios.hybrid.calculations.exportKWh} kWh × €0.20 = €
                              {scenarios.hybrid.exportIncome}
                            </div>
                            <div>• Battery throughput: {scenarios.hybrid.calculations.batteryThroughput} kWh/year</div>
                            <div className="font-medium pt-1 border-t">Total: €{scenarios.hybrid.total}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">⚡</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Battery Configuration</span>
                          <p className="text-xs text-gray-600">Choose your storage capacity</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">Units:</span>
                        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                          <button
                            onClick={() => setBatteryCount(1)}
                            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                              batteryCount === 1 
                                ? "bg-blue-500 text-white shadow-sm" 
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            1 Battery
                          </button>
                          <button
                            onClick={() => setBatteryCount(2)}
                            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                              batteryCount === 2 
                                ? "bg-blue-500 text-white shadow-sm" 
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            2 Batteries
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                      <span></span>
                      <span>Total Capacity: {batteryCount * (selectedBattery.capacity || 0)}kWh</span>
                    </div>
                  </div>

                  {batteryCount === 2 && scenarios.hybrid.batteryUtilization < 70 && !hasEV && !hasHeatPump && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-600">⚠️</span>
                      <span className="text-sm text-amber-700">
                        Second battery may be under-used (~{Math.round(scenarios.hybrid.batteryUtilization)}%). Best
                        value if adding EV or heat pump.
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Figures are estimates based on your inputs, typical Irish tariffs, and average conditions. Final
                    design and pricing confirmed after site visit.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nightCharge" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className="bg-blue-100 p-4 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => setShowEnergyProfileModal(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Current Profile:{" "}
                          {energyProfile === "family"
                            ? "Family home"
                            : energyProfile === "small"
                              ? "Small home"
                              : energyProfile === "big"
                                ? "Big energy use"
                                : "Custom"}
                        </p>
                        <p className="text-xs text-blue-600">
                          Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <span className="text-xs">Edit</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">Solar + Battery (Night Charge)</h3>
                      <div className="relative group">
                        <Info className="w-4 h-4 text-blue-500 cursor-help hover:text-blue-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          <div className="font-medium mb-2">Night Charge Strategy</div>
                          <div className="text-gray-600 mb-2">
                            Maximize battery value by storing cheap night electricity and selling solar to grid:
                          </div>
                          <div className="text-xs text-gray-700 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span><strong>Solar Export:</strong> Sell solar generation to grid at €0.20/kWh</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span><strong>Night Charging:</strong> Store cheap electricity (€{branding.energy.gridRateNight.toFixed(2)}/kWh) at night</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span><strong>Peak Usage:</strong> Use stored battery power during expensive peak hours</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="text-gray-600 mb-1">
                                <strong>Economic Benefit:</strong>
                              </div>
                              <div>• Night rate: €{branding.energy.gridRateNight.toFixed(2)}/kWh</div>
                              <div>• Peak rate: €0.35/kWh</div>
                              <div className="text-green-600 font-medium mt-1">
                                Night charging saves €0.27/kWh on battery cycles!
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Solar export provides steady income. Battery charges at night with cheap electricity and powers your home during peak hours.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Solar Export Income</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              100% of annual generation sold at €0.20/kWh.
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium">€{Math.round(annualPVGeneration * 1.0 * exportRate)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Battery Night Charge Savings</span>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-48">
                              {batteryCount * (selectedBattery.capacity || 0)}kW × 90% efficiency × 315 cycles × €0.27 savings.
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-green-600 font-medium">€{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</span>
                      </div>

                      <div className="border-t pt-3 flex justify-between font-bold">
                        <span>Total Benefit</span>
                        <span className="text-green-600 text-lg">€{Math.round(annualPVGeneration * 1.0 * exportRate + batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</span>
                      </div>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={() => setShowMaths(showMaths === "nightCharge" ? null : "nightCharge")}
                        className="w-full p-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>Show calculation breakdown</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showMaths === "nightCharge" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showMaths === "nightCharge" && (
                        <div className="px-3 pb-3 text-xs text-gray-600 bg-gray-50 border-t">
                          <div className="space-y-1">
                            <div>• Annual generation: {annualPVGeneration} kWh</div>
                            <div>
                              • Solar export (100%): {Math.round(annualPVGeneration * 1.0)} kWh × €0.20 = €{Math.round(annualPVGeneration * 1.0 * exportRate)}
                            </div>
                            <div>
                              • Battery capacity: {batteryCount * (selectedBattery.capacity || 0)}kWh × 90% efficiency = {Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9)}kWh usable
                            </div>
                            <div>
                              • Night charge cycles: 315 cycles/year × €0.27 savings = €{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}
                            </div>
                            <div className="font-medium pt-1 border-t">Total: €{Math.round(annualPVGeneration * 1.0 * exportRate + batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">🌙</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Night Charge Strategy</span>
                          <p className="text-xs text-gray-600">Arbitrage with off-peak electricity</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">Units:</span>
                        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                          <button
                            onClick={() => setBatteryCount(1)}
                            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                              batteryCount === 1 
                                ? "bg-green-500 text-white shadow-sm" 
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            1 Battery
                          </button>
                          <button
                            onClick={() => setBatteryCount(2)}
                            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
                              batteryCount === 2 
                                ? "bg-green-500 text-white shadow-sm" 
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            2 Batteries
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                      <span>Night cycles: {Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315)} kWh/year</span>
                      <span>Arbitrage savings: €{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}/year</span>
                    </div>
                  </div>

                  {batteryCount === 2 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-600">💡</span>
                      <span className="text-sm text-amber-700">
                        Adding a second battery extends your backup time and maximizes savings under time-of-use tariffs.
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Figures are estimates based on your inputs, typical Irish tariffs, and average conditions. Final
                    design and pricing confirmed after site visit.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Energy Profile Edit Modal */}
      <Dialog open={showEnergyProfileModal} onOpenChange={setShowEnergyProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              Edit Your Energy Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="monthlyBill" className="text-sm font-medium text-gray-700">
                Monthly Electricity Bill (€)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  id="monthlyBill"
                  type="number"
                  value={tempMonthlyBill}
                  onChange={(e) => setTempMonthlyBill(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="220"
                  min="50"
                  max="1000"
                />
              </div>
              <p className="text-xs text-gray-500">
                Annual bill: €{((parseFloat(tempMonthlyBill) || 0) * 12).toLocaleString()} • Daily usage: ~{Math.round(((parseFloat(tempMonthlyBill) || 0) * 12) / gridRate / 365)} kWh
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Energy Profile Guide</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div>• Small home: €50-150/month</div>
                <div>• Family home: €150-250/month</div>
                <div>• Big energy use: €250+/month</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempMonthlyBill(monthlyBill.toString()) // Reset to original value
                  setShowEnergyProfileModal(false)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBillAmount}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {/* ==================== DESKTOP VIEW END ==================== */}
        </div>
      )}
    </>
  )
}

// ==================== MOBILE VIEW COMPONENT START ====================
interface SolarDashboardMobileProps {
  basePanelCount: number;
  setBasePanelCount: (count: number) => void;
  totalPanelCount: number;
  maxPanels: number;
  recommendedPanelCount: number;
  powerOutageBackup: boolean;
  setPowerOutageBackup: (backup: boolean) => void;
  includeBattery: boolean;
  setIncludeBattery: (include: boolean) => void;
  batteryCount: number;
  setBatteryCount: (count: number) => void;
  includeEVCharger: boolean;
  setIncludeEVCharger: (include: boolean) => void;
  includeEVChargerEquipment: boolean;
  setIncludeEVChargerEquipment: (include: boolean) => void;
  includeHeatPump: boolean;
  setIncludeHeatPump: (include: boolean) => void;
  selectedSolarPanel: any;
  setSelectedSolarPanel: (panel: any) => void;
  selectedInverter: any;
  setSelectedInverter: (inverter: any) => void;
  selectedBattery: any;
  setSelectedBattery: (battery: any) => void;
  selectedEVCharger: any;
  setSelectedEVCharger: (charger: any) => void;
  solarPanelOptions: any[];
  inverterOptions: any[];
  batteryOptions: any[];
  evChargerOptions: any[];
  systemBaseCost: number;
  batteryCost: number;
  evChargerCost: number;
  totalSystemCost: number;
  seaiGrant: number;
  isEligibleForSEAIGrant: boolean;
  evChargerGrant: number;
  totalGrants: number;
  solarAnnualSavings: number;
  batteryAnnualSavings: number;
  batteryNightChargeSavings: number;
  totalAnnualSavings: number;
  finalPrice: number;
  paybackPeriod: string;
  billOffset: number;
  customAnnualBill: number;
  setCustomAnnualBill: (bill: number) => void;
  showBillEditor: boolean;
  setShowBillEditor: (show: boolean) => void;
  billInputMode: string;
  setBillInputMode: (mode: any) => void;
  getRecommendationText: () => string;
  evPanelsNeeded: number;
  heatPumpPanelsNeeded: number;
  perPanelGeneration: number;
  annualPVGeneration: number;
  router: any;
  // Download plan functionality
  showSavePlanDialog: boolean;
  setShowSavePlanDialog: (show: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (agree: boolean) => void;
  isSubmitting: boolean;
  submitError: string;
  handleFullNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSavePlan: () => Promise<void>;
  emailSubmissionSuccess: boolean;
  scenarioFractions: { selfUse: number; export: number };
  showSavingsModal: boolean;
  setShowSavingsModal: (show: boolean) => void;
  savingsModalTab: string;
  setSavingsModalTab: (tab: string) => void;
  showEnergyProfileModal: boolean;
  setShowEnergyProfileModal: (show: boolean) => void;
  tempMonthlyBill: string;
  setTempMonthlyBill: (bill: string) => void;
  handleSaveBillAmount: () => void;
  energyProfile: string;
  dailyUsageKwh: number;
  monthlyBill: number;
  gridRate: number;
  hasEV: boolean;
  hasHeatPump: boolean;
  scenarios: any;
  showMaths: string | null;
  setShowMaths: (show: string | null) => void;
  branding: any;
}

function SolarDashboardMobile(props: SolarDashboardMobileProps) {
  const {
    basePanelCount,
    setBasePanelCount,
    totalPanelCount,
    maxPanels,
    recommendedPanelCount,
    powerOutageBackup,
    setPowerOutageBackup,
    includeBattery,
    setIncludeBattery,
    batteryCount,
    setBatteryCount,
    includeEVCharger,
    setIncludeEVCharger,
    includeEVChargerEquipment,
    setIncludeEVChargerEquipment,
    includeHeatPump,
    setIncludeHeatPump,
    selectedSolarPanel,
    setSelectedSolarPanel,
    selectedInverter,
    setSelectedInverter,
    selectedBattery,
    setSelectedBattery,
    selectedEVCharger,
    setSelectedEVCharger,
    solarPanelOptions,
    branding,
    inverterOptions,
    batteryOptions,
    evChargerOptions,
    systemBaseCost,
    batteryCost,
    evChargerCost,
    totalSystemCost,
    seaiGrant,
    isEligibleForSEAIGrant,
    evChargerGrant,
    totalGrants,
    solarAnnualSavings,
    batteryAnnualSavings,
    batteryNightChargeSavings,
    totalAnnualSavings,
    finalPrice,
    paybackPeriod,
    billOffset,
    customAnnualBill,
    setCustomAnnualBill,
    showBillEditor,
    setShowBillEditor,
    billInputMode,
    setBillInputMode,
    getRecommendationText,
    evPanelsNeeded,
    heatPumpPanelsNeeded,
    perPanelGeneration,
    annualPVGeneration,
    router,
    showSavePlanDialog,
    setShowSavePlanDialog,
    showSuccessModal,
    setShowSuccessModal,
    fullName,
    setFullName,
    email,
    setEmail,
    agreeToTerms,
    setAgreeToTerms,
    isSubmitting,
    submitError,
    handleFullNameChange,
    handleEmailChange,
    handleSavePlan,
    emailSubmissionSuccess,
    scenarioFractions,
    showSavingsModal,
    setShowSavingsModal,
    savingsModalTab,
    setSavingsModalTab,
    showEnergyProfileModal,
    setShowEnergyProfileModal,
    tempMonthlyBill,
    setTempMonthlyBill,
    handleSaveBillAmount,
    energyProfile,
    dailyUsageKwh,
    monthlyBill,
    gridRate,
    hasEV,
    hasHeatPump,
    scenarios,
    showMaths,
    setShowMaths,
  } = props;

  // Equipment selection state
  const [showSolarEquipment, setShowSolarEquipment] = useState(false)
  
  // Panel sizing feedback - Mobile optimized with shorter messages
  const getPanelSizingMessage = () => {
    // Check if at maximum roof capacity
    if (totalPanelCount >= maxPanels) {
      return {
        type: "max_capacity",
        message: `Max capacity: ${maxPanels} panels on your roof`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      }
    } else if (basePanelCount > recommendedPanelCount) {
      const extraPanels = basePanelCount - recommendedPanelCount
      return {
        type: "oversized",
        message: `+${extraPanels} extra panels - Future-ready for EV & heat pump`,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      }
    } 
    // else if (basePanelCount < recommendedPanelCount) {
    //   const missingPanels = recommendedPanelCount - basePanelCount
    //   const coveragePercent = Math.round((basePanelCount / recommendedPanelCount) * 100)
    //   return {
    //     type: "undersized",
    //     message: `${missingPanels} panels below recommended - ${coveragePercent}% coverage`,
    //     color: "text-orange-600",
    //     bgColor: "bg-orange-50",
    //     borderColor: "border-orange-200",
    //   }
    // }
    return null
  }

  const panelSizingMessage = getPanelSizingMessage()
  
  // Scroll state for sticky bar visibility
  const [showStickyBar, setShowStickyBar] = useState(true)

  // Scroll handler for sticky bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Hide sticky bar when user reaches the bottom (within 100px)
      const nearBottom = scrollPosition + windowHeight >= documentHeight - 100
      setShowStickyBar(!nearBottom)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const gridIndependence = batteryCount >= 2 ? 95 : (includeBattery ? 90 : 30)
  const billBefore = customAnnualBill
  const systemPriceBeforeGrant = totalSystemCost

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="/images/plan-hero-image.png"
          alt="Modern home with solar panels and EV charger"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 text-white">
          <h1 className="text-lg font-bold">Your Personal Energy Plan</h1>
          <p className="text-xs opacity-90">Build your perfect solar + battery system</p>
        </div>
      </div>

      <main className="p-4 space-y-6 pb-6">
        {/* Customize Your System */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                1
              </div>
              Customize Your System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Solar Summary */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Solar System <br></br> (€{totalAnnualSavings} savings/year)</h3>
                <p className="text-xs text-gray-600">
                  {totalPanelCount} panels • {(totalPanelCount * parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.45')).toFixed(2)} kWp
                </p>
                <p className="text-[11px] text-green-700">{getRecommendationText()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Hardware</p>
                <p className="text-lg font-bold">€{systemBaseCost.toLocaleString()}</p>
              </div>
            </div>

            {/* Panel Count Control */}
            <div className="flex items-center justify-between gap-4 bg-gray-100 p-2 rounded-lg">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setBasePanelCount(Math.max(8, basePanelCount - 1))}
                disabled={basePanelCount <= 8}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold">{totalPanelCount}</span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  const newBasePanelCount = Math.min(maxPanels, basePanelCount + 1)
                  setBasePanelCount(newBasePanelCount)
                }}
                disabled={totalPanelCount >= maxPanels}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Panel Sizing Feedback - Mobile Optimized */}
            {panelSizingMessage && (
              <div
                className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${panelSizingMessage.bgColor} ${panelSizingMessage.borderColor}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {panelSizingMessage.type === "max_capacity" && (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  )}
                  {panelSizingMessage.type === "oversized" && (
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                  )}
                  {panelSizingMessage.type === "undersized" && (
                    <Info className="w-3 h-3 text-orange-600" />
                  )}
                </div>
                <p className={`font-medium ${panelSizingMessage.color} flex-1`}>
                  {panelSizingMessage.message}
                </p>
              </div>
            )}

            {/* Power Outage Backup */}
            <div className="flex items-start gap-3">
              {/* <Checkbox
                id="backup"
                checked={powerOutageBackup}
                onCheckedChange={setPowerOutageBackup}
                className="mt-0.5"
              /> */}
              <label htmlFor="backup" className="text-sm">
                <span className="font-medium">Power outage backup?</span>
                <p className="text-xs text-gray-600">Use your system during grid outages.</p>
              </label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto w-6 h-6 text-blue-600">
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm max-h-[66vh] overflow-y-auto">
                  <DialogHeader className="relative">
                    <DialogClose asChild>
                      <button
                        className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ×
                      </button>
                    </DialogClose>
                    <DialogTitle className="flex items-center gap-2 pr-8">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Did You Know? Backup Options
                    </DialogTitle>
                    <p className="text-xs text-gray-600">
                      Important considerations for using your system during grid outages.
                    </p>
                  </DialogHeader>
                  <div className="space-y-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Most installers don't tell you this:</strong> To use your solar and battery during power outages, you need specific equipment installed from the start.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <h4 className="font-semibold text-green-800">Option 1: Hybrid Inverter</h4>
                        </div>
                        <p className="text-xs text-gray-700 mb-1">Automatically switches to battery power during outages</p>
                        <ul className="text-[10px] text-gray-600 space-y-0.5">
                          <li>• Seamless backup power</li>
                          <li>• No manual intervention needed</li>
                          <li>• Premium option</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <h4 className="font-semibold text-orange-800">Option 2: Standard Inverter + Changeover Switch</h4>
                        </div>
                        <p className="text-xs text-gray-700 mb-1">Requires manual switching during outages</p>
                        <ul className="text-[10px] text-gray-600 space-y-0.5">
                          <li>• Must be installed at point of solar installation</li>
                          <li>• Manual switch to battery power</li>
                          <li>• More affordable option</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-lg text-[10px] text-gray-700">
                      <p>
                        Important: This cannot be easily added later - it must be planned and installed with your solar system.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Battery Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Battery className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Battery Storage</h3>
                    <p className="text-xs text-gray-600">€{batteryNightChargeSavings}/year from night electricity</p>
                  </div>
                </div>
                <Switch checked={includeBattery} onCheckedChange={setIncludeBattery} />
              </div>
              {includeBattery && (
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Hardware:</span>
                    <span className="font-semibold text-sm">€{batteryCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Night charge savings:</span>
                    <span className="font-semibold text-sm text-green-600">€{batteryNightChargeSavings}/year</span>
                  </div>
                  
                  {/* Battery Quantity Controls - Mobile */}
                  <div className="flex items-center justify-center gap-3 bg-gray-100 p-3 rounded-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setBatteryCount(Math.max(1, batteryCount - 1))}
                      disabled={batteryCount <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <div className="text-sm font-bold">
                        {batteryCount}x {selectedBattery.capacity || 0}kWh
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {batteryCount * (selectedBattery.capacity || 0)}kWh storage
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setBatteryCount(Math.min(2, batteryCount + 1))}
                      disabled={batteryCount >= 2}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Energy Independence Comparison Cards - Mobile */}
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-sm text-gray-800 text-center">Choose Your Energy Solution</h4>

                {/* Comparison Cards - Mobile Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Solar Only Card - Clickable */}
                  <button
                    onClick={() => setIncludeBattery(false)}
                    className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                      !includeBattery ? "border-orange-400 bg-white shadow-sm" : "border-gray-200 bg-white/70"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Sun className="w-4 h-4 text-orange-500" />
                      </div>
                      <h5 className="font-bold text-xs text-orange-600 mb-1">Solar Only</h5>
                      <div className="text-sm font-bold text-orange-600 mb-1">20-30%</div>
                      <p className="text-[10px] text-gray-600 mb-1">Grid-dependent at night</p>
                      <div className="text-[10px] font-semibold text-gray-500">€0 extra</div>
                    </div>
                  </button>

                  {/* Solar + Battery Card - Clickable */}
                  <button
                    onClick={() => setIncludeBattery(true)}
                    className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                      includeBattery ? "border-blue-500 bg-white shadow-lg ring-1 ring-blue-100" : "border-gray-200 bg-white/70"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                        includeBattery ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Battery className={`w-4 h-4 ${includeBattery ? 'text-blue-600' : 'text-green-600'}`} />
                      </div>
                      <h5 className={`font-bold text-xs mb-1 ${includeBattery ? 'text-blue-700' : 'text-green-700'}`}>Solar + Battery</h5>
                      <div className={`text-sm font-bold mb-1 ${includeBattery ? 'text-blue-600' : 'text-green-600'}`}>{batteryCount >= 2 ? '80-90%' : '70-80%'}</div>
                      <p className="text-[10px] text-gray-600 mb-1">Power day & night</p>
                      <div className={`text-[10px] font-semibold ${includeBattery ? 'text-blue-600' : 'text-green-600'}`}>+€{batteryAnnualSavings}/year</div>
                    </div>
                  </button>
                </div>

                {/* Bottom Insight */}
                <div
                  className={`p-2 rounded-lg border ${
                    includeBattery ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Info
                      className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                        includeBattery ? "text-blue-500" : "text-orange-500"
                      }`}
                    />
                    <p className={`text-xs ${includeBattery ? "text-blue-800" : "text-orange-700"}`}>
                      {includeBattery
                        ? `With ${batteryCount > 1 ? `${batteryCount} batteries` : 'battery storage'} (${batteryCount * (selectedBattery.capacity || 0)}kWh total), you'll use your own solar power even after sunset, ${batteryCount >= 2 ? 'achieving near-complete' : 'dramatically reducing'} grid dependence.`
                        : "Adding battery storage can increase your energy independence from 30% to 85%, powering your home through nights and outages."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment selection */}
            <Collapsible open={showSolarEquipment} onOpenChange={setShowSolarEquipment}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>View Equipment</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSolarEquipment ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {/* Solar Panel Selection */}
                <MobileEquipmentSelector
                  title="Solar Panel"
                  options={solarPanelOptions}
                  value={selectedSolarPanel.id}
                  onChange={(value: string) => {
                    const found = solarPanelOptions.find((p: any) => p.id === value)
                    if (found) setSelectedSolarPanel(found)
                  }}
                  extra={`${selectedSolarPanel.efficiency} • ${selectedSolarPanel.reason}`}
                  imagePath={selectedSolarPanel.image || `/images/solar-panels/${selectedSolarPanel.id}.png`}
                  downloadUrl={selectedSolarPanel.datasheet || "/pdf/jinko_panel.pdf"}
                  downloadName="JinkoSolar_450W_Spec_Sheet.pdf"
                />
                {/* Inverter Selection */}
                <MobileEquipmentSelector
                  title="Inverter"
                  options={inverterOptions}
                  value={selectedInverter.id}
                  onChange={(value: string) => {
                    const found = inverterOptions.find((i: any) => i.id === value)
                    if (found) setSelectedInverter(found)
                  }}
                  extra={`${selectedInverter.efficiency} • ${selectedInverter.reason}${
                    powerOutageBackup ? " • Hybrid recommended for backup" : ""
                  }`}
                  rightBadge={powerOutageBackup ? "Hybrid" : undefined}
                  imagePath={selectedInverter.image || `/images/inverters/${selectedInverter.id}.png`}
                  downloadUrl={selectedInverter.datasheet || "/pdf/sig_inverter.pdf"}
                  downloadName="Sigenergy_Inverter_Spec_Sheet.pdf"
                />
                {/* Battery Selection - Show when battery is enabled */}
                {includeBattery && (
                  <MobileEquipmentSelector
                    title="Battery"
                    options={batteryOptions}
                    value={selectedBattery.id}
                    onChange={(value: string) => {
                      const found = batteryOptions.find((b: any) => b.id === value)
                      if (found) setSelectedBattery(found)
                    }}
                    extra={`${batteryCount}x ${selectedBattery.capacity || 0} kWh (${batteryCount * (selectedBattery.capacity || 0)} kWh total) • ${selectedBattery.reason}`}
                    imagePath={selectedBattery.image || `/images/batteries/${selectedBattery.id}.png`}
                    downloadUrl={selectedBattery.datasheet || "/pdf/sig_battery.pdf"}
                    downloadName={`SigEnergy_Battery_${selectedBattery.capacity || 0}kWh_Spec_Sheet.pdf`}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Future-Proof Your Home */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                2
              </div>
              Future-Proof Your Home
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Planning for an EV?</span>
              </div>
              <Switch 
                checked={includeEVCharger} 
                onCheckedChange={(checked) => {
                  setIncludeEVCharger(checked)
                  // When EV planning is enabled, automatically enable EV charger equipment
                  if (checked) {
                    setIncludeEVChargerEquipment(true)
                  } else {
                    // When EV planning is disabled, automatically disable EV charger equipment
                    setIncludeEVChargerEquipment(false)
                  }
                }} 
              />
            </div>
            {includeEVCharger && (
              <p className="text-xs bg-green-50 text-green-700 p-2 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                We recommend using the maximum allowed panels and adding a battery.
              </p>
            )}
          </CardContent>
        </Card>

        {/* EV Charger Equipment - Only visible when Planning for EV */}
        {includeEVCharger && (
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">
                  <Zap className="w-3 h-3" />
                </div>
                EV Charger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* EV Charger Equipment Option - Mobile */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Add EV charger equipment?</span>
                  </div>
                  <div className="flex items-center">
                    <Switch checked={includeEVChargerEquipment} onCheckedChange={setIncludeEVChargerEquipment} />
                  </div>
                </div>
                {includeEVChargerEquipment && (
                  <div className="mt-2">
                    <div className="text-sm font-bold">€{(evChargerCost || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">€{selectedEVCharger.grant || 0} Grant Available</div>
                  </div>
                )}
              </div>

              {/* EV Charger Equipment Selection - Mobile */}
              {includeEVChargerEquipment && (
                <div className="mt-3">
                  <MobileEquipmentSelector
                    title="EV Charger"
                    options={evChargerOptions}
                    value={selectedEVCharger.id}
                    onChange={(value: string) => {
                      const found = evChargerOptions.find((c: any) => c.id === value)
                      if (found) setSelectedEVCharger(found)
                    }}
                    extra={`${selectedEVCharger.power} • ${selectedEVCharger.reason}`}
                    imagePath={selectedEVCharger.image || `/images/ev-chargers/${selectedEVCharger.id}.png`}
                    downloadUrl={selectedEVCharger.datasheet || "/pdf/myenergi_zappi.pdf"}
                    downloadName={getDownloadFilename(selectedEVCharger.datasheet, `${selectedEVCharger.name.replace(/\s+/g, '_')}_Spec_Sheet.pdf`)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Heat Pump Section */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">
                <Flame className="w-3 h-3" />
              </div>
              Heat Pump Planning
            </CardTitle>
          </CardHeader>
          <CardContent>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Installing a Heat Pump?</span>
              </div>
              <Switch checked={includeHeatPump} onCheckedChange={setIncludeHeatPump} />
            </div>
            {includeHeatPump && (
              <p className="text-xs bg-green-50 text-green-700 p-2 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                We recommend using the maximum allowed panels and adding a battery.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Insights */}

      {false && (<Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Savings Calculation Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-white">
                    <span className="font-medium text-sm">See How Your Savings Are Calculated</span>
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="pb-2 relative">
                    <DialogClose asChild>
                      <button
                        className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ×
                      </button>
                    </DialogClose>
                    <DialogTitle className="text-lg flex items-center gap-2 pr-8">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      How Your Savings Are Calculated
                    </DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="solar-only" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="solar-only" className="text-xs">
                        Solar Only
                      </TabsTrigger>
                      <TabsTrigger value="solar-battery-night" className="text-xs">
                        Battery (Night)
                      </TabsTrigger>
                      <TabsTrigger value="solar-battery-solar" className="text-xs">
                        Solar + Battery
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="solar-only" className="space-y-3">
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm mb-2">Your panels power your home directly during the day. Any unused solar is exported to the grid for payment.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <MobileStatBox
                            icon={<Sun className="w-6 h-6 text-yellow-500" />}
                            label="Annual Benefit"
                            value={`€${Math.round(annualPVGeneration * 0.3 * 0.35) + Math.round(annualPVGeneration * 0.7 * 0.2)}`}
                            tone="green"
                          />
                          <MobileStatBox
                            icon={<Home className="w-6 h-6 text-blue-500" />}
                            label="kWh Generated"
                            value={`${annualPVGeneration.toLocaleString()}`}
                            tone="blue"
                          />
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <MobileBreakdownRow
                            title="Self-Use Savings"
                            detail={`30% × ${annualPVGeneration.toLocaleString()} kWh × €0.35`}
                            value={`€${Math.round(annualPVGeneration * 0.3 * 0.35)}`}
                            color="green"
                          />
                          <MobileBreakdownRow
                            title="Export Income"
                            detail={`70% × ${annualPVGeneration.toLocaleString()} kWh × €0.20`}
                            value={`€${Math.round(annualPVGeneration * 0.7 * 0.2)}`}
                            color="blue"
                          />
                          <MobileTotalRow value={`€${Math.round(annualPVGeneration * 0.3 * 0.35) + Math.round(annualPVGeneration * 0.7 * 0.2)}`} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="solar-battery-night" className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm mb-2">
                          The battery charges overnight on a cheap night-rate tariff. All solar generation is exported to the grid.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <MobileStatBox
                            icon={<Sun className="w-6 h-6 text-yellow-500" />}
                            label="Solar Export"
                            value={`€${Math.round(annualPVGeneration * 1.0 * 0.2)}`}
                            tone="blue"
                          />
                          <MobileStatBox
                            icon={<Battery className="w-6 h-6 text-purple-500" />}
                            label="Arbitrage"
                            value={`€${Math.round(8 * (gridRate - 0.08) * 365)}`}
                            tone="purple"
                          />
                          <MobileStatBox
                            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                            label="Total"
                            value={`€${Math.round(annualPVGeneration * 1.0 * 0.2) + Math.round(8 * (gridRate - 0.08) * 365)}`}
                            tone="green"
                          />
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <MobileBreakdownRow
                            title="Solar Export Income"
                            detail={`${annualPVGeneration.toLocaleString()} kWh × €0.20`}
                            value={`€${Math.round(annualPVGeneration * 1.0 * 0.2)}`}
                            color="blue"
                          />
                          <MobileBreakdownRow
                            title="Battery Savings (Arbitrage)"
                            detail={`${batteryCount * (selectedBattery.capacity || 0)} kWh × (€${gridRate.toFixed(2)} − €0.08) × 365`}
                            value={`€${Math.round(batteryCount * (selectedBattery.capacity || 0) * (gridRate - 0.08) * 365)}`}
                            color="purple"
                          />
                          <MobileTotalRow value={`€${Math.round(annualPVGeneration * 1.0 * 0.2) + Math.round(batteryCount * (selectedBattery.capacity || 0) * (gridRate - 0.08) * 365)}`} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="solar-battery-solar" className="space-y-3">
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-sm mb-2">The battery charges from both solar and the night-rate tariff. Solar powers the home first, then the battery covers evening use. Excess solar is still exported.</p>
                        <div className="grid grid-cols-3 gap-2">
                          <MobileStatBox
                            icon={<Home className="w-6 h-6 text-green-600" />}
                            label="Self-Use"
                            value={`€${Math.round(annualPVGeneration * scenarioFractions.selfUse * 0.35)}`}
                            tone="green"
                          />
                          <MobileStatBox
                            icon={<Sun className="w-6 h-6 text-blue-500" />}
                            label="Export"
                            value={`€${Math.round(annualPVGeneration * scenarioFractions.export * 0.2)}`}
                            tone="blue"
                          />
                          <MobileStatBox
                            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                            label="Total"
                            value={`€${Math.round(annualPVGeneration * scenarioFractions.selfUse * 0.35) + Math.round(annualPVGeneration * scenarioFractions.export * 0.2)}`}
                            tone="green"
                          />
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <MobileBreakdownRow
                            title="Self-Use Savings"
                            detail={`${Math.round(scenarioFractions.selfUse * 100)}% × ${annualPVGeneration.toLocaleString()} kWh × €0.35`}
                            value={`€${Math.round(annualPVGeneration * scenarioFractions.selfUse * 0.35)}`}
                            color="green"
                          />
                          <MobileBreakdownRow
                            title="Export Income"
                            detail={`${Math.round(scenarioFractions.export * 100)}% × ${annualPVGeneration.toLocaleString()} kWh × €0.20`}
                            value={`€${Math.round(annualPVGeneration * scenarioFractions.export * 0.2)}`}
                            color="blue"
                          />
                          <MobileTotalRow value={`€${Math.round(annualPVGeneration * scenarioFractions.selfUse * 0.35) + Math.round(annualPVGeneration * scenarioFractions.export * 0.2)}`} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 border-l-4 border-gray-400">
                    Figures are estimates and vary by usage, weather, and tariffs.
                  </div>
                </DialogContent>
              </Dialog>

            {/* Bill Impact Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-white">
                  <span className="font-medium text-sm">Before → After Bill Impact</span>
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
                <DialogHeader className="pb-2 relative">
                  <DialogClose asChild>
                    <button
                      className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ×
                    </button>
                  </DialogClose>
                  <DialogTitle className="text-lg flex items-center gap-2 pr-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Your Bill Transformation
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 p-4 rounded border">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-[11px] text-gray-600 font-medium">CURRENT BILL</div>
                        <div className="text-2xl font-bold text-red-600">€{billBefore}</div>
                        <div className="text-xs text-gray-600">per year</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs bg-transparent"
                          onClick={() => setShowBillEditor(true)}
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit Bill
                        </Button>
                      </div>
                      <div className="text-3xl text-gray-400 font-light">→</div>
                      <div className="text-center">
                        <div className="text-[11px] text-gray-600 font-medium">NEW BILL</div>
                        <div className="text-2xl font-bold text-green-600">
                          €{Math.max(200, billBefore - totalAnnualSavings)}
                        </div>
                        <div className="text-xs text-gray-600">per year</div>
                        <div className="text-[11px] text-green-600 mt-1 font-medium">{billOffset}% reduction</div>
                      </div>
                    </div>

                    <div className="relative mt-4">
                      <div className="w-full bg-red-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ width: `${billOffset}%` }}
                        >
                          {billOffset}% SAVED
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>€0</span>
                        <span>€{billBefore}</span>
                      </div>
                    </div>

                    <div className="text-center bg-white p-3 rounded border mt-4">
                      <div className="text-xl font-bold text-green-600 mb-1">€{totalAnnualSavings} saved annually</div>
                      <div className="text-xs text-gray-600 mb-2">
                        Payback period: {paybackPeriod} years
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-medium text-gray-700">Monthly Savings</div>
                          <div className="text-lg font-bold text-green-600">€{Math.round(totalAnnualSavings / 12)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">25-Year Savings</div>
                          <div className="text-lg font-bold text-green-600">
                            €{(totalAnnualSavings * 25).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium mb-1">Notes</p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li>• Standing charges remain unchanged</li>
                          <li>• Estimates update with your selections</li>
                          <li>• Actual savings depend on usage & weather</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>)}

        

        {/* Property Value */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    3
                  </div>
                  Property Value Impact
                </CardTitle>
                <ChevronDown className="w-4 h-4 text-gray-500 data-[state=open]:rotate-180 transition-transform" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-blue-800">Value Increase</p>
                    <p className="text-lg font-bold text-blue-600">+2% to +6%</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <Home className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-green-800">BER Rating Boost</p>
                    <p className="text-lg font-bold text-green-600">Typically +1 grade</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 text-center">Based on industry averages; not a valuation.</p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Installation, Warranties & FAQ */}
        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm md:text-base">
                      4
                    </span>
                  Installation, Warranties, FAQ</CardTitle>
                <ChevronDown className="w-4 h-4 text-gray-500 data-[state=open]:rotate-180 transition-transform" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                <MobileAccordionRow
                  icon={<Calendar className="w-4 h-4 text-gray-600" />}
                  title="Installation Timeline"
                  content={
                    <div className="space-y-2">
                      <MobileStepRow n="1" title="Site Survey & Design" desc="1–2 weeks" />
                      <MobileStepRow n="2" title="Planning & Permits" desc="2–4 weeks" />
                      <MobileStepRow n="3" title="Installation Day" desc="1–2 days" />
                    </div>
                  }
                />
                <MobileAccordionRow
                  icon={<Shield className="w-4 h-4 text-gray-600" />}
                  title="Warranty Coverage"
                  content={
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-medium text-gray-800">Solar Panels</span>
                        <span className="text-sm font-bold text-green-600">25 Years Performance</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-gray-800">Inverter</span>
                        <span className="text-sm font-bold text-blue-600">10 Years Product</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <span className="text-sm font-medium text-gray-800">Battery Storage</span>
                        <span className="text-sm font-bold text-purple-600">10 Years Product</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <span className="text-sm font-medium text-gray-800">Installation Work</span>
                        <span className="text-sm font-bold text-orange-600">5 Years Workmanship</span>
                      </div>
                    </div>
                  }
                />
                <MobileAccordionRow
                  icon={<Wrench className="w-4 h-4 text-gray-600" />}
                  title="If something breaks"
                  content={
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">24/7 Monitoring</h4>
                          <p className="text-xs text-gray-600">We monitor your system performance remotely</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Rapid Response</h4>
                          <p className="text-xs text-gray-600">Same-day diagnosis, next-day repair in most cases</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">No Cost Repairs</h4>
                          <p className="text-xs text-gray-600">All warranty repairs covered at no charge</p>
                        </div>
                      </div>
                    </div>
                  }
                />
                <MobileAccordionRow
                  icon={<Home className="w-4 h-4 text-gray-600" />}
                  title="If you move house"
                  content={
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">System stays with the house</h4>
                          <p className="text-xs text-gray-600">Solar systems typically increase property value by 2-6%</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Warranties transfer to new owner</h4>
                          <p className="text-xs text-gray-600">All manufacturer warranties remain valid</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Strong selling point</h4>
                          <p className="text-xs text-gray-600">89% of buyers value energy-efficient homes</p>
                        </div>
                      </div>
                    </div>
                  }
                />
                <MobileAccordionRow
                  icon={<Plus className="w-4 h-4 text-gray-600" />}
                  title="Can I add more panels later?"
                  content={
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Yes, but it's more expensive</h4>
                          <p className="text-xs text-gray-600">Adding panels later costs 20-30% more due to separate installation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Inverter capacity limits</h4>
                          <p className="text-xs text-gray-600">Your inverter must have spare capacity for additional panels</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Plan ahead and save</h4>
                          <p className="text-xs text-gray-600">Size your system for future needs (EV, heat pump) from the start</p>
                        </div>
                      </div>
                    </div>
                  }
                />
                <MobileAccordionRow
                  icon={<Wrench className="w-4 h-4 text-gray-600" />}
                  title="What maintenance is required?"
                  content={
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Minimal maintenance required</h4>
                          <p className="text-xs text-gray-600">Solar panels are self-cleaning in Irish weather</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Annual visual inspection</h4>
                          <p className="text-xs text-gray-600">Check for debris, damage, or shading issues</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Monitor performance</h4>
                          <p className="text-xs text-gray-600">We provide monitoring app to track system performance</p>
                        </div>
                      </div>
                    </div>
                  }
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Solar Benefits Card - Permanently at the end */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-xl font-bold text-blue-900">Your Solar Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group relative border-2 border-green-200 hover:border-green-400 h-24"
                onClick={() => {
                  setShowSavingsModal(true)
                  // Tab will be set by useEffect based on includeBattery state
                }}
              >
                <CardContent className="p-3 text-center h-full flex flex-col justify-center">
                  <p className="text-xs text-gray-600 mb-1">ANNUAL SAVINGS</p>
                  <p className="text-xl font-bold text-green-600" style={{minWidth: '80px', fontVariantNumeric: 'tabular-nums'}}>
                    €{totalAnnualSavings}
                  </p>
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    <Eye className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-1 right-1 text-xs text-gray-500 opacity-70">
                    Click for details
                  </div>
                </CardContent>
              </Card>
              <Card
                className="bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 group relative border-2 border-blue-200 hover:border-blue-400 h-24"
                onClick={() => {
                  setShowSavingsModal(true)
                  // Tab will be set by useEffect based on includeBattery state
                }}
              >
                <CardContent className="p-3 text-center h-full flex flex-col justify-center">
                  <p className="text-xs text-gray-600 mb-1">PAYBACK PERIOD</p>
                  <p className="text-xl font-bold text-blue-600" style={{minWidth: '70px', fontVariantNumeric: 'tabular-nums'}}>{paybackPeriod} yrs</p>
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    <Eye className="w-3 h-3" />
                  </div>
                  <div className="absolute bottom-1 right-1 text-xs text-gray-500 opacity-70">
                    Click for details
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Your Investment</h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">System price</span>
                  <span className="font-semibold">€{systemBaseCost.toLocaleString()}</span>
                </div>

                {includeBattery && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Battery cost</span>
                    <span className="font-semibold">€{batteryCost.toLocaleString()}</span>
                  </div>
                )}

                {includeEVChargerEquipment && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">EV charger <span className="text-xs text-gray-500">incl. 13.5% VAT</span></span>
                    <span className="font-semibold">€{(evChargerCost || 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-gray-700 font-medium">Price you pay</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">€{systemPriceBeforeGrant.toLocaleString()}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        {/* <Button variant="ghost" size="icon" className="w-5 h-5 text-blue-600">
                          <Info className="w-3 h-3" />
                        </Button> */}
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader className="relative">
                          <DialogClose asChild>
                            <button
                              className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              ×
                            </button>
                          </DialogClose>
                          <DialogTitle className="pr-8">System Cost Breakdown</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b">
                            <span>Solar Hardware</span>
                            <span>€{systemBaseCost.toLocaleString()}</span>
                          </div>
                          {includeBattery && (
                            <div className="flex justify-between py-2 border-b">
                              <span>Battery Hardware</span>
                              <span>€{batteryCost.toLocaleString()}</span>
                            </div>
                          )}
                          {includeEVChargerEquipment && (
                            <div className="flex justify-between py-2 border-b">
                              <span>EV Charger <span className="text-xs text-gray-500">incl. 13.5% VAT</span></span>
                              <span>€{(evChargerCost || 0).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 font-bold">
                            <span>Total</span>
                            <span>€{systemPriceBeforeGrant.toLocaleString()}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {isEligibleForSEAIGrant && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>SEAI Grant</span>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-5 h-5 text-blue-600">
                            <Info className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[66vh] overflow-y-auto">
                          <DialogHeader className="relative">
                            <DialogClose asChild>
                              <button
                                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                ×
                              </button>
                            </DialogClose>
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold pr-8">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              SEAI Grant Information
                            </DialogTitle>
                            <p className="text-xs text-gray-600">
                              Learn about the government grant available for solar PV installations.
                            </p>
                          </DialogHeader>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              The Sustainable Energy Authority of Ireland (SEAI) provides grants up to €1,800 for solar
                              PV installations to encourage renewable energy adoption.
                            </p>
                            
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-800 mb-1">
                                Was your house built before 31st December 2020?
                              </p>
                              <p className="text-xs text-blue-700">
                                SEAI grant only applies to homes built before this date.
                              </p>
                            </div>

                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                              <li>• Max grant amount: €1,800</li>
                              <li>• Eligibility criteria apply (e.g., BER rating, property type)</li>
                              <li>• Applied directly by your installer</li>
                            </ul>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-700">
                              <p>
                                Disclaimer: Grant amounts and eligibility are subject to SEAI terms and conditions and may change.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <span className="font-semibold">-€{seaiGrant.toLocaleString()}</span>
                      
                    </div>
                  </div>
                )}

                {includeEVChargerEquipment && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>EV Charger Grant</span>
                    <span className="font-semibold">-€{evChargerGrant.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Net investment</span>
                  <span className="text-2xl font-bold text-green-600">€{finalPrice.toLocaleString()}</span>
                </div>
                {/* <p className="text-center text-sm text-gray-600 mt-1">
                        or from €{(() => {
                          // 5 year term, 4.99% APR, finalPrice is principal
                          const principal = (systemBaseCost + batteryCost);
                          const annualRate = 0.0499;
                          const monthlyRate = annualRate / 12;
                          const months = 60;
                          // Monthly payment formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
                          const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
                          return Math.round(payment);
                        })()}/month with financing
                        </p> */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 italic text-center">
                    Price excludes any current promotional offers. Please contact us for details about available promotions.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {/* Primary CTA - Book Free Consultation */}
              <Button 
                className="w-full h-auto !px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl" 
                onClick={() => router.push('/call-page')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Free Consultation
                  </div>
                  <span className="sm:ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                    No Obligation
                  </span>
                </div>
              </Button>
              {/* Secondary CTA - Download Plan */}
              <Dialog 
                open={showSavePlanDialog} 
                onOpenChange={(open) => {
                  // Prevent layout shift by locking body width
                  if (open) {
                    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                    document.body.style.paddingRight = `${scrollbarWidth}px`;
                    document.body.style.overflow = 'hidden';
                  } else {
                    document.body.style.paddingRight = '';
                    document.body.style.overflow = '';
                  }
                  
                  setShowSavePlanDialog(open);
                  if (!open) {
                    // Reset form state when dialog closes (but not if email was successfully submitted)
                    if (!emailSubmissionSuccess) {
                      setFullName("");
                      setEmail("");
                      setAgreeToTerms(false);
                    }
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all duration-200"
                  >
                    <FileChartColumnIncreasing className="w-4 h-4 mr-2" />
                    View My Proposal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {emailSubmissionSuccess ? (
                    // Success State
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-5 relative">
                      {/* Close Button */}
                      <DialogClose asChild>
                        <button
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
                        >
                          ×
                        </button>
                      </DialogClose>
                      
                      {/* Header Section - More friendly */}
                      <div className="text-center space-y-1 sm:space-y-2">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                          <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div>
                          <h1 className="text-base sm:text-lg font-bold text-foreground">Your Report is On Its Way! 🚀</h1>
                          <p className="text-xs sm:text-sm text-muted-foreground">We've got your solar plan ready</p>
                        </div>
                      </div>

                      {/* Email Confirmation - More friendly */}
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                          <p className="text-xs sm:text-sm font-medium text-foreground break-all">Sent to: {email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">Should arrive within 60 seconds</p>
                        </div>
                        <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                          <p className="text-xs font-medium text-gray-800">
                            📧 Check your inbox, spam & promotions folders (just in case) 😊
                          </p>
                        </div>
                      </div>

                      {/* Value Proposition - More friendly */}
                      <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                        <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Got questions about your plan? 🤔</p>
                        <p className="text-xs text-muted-foreground">
                          Let's chat! No pressure, just friendly advice on design & grants
                        </p>
                      </div>

                      {/* Action Buttons - More human phrasing */}
                      <div className="space-y-1 sm:space-y-2">
                        <Button
                          onClick={() => {
                            setShowSavePlanDialog(false);
                            setAppNavigation();
                            router.push('/call-page');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Let's Chat - No Pressure! ☎️
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowSavePlanDialog(false);
                            router.push('/review-report');
                          }}
                          className="w-full border border-blue-200 text-gray-700 hover:bg-blue-50 font-medium py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 bg-white"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          I'll Take a Look First 👀
                        </Button>
                      </div>

                      {/* Footer - Minimal */}
                      <div className="text-center pt-1 sm:pt-2 border-t border-blue-100">
                        <p className="text-xs text-gray-600">
                          Questions?{" "}
                          <a
                            href={`mailto:${branding.email}`}
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            {branding.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Form State
                    <>
                      <DialogHeader className="text-center pb-4 relative">
                        <DialogClose asChild>
                          <button
                            className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            ×
                          </button>
                        </DialogClose>
                        <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                          View My Proposal
                        </DialogTitle>
                        <p className="text-gray-600 mt-2">
                          Get your detailed plan emailed to you with financing options and next steps.
                        </p>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Full Name Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Your Full Name"
                              value={fullName}
                              onChange={handleFullNameChange}
                              className="pl-10 h-12 text-gray-600"
                              required
                            />
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={handleEmailChange}
                              className="pl-10 h-12 text-gray-600"
                              required
                            />
                          </div>
                        </div>

                        {/* Agreement Checkbox */}
                        <div className="flex items-start space-x-2 pt-2">
                          <Checkbox 
                            id="agree-terms-mobile"
                            checked={agreeToTerms}
                            onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                            className="mt-1"
                          />
                          <label htmlFor="agree-terms-mobile" className="text-sm text-gray-700 leading-5">
                            I agree to receive my personalised energy upgrade report by email from Voltflo. No spam, no follow-ups. <span className="text-red-500">*</span>
                          </label>
                        </div>

                        {/* Error Message */}
                        {submitError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{submitError}</p>
                          </div>
                        )}

                        {/* Submit Button */}
                        <Button 
                          onClick={handleSavePlan}
                          disabled={!fullName.trim() || !email.trim() || !agreeToTerms || isSubmitting}
                          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium mt-6 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending Plan...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Email My Solar Plan
                            </>
                          )}
                        </Button>

                        {/* Footer Text */}
                        <div className="text-xs text-gray-600 text-center pt-2 leading-4">
                          By clicking 'Email My Solar Plan', you agree to Voltflo's{" "}
                          <a target="_blank" href="/privacy-policy" className="text-green-600 underline">Privacy Policy</a> and{" "}
                          <a target="_blank" href="/terms-of-use" className="text-green-600 underline">Terms of Use</a>. 
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>


            {/* Disclaimer */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <span className="font-medium">Provisional figures</span> - Final costs confirmed after site visit
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bill Editor Dialog */}
      <Dialog open={showBillEditor} onOpenChange={setShowBillEditor}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Edit3 className="w-5 h-5 text-blue-500" />
              Edit Your Energy Bill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-center text-gray-600">Average Irish household: €2,200–€3,000/year</p>
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setBillInputMode("monthly")}
                  className={`px-3 py-1 rounded text-sm ${
                    billInputMode === "monthly" ? "bg-white shadow-sm font-medium" : "text-gray-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillInputMode("annual")}
                  className={`px-3 py-1 rounded text-sm ${
                    billInputMode === "annual" ? "bg-white shadow-sm font-medium" : "text-gray-600"
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                €{billInputMode === "monthly" ? Math.round(customAnnualBill / 12) : customAnnualBill}
              </div>
              <div className="text-xs text-gray-600">per {billInputMode === "monthly" ? "month" : "year"}</div>
            </div>

            <input
              type="range"
              min={billInputMode === "monthly" ? 100 : 1200}
              max={billInputMode === "monthly" ? 500 : 6000}
              step={billInputMode === "monthly" ? 10 : 100}
              value={billInputMode === "monthly" ? Math.round(customAnnualBill / 12) : customAnnualBill}
              onChange={(e) => {
                const value = Number(e.target.value)
                setCustomAnnualBill(billInputMode === "monthly" ? value * 12 : value)
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>€{billInputMode === "monthly" ? "100" : "1,200"}</span>
              <span>€{billInputMode === "monthly" ? "500" : "6,000"}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setCustomAnnualBill(2640)} className="flex-1">
                Reset
              </Button>
              <Button onClick={() => setShowBillEditor(false)} className="flex-1">
                Save
              </Button>
            </div>
            <div className="bg-gray-50 p-2 rounded text-[11px] text-gray-700">
              Adjusting your bill updates savings and payback calculations.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom CTA Bar - Shows/Hides based on scroll */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-br from-blue-50 to-blue-100 border-t border-blue-200 shadow-lg p-3 z-50 transition-all duration-500 ease-in-out ${
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">SAVINGS</p>
              <button
                type="button"
                className="text-sm font-bold text-green-600 underline decoration-dotted focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
                aria-label="See how your savings are calculated"
                onClick={() => setShowSavingsModal(true)}
              >
                €{totalAnnualSavings}
              </button>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">PAYBACK</p>
              <p className="text-sm font-bold text-blue-600">{paybackPeriod} yrs</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">PRICE</p>
              <p className="text-sm font-bold">€{finalPrice.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-3" onClick={() => router.push('/call-page')}>
              Free Consult
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-3 bg-white border border-gray-300 shadow-sm"
              onClick={() => setShowSavePlanDialog(true)}
            >
              <FileChartColumnIncreasing className="w-3 h-3 mr-1" />
              Plan
            </Button>
          </div>
        </div>
      </div>
      
      {/* Success Modal for Mobile */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-xl mx-auto bg-background border-0 shadow-2xl">
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-5">
            {/* Header Section - More friendly */}
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground">Your Report is On Its Way! 🚀</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">We've got your solar plan ready</p>
              </div>
            </div>

            {/* Email Confirmation - More friendly */}
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 border border-blue-200">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-foreground break-all">Sent to: {email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">Should arrive within 60 seconds</p>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                <p className="text-xs font-medium text-gray-800">
                  📧 Check your inbox, spam & promotions folders (just in case) 😊
                </p>
              </div>
            </div>

            {/* Value Proposition - More friendly */}
            <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Got questions about your plan? 🤔</p>
              <p className="text-xs text-muted-foreground">
                Let's chat! No pressure, just friendly advice on design & grants
              </p>
            </div>

            {/* Action Buttons - More human phrasing */}
            <div className="space-y-1 sm:space-y-2">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/call-page');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Let's Chat - No Pressure! ☎️
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/review-report');
                }}
                className="w-full border border-blue-200 text-gray-700 hover:bg-blue-50 font-medium py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 bg-white"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                I'll Take a Look First 👀
              </Button>
            </div>

            {/* Footer - Minimal */}
            <div className="text-center pt-1 sm:pt-2 border-t border-blue-100">
              <p className="text-xs text-gray-600">
                Questions?{" "}
                <a
                  href={`mailto:${branding.email}`}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  {branding.email}
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Savings Modal */}
      <Dialog open={showSavingsModal} onOpenChange={setShowSavingsModal}>
        <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="relative">
            <DialogClose asChild>
              <button
                className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </DialogClose>
            <DialogTitle className="flex items-center gap-2 text-base pr-8">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              How Your Savings Are Calculated
            </DialogTitle>
          </DialogHeader>
          <Tabs value={savingsModalTab} onValueChange={(value) => {
            setSavingsModalTab(value)
            // Sync with main battery toggle
            if (value === "solarOnly") {
              setIncludeBattery(false)
            } else if (value === "hybrid" || value === "nightCharge") {
              setIncludeBattery(true)
            }
          }}>
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="solarOnly" className="text-xs">Solar Only</TabsTrigger>
              <TabsTrigger value="nightCharge" className="text-xs">Battery Arbitrage</TabsTrigger>
              <TabsTrigger value="hybrid" className="text-xs">Solar + Battery</TabsTrigger>
            </TabsList>

            <TabsContent value="solarOnly" className="space-y-3">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div
                  className="bg-blue-100 p-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => setShowEnergyProfileModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Current Profile:{" "}
                        {energyProfile === "family"
                          ? "Family home"
                          : energyProfile === "small"
                            ? "Small home"
                            : energyProfile === "big"
                              ? "Big energy use"
                              : "Custom"}
                      </p>
                      <p className="text-xs text-blue-600">
                        Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="text-xs">Edit</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-2">Solar Only</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Your panels power your home during the day. Extra energy is sold back to the grid.
                </p>

                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Direct Solar Use</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            30% × annual generation × €0.35
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">€{scenarios.solarOnly.directSavings}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Export Income</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            70% × annual generation × €0.20
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">€{scenarios.solarOnly.exportIncome}</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>Total Benefit</span>
                      <span className="text-green-600">€{scenarios.solarOnly.total}</span>
                    </div>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-between">
                      <span>Show calculation breakdown</span>
                      <ChevronDown className="w-3 h-3 data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2 text-xs text-gray-600 bg-gray-50 border-t">
                      <div className="space-y-1">
                        <div>• Annual generation: {scenarios.solarOnly.calculations.generation} kWh</div>
                        <div>• Direct use (30%): {scenarios.solarOnly.calculations.baseSelfUseKWh} kWh × €0.35 = €{scenarios.solarOnly.directSavings}</div>
                        <div>• Export (70%): {scenarios.solarOnly.calculations.exportKWh} kWh × €0.20 = €{scenarios.solarOnly.exportIncome}</div>
                        <div className="font-medium pt-1 border-t">Total: €{scenarios.solarOnly.total}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Figures are estimates based on your inputs, typical Irish tariffs, and average conditions.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="hybrid" className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div
                  className="bg-blue-100 p-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => setShowEnergyProfileModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Current Profile:{" "}
                        {energyProfile === "family"
                          ? "Family home"
                          : energyProfile === "small"
                            ? "Small home"
                            : energyProfile === "big"
                              ? "Big energy use"
                              : "Custom"}
                      </p>
                      <p className="text-xs text-blue-600">
                        Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="text-xs">Edit</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base">Solar + Battery</h3>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-blue-500 cursor-help hover:text-blue-600 transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="font-medium mb-1">Battery Benefits</div>
                      <div className="text-gray-600 mb-1">Maximize your solar energy consumption:</div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span><strong>Without battery:</strong> Only 30% solar consumption</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                          <span><strong>With 1 battery:</strong> 70-80% solar consumption</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span><strong>With 2 batteries:</strong> 80-90% solar consumption</span>
                        </div>
                        <div className="pt-1 border-t border-gray-200">
                          <div className="text-green-600 font-medium">
                            Self-consumption saves €0.15/kWh more than exporting!
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3">
                  Solar powers your home first. Extra solar charges your battery for evening use. Any leftover is sold back to the grid.
                </p>

                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Direct Solar + Battery Use</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            Self-use includes baseline + battery benefit.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">€{scenarios.hybrid.directSavings}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Export Income</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            Any remaining generation sold at €0.20/kWh.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">€{scenarios.hybrid.exportIncome}</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>Total Benefit</span>
                      <span className="text-green-600">€{scenarios.hybrid.total}</span>
                    </div>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-between">
                      <span>Show calculation breakdown</span>
                      <ChevronDown className="w-3 h-3 data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2 text-xs text-gray-600 bg-gray-50 border-t">
                      <div className="space-y-1">
                        <div>• Annual generation: {scenarios.hybrid.calculations.generation} kWh</div>
                        <div>• Total self-use: {scenarios.hybrid.calculations.totalSelfUseKWh} kWh × €0.35 = €{scenarios.hybrid.directSavings}</div>
                        <div>• Export: {scenarios.hybrid.calculations.exportKWh} kWh × €0.20 = €{scenarios.hybrid.exportIncome}</div>
                        <div>• Battery throughput: {scenarios.hybrid.calculations.batteryThroughput} kWh/year</div>
                        <div className="font-medium pt-1 border-t">Total: €{scenarios.hybrid.total}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">⚡</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">Battery Configuration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 font-medium">Units:</span>
                      <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                        <button
                          onClick={() => setBatteryCount(1)}
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all duration-200 ${
                            batteryCount === 1 
                              ? "bg-blue-500 text-white shadow-sm" 
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          1<span className="hidden sm:inline"> Battery</span>
                        </button>
                        <button
                          onClick={() => setBatteryCount(2)}
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all duration-200 ${
                            batteryCount === 2 
                              ? "bg-blue-500 text-white shadow-sm" 
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          2<span className="hidden sm:inline"> Batteries</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>Capacity: {batteryCount * (selectedBattery.capacity || 0)}kWh total</span>
                    <span>{batteryCount === 1 ? '1 day' : '2 days'} backup power</span>
                  </div>
                </div>

                {batteryCount === 2 && scenarios.hybrid.batteryUtilization < 70 && !hasEV && !hasHeatPump && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-600 text-sm">⚠️</span>
                    <span className="text-xs text-amber-700">
                      Second battery may be under-used. Best value if adding EV or heat pump.
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Figures are estimates based on your inputs, typical Irish tariffs, and average conditions.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="nightCharge" className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div
                  className="bg-blue-100 p-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => setShowEnergyProfileModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Current Profile:{" "}
                        {energyProfile === "family"
                          ? "Family home"
                          : energyProfile === "small"
                            ? "Small home"
                            : energyProfile === "big"
                              ? "Big energy use"
                              : "Custom"}
                      </p>
                      <p className="text-xs text-blue-600">
                        Daily usage: {dailyUsageKwh} kWh • Monthly bill: €{monthlyBill}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="text-xs">Edit</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base">Solar + Battery (Night Charge)</h3>
                  <div className="relative group">
                    <Info className="w-3 h-3 text-blue-500 cursor-help hover:text-blue-600 transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="font-medium mb-1">Night Charge Strategy</div>
                      <div className="text-gray-600 mb-1">Maximize battery value by storing cheap night electricity:</div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                          <span><strong>Solar Export:</strong> Sell solar at €0.20/kWh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span><strong>Night Charging:</strong> Store at €0.08/kWh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span><strong>Peak Usage:</strong> Use stored power during expensive hours</span>
                        </div>
                        <div className="pt-1 border-t border-gray-200">
                          <div className="text-green-600 font-medium">
                            Night charging saves €0.27/kWh on battery cycles!
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3">
                  Solar export provides steady income. Battery charges at night with cheap electricity and powers your home during peak hours.
                </p>

                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Solar Export Income</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            100% of annual generation sold at €0.20/kWh.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">€{Math.round(annualPVGeneration * 1.0 * 0.2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>Battery Night Charge Savings</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-gray-800 text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-40">
                            {batteryCount * (selectedBattery.capacity || 0)}kW × 90% efficiency × 315 cycles × €0.27 savings.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">€{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>Total Benefit</span>
                      <span className="text-green-600">€{Math.round(annualPVGeneration * 1.0 * 0.2 + batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</span>
                    </div>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-between">
                      <span>Show calculation breakdown</span>
                      <ChevronDown className="w-3 h-3 data-[state=open]:rotate-180 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2 text-xs text-gray-600 bg-gray-50 border-t">
                      <div className="space-y-1">
                        <div>• Annual generation: {annualPVGeneration} kWh</div>
                        <div>• Solar export (100%): {Math.round(annualPVGeneration * 1.0)} kWh × €0.20 = €{Math.round(annualPVGeneration * 1.0 * 0.2)}</div>
                        <div>• Battery capacity: {batteryCount * (selectedBattery.capacity || 0)}kW × 90% efficiency = {Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9)}kW usable</div>
                        <div>• Night charge cycles: 315 cycles/year × €0.27 savings = €{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</div>
                        <div className="font-medium pt-1 border-t">Total: €{Math.round(annualPVGeneration * 1.0 * 0.2 + batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">🌙</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">Night Charge Setup</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 font-medium">Units:</span>
                      <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                        <button
                          onClick={() => setBatteryCount(1)}
                          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
                            batteryCount === 1 
                              ? "bg-green-500 text-white shadow-sm" 
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          1 Battery
                        </button>
                        <button
                          onClick={() => setBatteryCount(2)}
                          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
                            batteryCount === 2 
                              ? "bg-green-500 text-white shadow-sm" 
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          2 Batteries
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                    <span>Night cycles: {Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315)} kWh/year</span>
                    <span>Arbitrage: €{Math.round(batteryCount * (selectedBattery.capacity || 0) * 0.9 * 315 * 0.27)}/year</span>
                  </div>
                </div>

                {batteryCount === 2 && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-600 text-sm">💡</span>
                    <span className="text-xs text-amber-700">
                      Adding a second battery extends your backup time and maximizes savings under time-of-use tariffs.
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Figures are estimates based on your inputs, typical Irish tariffs, and average conditions.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Mobile Energy Profile Edit Modal */}
      <Dialog open={showEnergyProfileModal} onOpenChange={setShowEnergyProfileModal}>
        <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="bg-blue-100 p-2 rounded-full">
                <Edit3 className="w-4 h-4 text-blue-600" />
              </div>
              Edit Your Energy Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="monthlyBill" className="text-sm font-medium text-gray-700">
                Monthly Electricity Bill (€)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  id="monthlyBill"
                  type="number"
                  value={tempMonthlyBill}
                  onChange={(e) => setTempMonthlyBill(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="220"
                  min="50"
                  max="1000"
                />
              </div>
              <p className="text-xs text-gray-500">
                Annual bill: €{((parseFloat(tempMonthlyBill) || 0) * 12).toLocaleString()} • Daily usage: ~{Math.round(((parseFloat(tempMonthlyBill) || 0) * 12) / 0.35 / 365)} kWh
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Energy Profile Guide</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div>• Small home: €50-150/month</div>
                <div>• Family home: €150-250/month</div>
                <div>• Big energy use: €250+/month</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTempMonthlyBill((customAnnualBill / 12).toString()) // Reset to original value
                  setShowEnergyProfileModal(false)
                }}
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBillAmount}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== MOBILE VIEW COMPONENT HELPERS ====================

interface MobileEquipmentSelectorProps {
  title: string
  options: any[]
  value: string
  onChange: (v: string) => void
  extra?: string
  rightBadge?: string
  imagePath?: string
  downloadUrl?: string
  downloadName?: string
}


function MobileEquipmentSelector({
  title,
  options,
  value,
  onChange,
  extra,
  rightBadge,
  imagePath,
  downloadUrl,
  downloadName,
}: MobileEquipmentSelectorProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{title}</h4>
        {rightBadge && <Badge className="bg-orange-600">{rightBadge}</Badge>}
      </div>
      
      {/* Equipment Image */}
      {imagePath && (
        <div className="mb-3">
          <img
            src={imagePath}
            alt={title}
            className="w-full h-24 object-contain rounded bg-white p-2 border"
          />
        </div>
      )}
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={`Select ${title}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className="text-sm">
              <div className="flex items-center justify-between w-full">
                <span style={{textAlign:'left', fontSize: "11px"}}>
                  {opt.name}
                  {opt.capacity ? ` (${opt.capacity}kWh)` : ""}
                  {/* {typeof opt.priceAdjustment === "number" && opt.priceAdjustment !== 0
                    ? ` (${opt.priceAdjustment > 0 ? "+" : ""}€${opt.priceAdjustment})`
                    : ""} */}
                  {/* {typeof opt.price === "number" ? ` (€${opt.price})` : ""} */}
                </span>
                {opt.recommended && <Badge className="ml-2 bg-green-600" style={{fontSize: "10px", padding:"2px 5px"}}>Recommended</Badge>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {extra && <p className="text-[11px] text-gray-600 mt-2">{extra}</p>}
      {downloadUrl && (
        <a href={downloadUrl} download={downloadName}>
          <Button variant="outline" size="sm" className="h-7 text-xs mt-2 bg-transparent">
            <Download className="w-3 h-3 mr-1" />
            Download Spec Sheet
          </Button>
        </a>
      )}
    </div>
  )
}



interface MobileStatBoxProps {
  icon: React.ReactNode
  label: string
  value: string
  tone?: "green" | "blue" | "purple" | "yellow"
}

function MobileStatBox({
  icon,
  label,
  value,
  tone = "green",
}: MobileStatBoxProps) {
  const borderMap: Record<string, string> = {
    green: "border-green-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
    yellow: "border-yellow-200",
  }
  const textMap: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
  }
  return (
    <div className={`bg-white p-3 rounded border-2 ${borderMap[tone]} text-center`}>
      <div className="mx-auto mb-1">{icon}</div>
      <div className={`text-base font-bold ${textMap[tone]}`}>{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
}

interface MobileBreakdownRowProps {
  title: string
  detail: string
  value: string
  color?: "green" | "blue" | "yellow" | "purple" | "gray"
}

function MobileBreakdownRow({
  title,
  detail,
  value,
  color = "gray",
}: MobileBreakdownRowProps) {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    gray: "text-gray-800",
  }
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white rounded border">
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-600">{detail}</div>
      </div>
      <div className={`text-base font-bold ${colorMap[color]}`}>{value}</div>
    </div>
  )
}

function MobileTotalRow({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-green-100 to-green-200 rounded border-2 border-green-300">
      <div className="font-bold text-sm text-gray-800">Total Annual Savings</div>
      <div className="text-lg font-extrabold text-green-700">{value}</div>
    </div>
  )
}

interface MobileAccordionRowProps {
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

function MobileAccordionRow({
  icon,
  title,
  content,
}: MobileAccordionRowProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 data-[state=open]:rotate-180 transition-transform" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 bg-white border rounded">{content}</CollapsibleContent>
    </Collapsible>
  )
}

function MobileStepRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px]">
        <span className="text-[10px] font-bold text-blue-600">{n}</span>
      </div>
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </div>
  )
}

// ==================== MOBILE VIEW COMPONENT END ====================