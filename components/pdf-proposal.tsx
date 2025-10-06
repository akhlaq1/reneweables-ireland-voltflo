"use client"

import {
  Phone,
  Mail,
  Globe,
  Check,
  Zap,
  Award,
  FileText,
  Sun,
  Star,
  Euro,
  Car,
  Battery,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Leaf,
  BarChart3,
  TrendingUp,
  Home,
  Calendar,
  ThumbsUp,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PdfMonthlyProductionChart } from "@/components/pdf-monthly-production-chart"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { getBranding } from "@/lib/branding"

interface ApiData {
  id: number
  name: string
  email: string
  phone: string | null
  personalise_answers: {
    billAmount: number
    motivation: string
    'time-of-use': string
    'house-built-date'?: string
  }
  selectedLocation: {
    lat: number
    lng: number
    address: string
  }
  solar_plan_data: {
    costs: {
      seaiGrant: number
      finalPrice: number
      batteryCost: number
      evChargerCost: number
      systemBaseCost: number
      totalSystemCost: number
      monthlyFinancing: number
      heatPumpAdditionalCost: number
    }
    savings: {
      billOffset: number
      newAnnualBill: number
      paybackPeriod: number
      heatPumpSavings: number
      evChargerSavings: number
      gridIndependence: number
      solarAnnualSavings: number
      totalAnnualSavings: number
      annualBillReduction: number
      batteryAnnualSavings: number
    }
    equipment: {
      battery: {
        id: string
        name: string
        tier: string
        price: number
        reason: string
        capacity: number
        warranty: string
        recommended: boolean
      } | null
      heatPump: any
      inverter: {
        id: string
        name: string
        tier: string
        reason: string
        warranty: string
        efficiency: string
        recommended: boolean
        priceAdjustment: number
      }
      evCharger: any
      solarPanel: {
        id: string
        name: string
        tier: string
        reason: string
        quantity: number
        warranty: string
        efficiency: string
        recommended: boolean
        totalWattage: number
        priceAdjustment: number
      }
    }
    systemConfiguration: {
      basePanelCount: number
      evPanelsNeeded: number
      batteryCount: number
      includeBattery: boolean
      includeHeatPump: boolean
      selectedBattery: any
      totalPanelCount: number
      includeEVCharger: boolean
      selectedInverter: any
      powerOutageBackup: boolean
      selectedSolarPanel: any
      heatPumpPanelsNeeded: number
    }
    userInfo: {
      email: string
      fullName: string
      submittedAt: string
      agreeToTerms: boolean
    }
    systemSpecs: {
        systemSizeKwp: number
        annualBillAmount: number
        annualPVGenerated: number
        perPanelGeneration: number
      }
      propertyImpact: {
        berImprovement: string
        propertyValueUplift: number
        valueUpliftPercentage: string
      }
    metadata: {
      planVersion: string
      planCreatedAt: string
      businessProposal: {
        systemSize: number
        monthlyPerformance: Array<{
          timestamp: string
          monthly_sum: number
        }>
        electricityBillSavings: number
      }
    }
  }
  call_date: string
  call_time: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

interface PDFProposalProps {
  apiData?: ApiData | null
}

// FAQ Component
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg"
        >
          <h4 className="font-bold text-gray-800 text-sm sm:text-base">{question}</h4>
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-3" /> : <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-3" />}
        </button>
        {isOpen && <div className="px-5 pb-5 text-gray-700 text-xs sm:text-sm leading-relaxed">{answer}</div>}
      </CardContent>
    </Card>
  )
}

// Single Savings Calculator
function SavingsCalculator() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border border-gray-200 mt-6">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-semibold text-gray-800">How these savings are calculated</h4>
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 text-gray-600 text-sm space-y-3">
            <p>
              We estimate your annual solar generation from your roof and compare it to your electricity use. Savings
              come from using your own solar instead of buying at day rates, selling surplus back to the grid, and, if
              you chose a battery, using stored solar in the evening.
            </p>
            <p>
              <strong>Assumptions in this report:</strong> Day €0.35/kWh, Night €0.08/kWh, Export €0.20/kWh, battery
              efficiency ~90%. Energy prices assumed to increase 3% annually (historical average).
            </p>
            <p>Figures update if you change equipment. Final pricing and savings are confirmed during a site survey.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Grants Tooltip
function GrantsTooltip({ apiData }: { apiData: ApiData }) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Determine grant message based on house build date
  const getGrantMessage = () => {
    const houseBuildDate = apiData?.personalise_answers?.['house-built-date']
    if (houseBuildDate === "before-2021") {
      return "Your home qualifies for SEAI grants as it was built before 2021. Final eligibility is confirmed during the site survey."
    } else if (houseBuildDate === "after-2020") {
      return "Unfortunately, SEAI grants are only available for homes built before 2021. Your home does not qualify."
    } else if (houseBuildDate === "not-sure") {
      return "You indicated you're not sure when your home was built. SEAI grants apply to homes built before 2021. We'll confirm eligibility during the site survey."
    } else {
      // Default message for backward compatibility
      return "Most homes built before 2021 qualify for SEAI grants. Final eligibility is confirmed during the site survey."
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-blue-600 hover:text-blue-800"
      >
        <Info className="w-4 h-4" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
          {getGrantMessage()}
          We handle all paperwork.
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default function PDFProposal({ apiData }: PDFProposalProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const isMobile = useIsMobile()
  const branding = getBranding()

  // Helper function to build consultation URL with user parameters
  const buildConsultationUrl = () => {
    const baseUrl = `${window.location.origin}/call-page`
    const params = new URLSearchParams()

    if (apiData?.solar_plan_data?.userInfo?.fullName) {
      params.append('name', apiData.solar_plan_data.userInfo.fullName)
    }
    if (apiData?.solar_plan_data?.userInfo?.email) {
      params.append('email', apiData.solar_plan_data.userInfo.email)
    }

    return `${baseUrl}?${params.toString()}`
  }

  const handleConsultationClick = () => {
    window.open(buildConsultationUrl(), '_blank')
  }

  // Parse data from API response or use fallback values
  const proposalData = {
    address: apiData?.selectedLocation?.address || "123 Oak Avenue, Dublin 4",
    systemSize: apiData?.solar_plan_data?.systemSpecs?.systemSizeKwp || apiData?.solar_plan_data?.metadata?.businessProposal?.systemSize || 6.6,
    panelCount: apiData?.solar_plan_data?.systemConfiguration?.totalPanelCount ||
      apiData?.solar_plan_data?.equipment?.solarPanel?.quantity || 16,
    annualSavings: apiData?.solar_plan_data?.savings?.totalAnnualSavings || 1850,
    monthlySavings: Math.round((apiData?.solar_plan_data?.savings?.totalAnnualSavings || 1850) / 12),
    energyOffset: (() => {
      const billAmount = apiData?.personalise_answers?.billAmount || 274;
      const annualPVGenerated = apiData?.solar_plan_data?.systemSpecs?.annualPVGenerated || 5850;
      const numerator = annualPVGenerated; 
      const denominator = ((billAmount * 12) / 0.35)*0.95;
      return Math.min(100, Math.round((numerator / denominator) * 100));
    })(),
    totalCost: apiData?.solar_plan_data?.costs?.totalSystemCost || 18900,
    solarPrice: apiData?.solar_plan_data?.costs?.systemBaseCost || 18900,
    batteryPrice: apiData?.solar_plan_data?.costs?.batteryCost || 0,
    evPrice: apiData?.solar_plan_data?.costs?.evChargerCost || 0,
    batteryCount: apiData?.solar_plan_data?.systemConfiguration?.batteryCount || 0,
    includeBattery: apiData?.solar_plan_data?.systemConfiguration?.includeBattery || false,
    includeEvCharger: apiData?.solar_plan_data?.systemConfiguration?.includeEVCharger || false,
    berImprovement: apiData?.solar_plan_data?.propertyImpact?.berImprovement || "D → B",
    co2Reduction: (() => {
      const systemSize = apiData?.solar_plan_data?.metadata?.businessProposal?.systemSize ||
        apiData?.solar_plan_data?.systemSpecs?.systemSizeKwp || 6.6;
      return Math.round((systemSize * 1000 * 0.0005) * 100) / 100; // Rough estimate
    })(),
    availableGrant: (() => {
      // Check SEAI grant eligibility based on house build date
      const houseBuildDate = apiData?.personalise_answers?.['house-built-date']
      if (houseBuildDate) {
        const isEligible = houseBuildDate === "before-2021" || houseBuildDate === "not-sure"
        return isEligible ? (apiData?.solar_plan_data?.costs?.seaiGrant || 1800) : 0
      }
      // Default to eligible for backward compatibility
      return apiData?.solar_plan_data?.costs?.seaiGrant || 1800
    })(),
    netCost: (() => {
      // Calculate net cost using the conditional SEAI grant
      const houseBuildDate = apiData?.personalise_answers?.['house-built-date']
      let seaiGrantAmount = 0
      if (houseBuildDate) {
        const isEligible = houseBuildDate === "before-2021" || houseBuildDate === "not-sure"
        seaiGrantAmount = isEligible ? (apiData?.solar_plan_data?.costs?.seaiGrant || 1800) : 0
      } else {
        // Default to eligible for backward compatibility
        seaiGrantAmount = apiData?.solar_plan_data?.costs?.seaiGrant || 1800
      }
      
      return (apiData?.solar_plan_data?.costs?.totalSystemCost || 18900) -
        seaiGrantAmount -
        ((apiData?.solar_plan_data?.systemConfiguration?.includeEVCharger || false) ? 300 : 0)
    })(),
    paybackPeriod: apiData?.solar_plan_data?.savings?.paybackPeriod || 7.2,
    // Equipment details
    solarPanelName: apiData?.solar_plan_data?.equipment?.solarPanel?.name || "LG NeON R",
    inverterName: apiData?.solar_plan_data?.equipment?.inverter?.name || "Tesla Inverter",
    batteryName: apiData?.solar_plan_data?.equipment?.battery?.name || "16 kWh Tesla Powerwall 2",
    batteryCapacity: apiData?.solar_plan_data?.equipment?.battery?.capacity || 16,
    // Customer info
    customerName: apiData?.name || "Customer",
    customerEmail: apiData?.email || "",
    customerPhone: apiData?.phone || "",
    // Monthly performance data
    monthlyPerformance: apiData?.solar_plan_data?.metadata?.businessProposal?.monthlyPerformance || [],
    // Additional calculations
    annualGeneration: apiData?.solar_plan_data?.systemSpecs?.annualPVGenerated || 5850,
    billReduction: Math.round(((apiData?.solar_plan_data?.savings?.totalAnnualSavings || 1850) / ((apiData?.personalise_answers?.billAmount || 274) * 12)) * 100)
  }

  const currentBill = apiData?.personalise_answers?.billAmount || 274
  const newBill = currentBill - proposalData.monthlySavings
  const fiveYearSavings = proposalData.annualSavings * 5

  // Process monthly performance data for the chart
  const monthlyGenerationData = proposalData.monthlyPerformance.length > 0
    ? proposalData.monthlyPerformance
    : [
      { timestamp: "Jan-2025", monthly_sum: 157 },
      { timestamp: "Feb-2025", monthly_sum: 204 },
      { timestamp: "Mar-2025", monthly_sum: 372 },
      { timestamp: "Apr-2025", monthly_sum: 498 },
      { timestamp: "May-2025", monthly_sum: 567 },
      { timestamp: "Jun-2025", monthly_sum: 542 },
      { timestamp: "Jul-2025", monthly_sum: 590 },
      { timestamp: "Aug-2025", monthly_sum: 516 },
      { timestamp: "Sep-2025", monthly_sum: 398 },
      { timestamp: "Oct-2025", monthly_sum: 297 },
      { timestamp: "Nov-2025", monthly_sum: 170 },
      { timestamp: "Dec-2025", monthly_sum: 110 }
    ] // fallback data

  // Extract values for calculations
  const monthlyGeneration = monthlyGenerationData.map(month => month.monthly_sum)

  // Additional derived values
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const batteryUnits = proposalData.includeBattery ? proposalData.batteryCount : 0
  const backupHoursRange = "8–18 hours"
  const evGrantAmount = proposalData.includeEvCharger ? 300 : 0
  const environmentalData = {
    co2_tonnes_per_year: proposalData.co2Reduction,
    trees_equiv_per_year: Math.round(proposalData.co2Reduction * 11.4), // Rough estimate
    cars_off_road_equiv: Math.round(proposalData.co2Reduction / 1.4), // Rough estimate
    homes_powered_equiv: Math.round(proposalData.systemSize / 8.2 * 100) / 100, // Average home is ~8.2kW
    co2_lifetime: proposalData.co2Reduction * 20, // 20 year estimate
  }

  const faqItems = [
    {
      question: "What if my roof needs repairs?",
      answer: "We use non-invasive mounting. If repairs are needed, panels can be removed and re-installed.",
    },
    {
      question: "What happens if I move house?",
      answer: "Warranties transfer; solar typically increases property value.",
    },
    {
      question: "Is scaffolding included?",
      answer: "Yes, all scaffolding and safety equipment is included in the installation price.",
    },
    {
      question: "What if my BER is low?",
      answer: "Solar works regardless of BER rating. A post-installation BER assessment is required for SEAI grants.",
    },
    {
      question: "Can I upgrade later (extra panels/bigger battery)?",
      answer: "Yes, if your inverter has spare capacity; we can advise on expansion options during the consultation.",
    },
    {
      question: "How long does installation take?",
      answer: "Usually 1–2 days on site after design/permit steps.",
    },
    {
      question: "What if something breaks?",
      answer: "You're covered by manufacturer warranties; our team supports you locally.",
    },
  ]

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const annualTotal = monthlyGeneration.reduce((sum: number, month: number) => sum + month, 0)
  const peakMonth = Math.max(...monthlyGeneration)
  const peakMonthIndex = monthlyGeneration.indexOf(peakMonth)

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-900 font-sans">
      {/* A. Header / Hero Summary */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex flex-row justify-between items-center mb-4 sm:mb-5">
          <img
            src={branding.logo}
            alt={`${branding.name} Logo`}
            className="h-8 sm:h-12"
          />
          <Badge variant="outline" className="bg-white text-gray-700 border-gray-300 px-3 sm:px-4 py-2 text-sm">
            <Sun className="w-4 h-4 mr-2" />
            Solar Proposal
          </Badge>
        </div>

        <div className="mb-4 sm:mb-5">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">Your Personal Solar Plan</h1>
          <p className="text-sm sm:text-lg text-gray-600 leading-relaxed">
            Prepared for {proposalData.customerName}, <br className="sm:hidden" />
            <span className="block sm:inline">{isMobile ? proposalData.address.split(',')[0] : proposalData.address} - {reportDate}</span>
          </p>
        </div>

        {/* Four stat tiles */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-700 mb-2">
                €{proposalData.annualSavings.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Annual Savings</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-700 mb-2">{proposalData.paybackPeriod} years</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Payback Period</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-700 mb-2">{proposalData.billReduction}%</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Bill Reduction</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                €{proposalData.netCost.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Net Cost (after grants)</div>
            </CardContent>
          </Card>
        </div>

        {/* Primary CTA */}
        <div className="text-center mb-4 sm:mb-5">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 py-4 mb-3 sm:mb-4 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleConsultationClick}
          >
            <Phone className="mr-3 h-5 w-5" />
            Book Free 10-min Consultation
          </Button>
          <p className="text-sm text-gray-600 font-medium">No obligation. Quick answers and next steps.</p>
        </div>

        {/* Disclaimer strip */}
        <p className="text-xs text-gray-500 text-center bg-white/70 p-3 sm:p-3 rounded-lg border border-white/50">
          Estimates based on your property details and current usage. Final specifications and pricing confirmed during
          site survey.
        </p>
      </div>

      {/* B. Your System (with warranty under each component) */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <Zap className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            Your System
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Personalized solar solution designed for your home</p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
              {/* Left column - system overview with warranty under each */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start space-x-4 sm:space-x-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <Sun className="w-6 h-6 sm:w-6 sm:h-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base mb-1">
                      {proposalData.panelCount} Solar Panels ({proposalData.systemSize} kWp)
                    </div>
                    <div className="text-gray-700 text-xs sm:text-sm font-medium mb-2">{proposalData.solarPanelName}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-3">
                      Annual output: {Math.round(proposalData.annualGeneration).toLocaleString()} kWh
                    </div>
                    <div className="text-xs text-gray-600 bg-yellow-100 px-3 py-2 rounded-md border border-yellow-200">
                      <Shield className="w-3 h-3 inline mr-2" />
                      25 years performance warranty
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Zap className="w-6 h-6 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base mb-1">Hybrid Inverter</div>
                    <div className="text-gray-700 text-xs sm:text-sm font-medium mb-2">{proposalData.inverterName}</div>
                    {/* <div className="text-xs sm:text-sm text-gray-600 mb-3">Battery-ready</div> */}
                    <div className="text-xs text-gray-600 bg-blue-100 px-3 py-2 rounded-md border border-blue-200">
                      <Shield className="w-3 h-3 inline mr-2" />
                      10 years product warranty
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-4 bg-green-50 p-4 rounded-lg border border-green-100">
                  <Battery className="w-6 h-6 sm:w-6 sm:h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base mb-1">
                      {proposalData.includeBattery
                        ? `${batteryUnits}× Battery Storage (${proposalData.batteryCapacity} kWh each)`
                        : "Battery-ready (optional)"}
                    </div>
                    {proposalData.includeBattery && (
                      <>
                        {/* <div className="text-xs sm:text-sm text-gray-600 mb-3">
                          Backup power: {backupHoursRange}
                        </div> */}
                        <div className="text-xs text-gray-600 bg-green-100 px-3 py-2 rounded-md border border-green-200">
                          <Shield className="w-3 h-3 inline mr-2" />
                          10 years product warranty
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {proposalData.includeEvCharger && (
                  <div className="flex items-start space-x-4 sm:space-x-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <Car className="w-6 h-6 sm:w-6 sm:h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm sm:text-base mb-1">EV Charger Ready</div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3">7 kW home charging capability</div>
                      <div className="text-xs text-gray-600 bg-purple-100 px-3 py-2 rounded-md border border-purple-200">
                        <Shield className="w-3 h-3 inline mr-2" />3 years product warranty
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - downloadable spec sheets */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  // onClick={() => window.open("/pdf/jinko_panel.pdf", "_blank")}
                  className="w-full p-3 sm:p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-yellow-800 text-sm sm:text-base">Solar Panel Datasheet</div>
                      <div className="text-xs sm:text-sm text-yellow-600 truncate">{proposalData.solarPanelName}</div>
                    </div>
                    <a href="/pdf/jinko_panel.pdf" download="JinkoSolar_440W_Spec_Sheet.pdf">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 ml-2 flex-shrink-0" />
                    </a>

                  </div>
                </button>


                <button
                  // onClick={() => window.open("/specs/inverter-spec.pdf", "_blank")}
                  className="w-full p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-blue-800 text-sm sm:text-base">Inverter Datasheet</div>
                      <div className="text-xs sm:text-sm text-blue-600 truncate">{proposalData.inverterName}</div>
                    </div>
                    <a href="/pdf/sig_inverter.pdf" download="Sigenergy_Inverter_Spec_Sheet.pdf">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 ml-2 flex-shrink-0" />
                    </a>
                  </div>
                </button>

                {proposalData.includeBattery && (
                  <button
                    // onClick={() => window.open("/specs/battery-spec.pdf", "_blank")}
                    className="w-full p-3 sm:p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-green-800 text-sm sm:text-base">Battery Datasheet</div>
                        <div className="text-xs sm:text-sm text-green-600 truncate">Sigenergy Battery</div>
                      </div>
                      <a href="/pdf/sig_battery.pdf" download="SigEnergy_Battery_8kWh_Spec_Sheet.pdf">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 ml-2 flex-shrink-0" />
                      </a>
                    </div>
                  </button>
                )}

                {/* {proposalData.includeEvCharger && (
                  <button
                    onClick={() => window.open("/specs/ev-charger-spec.pdf", "_blank")}
                    className="w-full p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-purple-800 text-sm sm:text-base">EV Charger Datasheet</div>
                        <div className="text-xs sm:text-sm text-purple-600 truncate">Zappi 7kW Smart Charger</div>
                      </div>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 ml-2 flex-shrink-0" />
                    </div>
                  </button>
                )} */}
              </div>
            </div>

            {/* Updated blue hint footnote */}
            <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center font-medium">
                <Shield className="w-4 h-4 inline mr-2" />
                Sized for your roof and usage. Battery boosts evening self-use. EV-ready for future.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* C. Price Breakdown (removed monitoring) */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <Euro className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Price Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Left: Line items */}
          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">Solar Panels + Hybrid Inverter</span>
                <span className="font-bold text-lg sm:text-xl text-blue-700">€{proposalData.solarPrice.toLocaleString()}</span>
              </div>
            </div>

            {proposalData.includeBattery && (
              <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">
                    Battery Storage ({batteryUnits}× {proposalData.batteryCapacity} kWh)
                  </span>
                  <span className="font-bold text-lg sm:text-xl text-green-700">€{proposalData.batteryPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            {proposalData.includeEvCharger && (
              <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">EV Charger (7kW, smart)</span>
                  <span className="font-bold text-lg sm:text-xl text-purple-700">€{proposalData.evPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Totals */}
          <div className="bg-white/90 backdrop-blur-sm border border-white/70 rounded-xl p-4 sm:p-5 shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-200">
                <span className="text-gray-700 font-bold text-sm sm:text-base">Subtotal</span>
                <span className="font-bold text-xl sm:text-2xl text-gray-900">€{proposalData.totalCost.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                {proposalData.availableGrant > 0 && (
                  <div className="flex justify-between items-center text-green-700 bg-green-50 p-3 rounded-lg">
                    <span className="font-semibold text-sm sm:text-base">Solar Grant (SEAI)</span>
                    <span className="font-bold text-base sm:text-lg">−€{proposalData.availableGrant.toLocaleString()}</span>
                  </div>
                )}
                {evGrantAmount > 0 && (
                  <div className="flex justify-between items-center text-green-700 bg-green-50 p-3 rounded-lg">
                    <span className="font-semibold text-sm sm:text-base">EV Grant</span>
                    <span className="font-bold text-base sm:text-lg">−€{evGrantAmount}</span>
                  </div>
                )}
                {(proposalData.availableGrant + evGrantAmount) > 0 && (
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 text-green-700">
                    <span className="font-bold text-sm sm:text-base">Total Grants</span>
                    <span className="font-bold text-lg sm:text-xl">
                      −€{(proposalData.availableGrant + evGrantAmount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-blue-300 pt-5 mt-4 bg-blue-50 -mx-5 px-5 pb-2 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Your Net Cost</span>
                  <span className="text-2xl sm:text-3xl font-bold text-blue-700">
                    €{proposalData.netCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* D. System Performance (with professional chart) */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <BarChart3 className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            System Performance
          </h2>
          <p className="text-sm sm:text-base text-gray-600">How your solar system will perform throughout the year</p>
        </div>

        <Card className="border border-gray-200 shadow-sm mb-4 sm:mb-5">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
              
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <div className="w-20 h-20 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-2">{proposalData.systemSize} kWp</div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mb-1">System Size</div>
                <div className="text-xs text-gray-500">Using {proposalData.panelCount} panels</div>
              </div>

              <div className="text-center bg-green-50 p-4 rounded-lg">
                <div className="w-20 h-20 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600 mb-2">{Math.round(annualTotal).toLocaleString()} kWh</div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mb-1">Annual Generation</div>
                <div className="text-xs text-gray-500">Total yearly output</div>
              </div>

              <div className="text-center bg-yellow-50 p-4 rounded-lg">
                <div className="w-20 h-20 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-10 h-10 sm:w-10 sm:h-10 text-yellow-600" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-600 mb-2">{Math.round(annualTotal / 365)} kWh</div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mb-1">Daily Average</div>
                <div className="text-xs text-gray-500">Typical daily output</div>
              </div>
            </div>

            {/* Professional Monthly Energy Production Chart - Show simplified view on mobile */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-lg border border-green-200">
              <div className="flex items-center mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
                <h4 className="font-bold text-green-800 text-sm sm:text-base">Monthly Energy Production</h4>
              </div>

              {!isMobile ? (
                <>
                  <p className="text-xs sm:text-sm text-green-700 mb-4 sm:mb-6">
                    Your solar system will produce different amounts of energy throughout the year based on seasonal
                    sunlight.
                  </p>

                  <div className="bg-white p-4 rounded-lg mb-4">
                    <div className="mb-4">
                      <PdfMonthlyProductionChart data={monthlyGenerationData} />
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold">
                      <div className="text-green-700">
                        <span className="text-gray-600">Annual Total:</span> {Math.round(annualTotal).toLocaleString()} kWh
                      </div>
                      <div className="text-green-700">
                        <span className="text-gray-600">Peak Month:</span> {monthNames[peakMonthIndex]} ( {Math.round(peakMonth)} kWh)
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-100 p-3 rounded border border-green-300">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-green-800 text-sm">Did You Know?</h5>
                        <p className="text-xs text-green-700">
                          Your solar system will continue producing energy for 25+ years, with only a small decrease in
                          efficiency over time (about 0.5% per year).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Mobile simplified view
                <div className="bg-white p-5 rounded-lg border border-green-100">
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div className="text-center bg-green-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-green-700 mb-1">
                        {Math.round(annualTotal).toLocaleString()} kWh
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Annual Total</div>
                    </div>
                    <div className="text-center bg-yellow-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-yellow-700 mb-1">
                        {monthNames[peakMonthIndex]}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Peak Month</div>
                      <div className="text-xs text-gray-500 mt-1">({Math.round(peakMonth)} kWh)</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-700 font-medium leading-relaxed">
                        Your system produces more energy in summer months and continues working for 25+ years.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* E. Financial Case (moved up in flow) */}
      <div className="p-4 sm:p-5 bg-gray-50">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <TrendingUp className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Financial Case
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Investment returns and lifetime value</p>
        </div>

        {/* Financial Snapshot - Reordered with breakeven in middle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <Card className="border border-blue-200 bg-blue-50 shadow-md">
            <CardContent className="p-5 text-center">
              <h4 className="font-bold text-blue-800 mb-3 text-base sm:text-lg">Your Investment</h4>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">
                €{proposalData.netCost.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">Net cost after grants</div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-green-50 shadow-md">
            <CardContent className="p-5 text-center">
              <h4 className="font-bold text-green-800 mb-3 text-base sm:text-lg">Break-Even Point</h4>
              <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">{proposalData.paybackPeriod} years</div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">When system pays for itself</div>
            </CardContent>
          </Card>

          <Card className="border border-purple-200 bg-purple-50 shadow-md">
            <CardContent className="p-5 text-center">
              <h4 className="font-bold text-purple-800 mb-3 text-base sm:text-lg">Annual Savings</h4>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 mb-2">
                €{proposalData.annualSavings.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-purple-600 font-medium">Every year after payback</div>
            </CardContent>
          </Card>
        </div>

        {/* Cumulative Savings Chart */}
        <Card className="border border-gray-200 shadow-sm mb-4 sm:mb-5">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-bold text-center mb-5 px-2">Cumulative Savings Over 20 Years</h3>

            <div className="bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 p-4 sm:p-6 rounded-lg border">
              {/* Y-axis label */}
              <div className="flex items-center mb-2">
                <div className="text-xs text-gray-600 font-medium">Cumulative Savings (€)</div>
              </div>

              <div className="relative h-48 sm:h-52 mb-1">
                {/* Tooltip */}
                <div
                  id="chart-tooltip"
                  className="absolute bg-black text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 transition-opacity z-10"
                  style={{ transform: 'translate(-50%, -100%)' }}
                >
                  <div id="tooltip-content"></div>
                </div>

                {/* Chart area with margin for labels */}
                <svg
                  className="w-full h-full cursor-crosshair"
                  viewBox="0 0 400 220"
                  preserveAspectRatio="xMidYMid meet"
                  onMouseMove={(e) => {
                    const svg = e.currentTarget;
                    const rect = svg.getBoundingClientRect();

                    // Get exact cursor position relative to SVG viewport
                    const svgX = ((e.clientX - rect.left) / rect.width) * 400;
                    const svgY = ((e.clientY - rect.top) / rect.height) * 220;

                    // Only show crosshair within chart area (excluding margins)
                    if (svgX >= 0 && svgX <= 400 && svgY >= 10 && svgY <= 180) {
                      const year = (svgX / 400) * 20;
                      const cumulativeSavings = year * proposalData.annualSavings;

                      // Show tooltip aligned with cursor
                      const tooltip = document.getElementById('chart-tooltip');
                      const tooltipContent = document.getElementById('tooltip-content');
                      if (tooltip && tooltipContent) {
                        tooltipContent.innerHTML = `Year ${year.toFixed(1)}<br/>€${Math.round(cumulativeSavings).toLocaleString()}`;
                        tooltip.style.left = `${(e.clientX - rect.left)}px`;
                        tooltip.style.top = `${(e.clientY - rect.top)}px`;
                        tooltip.style.opacity = '1';
                      }

                      // Position crosshair lines exactly at cursor position
                      const vLine = document.getElementById('vertical-line');
                      const hLine = document.getElementById('horizontal-line');
                      if (vLine && hLine) {
                        // Remove any transitions for instant response
                        vLine.style.transition = 'none';
                        hLine.style.transition = 'none';

                        // Vertical line: fixed X position, spans chart height
                        vLine.setAttribute('x1', svgX.toString());
                        vLine.setAttribute('x2', svgX.toString());
                        vLine.setAttribute('y1', '10');
                        vLine.setAttribute('y2', '180');
                        vLine.style.opacity = '1';

                        // Horizontal line: fixed Y position, spans chart width
                        hLine.setAttribute('x1', '0');
                        hLine.setAttribute('x2', '400');
                        hLine.setAttribute('y1', svgY.toString());
                        hLine.setAttribute('y2', svgY.toString());
                        hLine.style.opacity = '1';
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    const tooltip = document.getElementById('chart-tooltip');
                    const vLine = document.getElementById('vertical-line');
                    const hLine = document.getElementById('horizontal-line');
                    if (tooltip) tooltip.style.opacity = '0';
                    if (vLine) {
                      vLine.style.transition = 'opacity 0.2s';
                      vLine.style.opacity = '0';
                    }
                    if (hLine) {
                      hLine.style.transition = 'opacity 0.2s';
                      hLine.style.opacity = '0';
                    }
                  }}
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="180" fill="url(#grid)" />

                  {/* Investment line */}
                  <line
                    x1="0"
                    y1={180 - (proposalData.netCost / 40000) * 180}
                    x2="400"
                    y2={180 - (proposalData.netCost / 40000) * 180}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* Cumulative savings line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={Array.from({ length: 21 }, (_, i) => {
                      const year = i
                      const cumulativeSavings = year * proposalData.annualSavings
                      const x = (year / 20) * 400
                      const y = 180 - (cumulativeSavings / 40000) * 180
                      return `${x},${y}`
                    }).join(" ")}
                  />

                  {/* Profit area shading */}
                  <polygon
                    fill="rgba(34, 197, 94, 0.1)"
                    points={`${(proposalData.paybackPeriod / 20) * 400},${180 - (proposalData.netCost / 40000) * 180} 400,${180 - ((20 * proposalData.annualSavings) / 40000) * 180} 400,${180 - (proposalData.netCost / 40000) * 180}`}
                  />

                  {/* Crosshair lines (hidden by default) */}
                  <line
                    id="vertical-line"
                    x1="0"
                    y1="10"
                    x2="0"
                    y2="180"
                    stroke="#666"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    style={{ opacity: 0 }}
                  />
                  <line
                    id="horizontal-line"
                    x1="0"
                    y1="0"
                    x2="400"
                    y2="0"
                    stroke="#666"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    style={{ opacity: 0 }}
                  />

                  {/* Break-even label without box, positioned at intersection with spacing */}
                  <text
                    x={(proposalData.paybackPeriod / 20) * 400}
                    y={180 - (proposalData.netCost / 40000) * 180 - 20}
                    textAnchor="middle"
                    className="text-xs fill-blue-700 font-semibold"
                  >
                    Break-even
                  </text>

                  {/* Your profit label */}
                  <text x="350" y="25" className="text-xs fill-green-700 font-semibold">
                    Your profit
                  </text>

                  {/* X-axis labels positioned closer to chart */}
                  <text x="0" y="200" className="text-xs fill-gray-500" textAnchor="start">Year 0</text>
                  <text x="200" y="200" className="text-xs fill-gray-500" textAnchor="middle">Year 10</text>
                  <text x="400" y="200" className="text-xs fill-gray-500" textAnchor="end">Year 20</text>

                  {/* X-axis line */}
                  <line x1="0" y1="180" x2="400" y2="180" stroke="#d1d5db" strokeWidth="1" />
                </svg>
              </div>

              {/* X-axis title */}
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium">Time (Years)</div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-5 bg-white rounded-lg border shadow-sm">
                  <div className="text-lg sm:text-lg font-bold text-blue-700 mb-2">
                    Year {Math.ceil(proposalData.paybackPeriod)}
                  </div>
                  <div className="text-xs sm:text-xs text-gray-600 font-medium">Break-even</div>
                </div>
                <div className="text-center p-5 bg-white rounded-lg border shadow-sm">
                  <div className="text-lg sm:text-lg font-bold text-green-700 mb-2">
                    €{(proposalData.annualSavings * 10).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-xs text-gray-600 font-medium">Saved by year 10</div>
                </div>
                <div className="text-center p-5 bg-white rounded-lg border shadow-sm">
                  <div className="text-lg sm:text-lg font-bold text-purple-700 mb-2">
                    €{(proposalData.annualSavings * 20).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-xs text-gray-600 font-medium">Saved by year 20</div>
                </div>
              </div>
            </div>

            {/* Math strip */}
            <div className="bg-gray-50 p-5 rounded-lg border text-center mt-4">
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-4 text-sm">
                <span className="font-semibold">
                  <strong>Total System Cost:</strong> €{proposalData.totalCost.toLocaleString()}
                </span>
                {(proposalData.availableGrant + evGrantAmount) > 0 && (
                  <>
                    <span className="text-gray-400 hidden sm:inline">·</span>
                    <span className="font-semibold">
                      <strong>Grants:</strong> −€{proposalData.availableGrant.toLocaleString()}{evGrantAmount > 0 ? `, −€${evGrantAmount}` : ''}
                    </span>
                  </>
                )}
                <span className="text-gray-400 hidden sm:inline">·</span>
                <span className="text-blue-700 font-bold text-base">
                  <strong>Your Investment:</strong> €{proposalData.netCost.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Single Savings Calculator */}
        <SavingsCalculator />
      </div>

      {/* F. Environmental Impact (further reduced) */}
      <div className="p-4 sm:p-5 bg-green-50">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center text-gray-900">
            <Leaf className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            Environmental Impact
          </h2>
        </div>

        <div className="text-center mb-4 sm:mb-5">
          <div className="bg-white border border-green-200 inline-block rounded-xl p-4 sm:p-5 shadow-md">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              {environmentalData.co2_tonnes_per_year} tonnes CO₂ avoided per year
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1 sm:mb-2">{environmentalData.trees_equiv_per_year}</div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
              <span className="block sm:hidden">Trees/year</span>
              <span className="hidden sm:block">Trees equivalent per year</span>
            </div>
          </div>

          <div className="text-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">{environmentalData.cars_off_road_equiv}</div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
              <span className="block sm:hidden">Cars off road</span>
              <span className="hidden sm:block">Cars off road equivalent</span>
            </div>
          </div>

          <div className="text-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-3 sm:p-4 shadow-md">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1 sm:mb-2">{environmentalData.homes_powered_equiv}</div>
            <div className="text-xs sm:text-sm text-gray-700 font-medium leading-tight">
              <span className="block sm:hidden">Homes powered</span>
              <span className="hidden sm:block">Homes powered equivalent</span>
            </div>
          </div>
        </div>
      </div>

      {/* G. Property Value Impact */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <Home className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            Property Value Impact
          </h2>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
                  Homes with solar typically see ~2–6% higher sale prices over time.
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start bg-green-50 p-3 rounded-lg">
                    <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Lower bills attract buyers</span>
                  </div>
                  <div className="flex items-start bg-green-50 p-3 rounded-lg">
                    <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Improved BER rating</span>
                  </div>
                  <div className="flex items-start bg-green-50 p-3 rounded-lg">
                    <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Strong buyer demand for efficient homes</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-blue-700 mb-3">2-6%</div>
                  <div className="text-blue-600 mb-4 font-semibold text-base sm:text-lg">Typical property value increase</div>
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Note:</strong> Not a formal valuation; local market conditions apply.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* H. Installation & Warranty */}
      <div className="p-4 sm:p-5 bg-gray-50">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <Award className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Installation & Warranty
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Professional installation with comprehensive coverage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left card: Comprehensive Warranties */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Comprehensive Warranties</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-semibold">Solar Panels</span>
                  <span className="font-bold text-blue-700 text-right">
                    <span className="hidden sm:inline">25 years performance</span>
                    <span className="sm:hidden">25 years</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-semibold">Inverter</span>
                  <span className="font-bold text-blue-700 text-right">
                    <span className="hidden sm:inline">10 years product</span>
                    <span className="sm:hidden">10 years</span>
                  </span>
                </div>
                {proposalData.includeBattery && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-gray-700 font-semibold">Battery</span>
                    <span className="font-bold text-blue-700 text-right">
                      <span className="hidden sm:inline">10 years product</span>
                      <span className="sm:hidden">10 years</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-semibold">Installation Work</span>
                  <span className="font-bold text-blue-700 text-right">
                    <span className="hidden sm:inline">5 years workmanship</span>
                    <span className="sm:hidden">5 years</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right card: Installation Process */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Installation Process</h3>
              <div className="space-y-4">
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Site Survey & Design (1 day to 1 week)</p>
                    <p className="text-sm text-gray-600">Technical assessment and final specifications</p>
                  </div>
                </div>
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Permits & Approvals (2–4 weeks)</p>
                    <p className="text-sm text-gray-600">Grid connection and planning permissions</p>
                  </div>
                </div>
                <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Professional Installation (1–2 days)</p>
                    <p className="text-sm text-gray-600">Complete system installation and commissioning</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-bold text-green-800 text-center">
                  Local install team handles everything — fully insured and certified.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* I. Your Trusted Installer - Clean 3-Column Layout */}
      <div className="p-4 sm:p-5 bg-white">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <Shield className="mr-3 sm:mr-4 h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
            Your Trusted Installer
          </h2>
          <p className="text-sm sm:text-lg text-gray-600">Leading solar installation specialists</p>
        </div>

        {/* Clean 3-column layout */}
        <Card className="border border-gray-200 shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Left: Brand & Reviews */}
              <div className="text-center md:text-left bg-gray-50 p-5 rounded-lg">
                <img
                  src={branding.logo}
                  alt={`${branding.name} Logo`}
                  className="h-12 sm:h-16 mx-auto md:mx-0 mb-4"
                />

                {branding.reviews && (
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" />
                    <span className="text-base sm:text-xl font-bold text-gray-900">
                      {branding.reviews.rating} ({branding.reviews.count} Google Reviews)
                    </span>
                  </div>
                )}

                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {branding.description || "Ireland's trusted SEAI-registered solar installer, delivering reliable energy solutions for your home and future."}
                </p>
              </div>

              {/* Middle: Certifications */}
              <div className="space-y-4">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 text-center">Accreditations & Guarantees</h4>

                <div className="space-y-4">
                  {branding.certifications?.map((cert, index) => (
                    <div key={index} className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                      <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                      <span className="font-bold text-green-800">{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Founder Trust Block */}
              {branding.founder ? (
                <div className="text-center bg-blue-50 p-5 rounded-lg">
                  {branding.founder.photo && (
                    <img
                      src={branding.founder.photo}
                      alt={`${branding.founder.name}, ${branding.founder.title}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                    />
                  )}

                  <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-2">{branding.founder.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 font-medium">{branding.founder.title}</p>

                  <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                    {branding.founder.description}
                  </p>

                  {branding.founder.quote && (
                    <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-sm text-blue-800 italic font-semibold">
                        "{branding.founder.quote}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center bg-blue-50 p-5 rounded-lg">
                  <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                    <p className="text-sm text-blue-800 italic font-semibold">
                      "Delivering solar installations you can trust for decades to come."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Testimonials - Streamlined */}
        {branding.testimonials && branding.testimonials.length > 0 && (
          <Card className="border border-gray-200 shadow-sm mt-4 sm:mt-5">
            <CardContent className="p-4 sm:p-5">
              <h4 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
                <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-green-600" />
                What Our Customers Say
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {branding.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-md">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-5 italic text-sm sm:text-base leading-relaxed">"{testimonial.text}"</p>
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">{testimonial.name}</span>
                      <span className="text-gray-600"> - {testimonial.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MOVED CTA - After Trusted Installer (Peak Trust Moment) */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="text-center">
          <div className="bg-white/15 backdrop-blur rounded-xl p-6 sm:p-6 mb-4 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg mb-6">Book your free consultation with {branding.name}.</p>

            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-lg sm:text-xl px-10 py-5 mb-4 shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={handleConsultationClick}
            >
              <Phone className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              Schedule Your Call Now
            </Button>

            <p className="text-blue-100 text-base sm:text-lg font-medium">No obligation. No pressure. Just expert advice.</p>
          </div>
        </div>
      </div>

      {/* J. SEAI Grant Information */}
      <div className="p-4 sm:p-5 bg-blue-50">
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:justify-between items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
              <Award className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              SEAI Grant Information
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Government support for your solar installation</p>
          </div>
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold">Handled for you</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Grant Process */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Grant Process</h3>
              <div className="space-y-4">
                <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Grant Application</p>
                    <p className="text-sm text-gray-600">We handle all paperwork and submissions</p>
                  </div>
                </div>
                <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">System Installation</p>
                    <p className="text-sm text-gray-600">Professional installation by certified team</p>
                  </div>
                </div>
                <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">BER Assessment</p>
                    <p className="text-sm text-gray-600">Post-installation energy rating</p>
                  </div>
                </div>
                <div className="flex items-start bg-green-50 p-4 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mr-4 text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Grant Payment</p>
                    <p className="text-sm text-gray-600">Direct payment to homeowner</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Eligibility Requirements */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Eligibility Requirements</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Property built before 2021</span>
                </div>
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Suitable roof space and orientation</span>
                </div>
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">SEAI registered installer</span>
                </div>
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">System size 1-6kWp</span>
                </div>
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Post-installation BER required</span>
                </div>
                <div className="flex items-center bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Property owner or written permission</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold">
                  <strong>Note:</strong> We manage all grant application paperwork to ensure a smooth process.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* K. Next Steps (much more compact and aligned) */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 sm:mb-5 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center justify-center text-gray-900">
            <FileText className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Next Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Step 1: Consultation Call */}
          <Card className="border border-blue-200 bg-blue-50 shadow-md">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Consultation Call</h3>
              <p className="text-sm text-gray-600 mb-4">Review proposal and discuss questions</p>

              <div className="bg-white/70 backdrop-blur p-3 rounded-lg mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-blue-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Review specifications</span>
                  </div>
                  <div className="flex items-center text-blue-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Discuss costings</span>
                  </div>
                  <div className="flex items-center text-blue-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Answer questions</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-blue-800">10-15 minutes</div>
                <div className="text-sm font-bold text-blue-800">Free consultation</div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Site Survey */}
          <Card className="border border-green-200 bg-green-50 shadow-md">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Site Survey</h3>
              <p className="text-sm text-gray-600 mb-4">Technical assessment and measurements</p>

              <div className="bg-white/70 backdrop-blur p-3 rounded-lg mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-green-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Property inspection</span>
                  </div>
                  <div className="flex items-center text-green-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Roof measurements</span>
                  </div>
                  <div className="flex items-center text-green-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Electrical assessment</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-green-800">1-2 hours</div>
                <div className="text-sm font-bold text-green-800">Free assessment</div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Installation */}
          <Card className="border border-gray-300 bg-gray-50 shadow-md">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 bg-gray-700 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Installation</h3>
              <p className="text-sm text-gray-600 mb-4">Professional installation and setup</p>

              <div className="bg-white/70 backdrop-blur p-3 rounded-lg mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Contract signing</span>
                  </div>
                  <div className="flex items-center text-gray-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Grant submission</span>
                  </div>
                  <div className="flex items-center text-gray-800 justify-center">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>System installation</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-gray-800">2-3 weeks</div>
                <div className="text-sm font-bold text-gray-800">After approval</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* L. FAQ */}
      <div className="p-4 sm:p-5 bg-gray-50">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 flex items-center text-gray-900">
            <FileText className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Addressing your key concerns and questions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openFAQ === index}
              onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
            />
          ))}
        </div>
      </div>

      {/* M. Final CTA (Shorter) */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Start Your Solar Journey Today</h2>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-lg sm:text-xl px-10 py-5 mb-6 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleConsultationClick}
          >
            <Phone className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            Get Started Now
          </Button>

          <div className="border-t border-white/20 pt-5 mt-4">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6 mb-5">
              <img
                src={branding.logo}
                alt={branding.name}
                className="h-10 brightness-0 invert"
              />
              <div className="text-center">
                <div className="font-bold text-base sm:text-lg">{branding.name}</div>
                <div className="text-blue-200 text-sm sm:text-base">SEAI Registered Solar Installer</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm sm:text-base">
              <div className="flex items-center justify-center">
                <Phone className="mr-3 h-5 w-5" />
                <span>{branding.phone}</span>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="mr-3 h-5 w-5" />
                <span>{branding.email}</span>
              </div>
              <div className="flex items-center justify-center">
                <Globe className="mr-3 h-5 w-5" />
                <span>{branding.website}</span>
              </div>
            </div>

            {/* Add Powered by Voltflo */}
            <div className="mt-5 pt-4 border-t border-white/20">
              <p className="text-xs sm:text-sm text-blue-200 text-center">
                Powered by <span className="font-bold text-white">Voltflo</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-blue-200 font-medium leading-relaxed">
            Figures are estimates based on national datasets and your inputs. Final pricing and savings are confirmed
            after a site visit.
          </p>
        </div>
      </div>
    </div>
  )
}
