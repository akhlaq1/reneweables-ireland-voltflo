"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Zap, Percent, Sun, Ruler, Leaf, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnergyIndependenceData {
  annualPVGeneration: number
  averageConsumption: number
  calculatedAt: string
  practicalIndependence: number
  rawIndependenceRatio: number
  selfConsumptionFactor: number
  source: string
}

interface BusinessProposal {
  system_size?: string
  carbon_avoided_per_year?: string
}

// Irish cities/counties sunshine hours lookup table
const IRISH_SUNSHINE_HOURS = {
  'dublin': 1455,
  'cork': 1516,
  'galway': 1205,
  'belfast': 1247,
  'limerick': 1295,
  'shannon': 1295,
  'wexford': 1411,
  'waterford': 1356
} as const

// Function to extract city/county from address string
function extractLocationFromAddress(address: string): string | null {
  if (!address) return null
  
  const addressLower = address.toLowerCase()
  
  // Check for direct city/county matches
  for (const [city] of Object.entries(IRISH_SUNSHINE_HOURS)) {
    if (addressLower.includes(city)) {
      return city
    }
  }
  
  // Additional aliases and variations
  if (addressLower.includes('dublin airport') || addressLower.includes('dublin city')) {
    return 'dublin'
  }
  if (addressLower.includes('cork airport') || addressLower.includes('cork city')) {
    return 'cork'
  }
  if (addressLower.includes('shannon airport')) {
    return 'shannon'
  }
  if (addressLower.includes('county dublin')) {
    return 'dublin'
  }
  if (addressLower.includes('county cork')) {
    return 'cork'
  }
  if (addressLower.includes('county galway')) {
    return 'galway'
  }
  if (addressLower.includes('county wexford')) {
    return 'wexford'
  }
  if (addressLower.includes('county waterford')) {
    return 'waterford'
  }
  if (addressLower.includes('county limerick')) {
    return 'limerick'
  }
  
  return null
}

// Function to get sunshine hours from lookup table or calculate fallback
function getSunshineHours(
  selectedLocation: any,
  businessProposal: any,
  energyIndependenceData: any
): { hours: number; isFromTable: boolean; location?: string } {
  // Try to get from lookup table first
  if (selectedLocation?.address) {
    const detectedLocation = extractLocationFromAddress(selectedLocation.address)
    if (detectedLocation && IRISH_SUNSHINE_HOURS[detectedLocation as keyof typeof IRISH_SUNSHINE_HOURS]) {
      return {
        hours: IRISH_SUNSHINE_HOURS[detectedLocation as keyof typeof IRISH_SUNSHINE_HOURS],
        isFromTable: true,
        location: detectedLocation
      }
    }
  }
  
  // Fallback to current calculation
  const systemSize = parseFloat(businessProposal.system_size || "4")
  const annualPVGeneration = energyIndependenceData.annualPVGeneration || 4000
  const calculatedHours = Math.round(annualPVGeneration / (systemSize * 0.8))
  
  return {
    hours: calculatedHours,
    isFromTable: false
  }
}

export default function SolarPanelInfoCard() {
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const [energyData, setEnergyData] = useState<EnergyIndependenceData | null>(null)
  const [businessProposal, setBusinessProposal] = useState<BusinessProposal | null>(null)
  const [roofArea, setRoofArea] = useState<string>("0")
  const [selectedLocation, setSelectedLocation] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Get energy independence data
      const energyIndependenceData = localStorage.getItem("energy_independence_data")
      if (energyIndependenceData) {
        setEnergyData(JSON.parse(energyIndependenceData))
      }

      // Get business proposal for system size calculation
      const businessProposalData = localStorage.getItem("business_proposal")
      if (businessProposalData) {
        setBusinessProposal(JSON.parse(businessProposalData))
      }

      // Get roof area data
      const roofAreaData = localStorage.getItem("roof_area")
      if (roofAreaData) {
        setRoofArea(roofAreaData)
      }

      // Get selected location data
      const selectedLocationData = localStorage.getItem("selectedLocation")
      if (selectedLocationData) {
        setSelectedLocation(JSON.parse(selectedLocationData))
      }

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }, [])

  // Check if mobile on mount
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (activeItem !== null) {
        const clickedOnCard = cardRefs.current.some(ref => 
          ref && ref.contains(event.target as Node)
        )
        const clickedOnTooltip = tooltipRefs.current.some(ref => 
          ref && ref.contains(event.target as Node)
        )
        
        if (!clickedOnCard && !clickedOnTooltip) {
          setActiveItem(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [activeItem])

  const handleCardClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveItem(activeItem === index ? null : index)
  }, [activeItem])

  const handleTooltipClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (isLoading) {
    return (
      <motion.div
        className="w-full rounded-xl bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-lg border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </motion.div>
    )
  }

  if (!energyData) {
    return null
  }

  // Calculate number of panels
  const calculatePanelCount = (): number => {
    // Try to get from system size first (most accurate)
    if (businessProposal?.system_size) {
      const systemSizeKW = parseFloat(businessProposal.system_size)
      const panelWattage = 0.44 // Standard panel wattage in kWp
      return Math.round(systemSizeKW / panelWattage)
    }
    
    // Fallback: estimate from annual PV generation
    // Assuming average panel produces ~400 kWh/year in Ireland
    return Math.ceil(energyData.annualPVGeneration / 400)
  }

  const panelCount = calculatePanelCount()
  const formattedGeneration = energyData.annualPVGeneration.toLocaleString()
  const independencePercentage = Math.round(energyData.rawIndependenceRatio)

  // Get sunshine hours using the same logic as location-data-card
  const sunshineData = getSunshineHours(selectedLocation, businessProposal, energyData)

  // Check if roof area is 0 to determine which cards to show
  const shouldHideRoofAreaCards = roofArea === "0" || Number(roofArea) === 0

  // KPI data for the cards
  const allKpiData = [
    {
      icon: <Zap className="h-5 w-5" />,
      label: "Solar System Size",
      value: `${parseFloat(businessProposal?.system_size || "4").toFixed(1)} kWp`,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      tooltip: `kWp = kilowatt peak - the maximum power your solar panels can generate under ideal conditions. Your ${parseFloat(businessProposal?.system_size || "4").toFixed(1)} kWp system has ~${Math.round((parseFloat(businessProposal?.system_size || "4") / parseFloat(process.env.PANEL_WATTAGE || "0.44")))} panels and generates ~${Math.round(energyData?.annualPVGeneration || (parseFloat(businessProposal?.system_size || "4") * 1000))} kWh/year`
    },
    {
      icon: <Ruler className="h-5 w-5" />,
      label: "Roof Area",
      value: `${Math.round(Number(roofArea)) || 60} m²`,
      color: "from-sky-400 to-sky-500",
      bgColor: "from-sky-50 to-sky-100",
      tooltip: `Based on satellite imagery analysis, your property has an estimated footprint of approximately ${roofArea || "60"} square meters.`,
      hidden: shouldHideRoofAreaCards
    },
    {
      icon: <Sun className="h-5 w-5" />,
      label: "Annual Sunshine",
      value: `${sunshineData.hours} hours`,
      color: "from-yellow-400 to-orange-500",
      bgColor: "from-yellow-50 to-orange-100",
      tooltip: sunshineData.isFromTable 
        ? `Your location receives approximately ${sunshineData.hours} hours of sunshine annually based on Met Éireann data for ${sunshineData.location?.charAt(0).toUpperCase()}${sunshineData.location?.slice(1)}. This official meteorological data provides accurate local sunshine statistics for solar energy calculations.`
        : `Your location receives approximately ${sunshineData.hours} hours of sunshine annually. This is calculated based on your system's ${Math.round(energyData?.annualPVGeneration || 4000)} kWh annual generation capacity and ${businessProposal?.system_size || "4"} kW system size.`
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      label: "CO₂ Avoided",
      value: `${Math.round(parseFloat(businessProposal?.carbon_avoided_per_year || "1.3"))} tonnes`,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      tooltip: `Your solar system will prevent approximately ${businessProposal?.carbon_avoided_per_year || "1.3"} tonnes of CO₂ emissions annually - equivalent to planting ${Math.round((parseFloat(businessProposal?.carbon_avoided_per_year || "1.3") * 46))} trees!`,
      hidden: shouldHideRoofAreaCards
    }
  ]

  // Filter out hidden cards
  const kpiData = allKpiData.filter(card => !card.hidden)

  return (
    <motion.div
      className="w-full rounded-xl bg-gradient-to-br from-blue-50 to-green-50 p-6 shadow-lg border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
          <Sun className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Your Solar System</h3>
          <p className="text-sm text-gray-600">Custom designed for your roof</p>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Key message */}
        <div className="bg-white/70 rounded-lg p-4 border border-white/50">
          <p className="text-gray-700 leading-relaxed">
            Your roof can accommodate{" "}
            <span className="font-bold text-blue-600">{panelCount} panels</span>{" "}
            that will generate{" "}
            <span className="font-bold text-green-600">{formattedGeneration} kWh</span>{" "}
            annually, covering{" "}
            <span className="font-bold text-orange-600">{independencePercentage}%</span>{" "}
            of your consumption needs.
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 gap-3 relative">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={index}
              ref={el => { cardRefs.current[index] = el }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index + 0.3, duration: 0.4 }}
              className={cn(
                "bg-gradient-to-br rounded-lg p-3 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer select-none group relative",
                "hover:scale-[1.02] transform touch-manipulation",
                activeItem === index && "border-amber-300 shadow-lg scale-[1.02]",
                kpi.bgColor
              )}
              onClick={(e) => handleCardClick(e, index)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm",
                  kpi.color
                )}>
                  <div className="scale-75">{kpi.icon}</div>
                </div>
                <div className="relative">
                  <Info className={cn(
                    "w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors cursor-help",
                    activeItem === index && "text-amber-500"
                  )} />
                </div>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-xl font-bold text-gray-800">{kpi.value}</div>
                <div className="text-xs text-gray-600 font-medium">{kpi.label}</div>
              </div>

              {/* Progress bar */}
              <motion.div
                className={cn(
                  "w-full h-1 rounded-full bg-gradient-to-r mt-2 opacity-80",
                  kpi.color
                )}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.1 * index + 0.5, duration: 0.8, ease: "easeOut" }}
              />

              {/* Animated background glow on hover/active */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 -z-10 pointer-events-none",
                  kpi.color
                )}
                animate={{
                  opacity: activeItem === index ? 0.1 : 0
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Tooltip Rendering */}
        {kpiData.map((kpi, index) => (
          <AnimatePresence mode="wait" key={`tooltip-${index}`}>
            {activeItem === index && (
              <motion.div
                ref={el => { tooltipRefs.current[index] = el }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  layout: { duration: 0.2 }
                }}
                className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
                onClick={handleTooltipClick}
              >
                <div
                  className="shadow-2xl border border-gray-200 bg-white rounded-2xl overflow-hidden p-4 w-72 sm:w-80 max-w-[90vw] pointer-events-auto relative"
                  style={{
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActiveItem(null)
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors touch-manipulation shadow-sm z-10"
                    aria-label="Close tooltip"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Header with icon */}
                  <div className="flex items-center gap-3 mb-3 pr-12">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm",
                      kpi.color
                    )}>
                      {kpi.icon}
                    </div>
                    <h4 className="font-semibold text-gray-800 text-base">{kpi.label}</h4>
                  </div>
                  
                  {/* Tooltip content */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-1">
                    {kpi.tooltip}
                  </p>
                  
                  {/* Close hint for mobile */}
                  {isMobile && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center">Tap anywhere else to close</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Additional info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <Info className="w-3 h-3 mr-1 text-slate-400" />
            {isMobile ? 'Tap cards for detailed explanations' : 'Hover or click cards for detailed explanations'}
          </p>
        </div>
      </div>

      {/* Overlay to close tooltip when clicking outside */}
      <AnimatePresence>
        {activeItem !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-[1px]"
            onClick={() => setActiveItem(null)}
            style={{ 
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              zIndex: 9998
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 