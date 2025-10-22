"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Sun, Ruler, Globe, Leaf, Info, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationDataItem {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  tooltip: string
}

interface LocationDataCardProps {
  trueSolarEnergyGenerated?: number
}

// Irish cities/counties sunshine hours lookup table
const IRISH_SUNSHINE_HOURS = {
  'dublin': 1455, // Average of 1424 and 1485
  'cork': 1516, // Average of 1424, 1420, and 1603
  'galway': 1205, // Average of 1198 and 1212
  'belfast': 1247,
  'limerick': 1295,
  'shannon': 1295, // Same as Limerick
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
  trueSolarEnergyGenerated: number,
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
  const annualPVGeneration = trueSolarEnergyGenerated || energyIndependenceData.annualPVGeneration || 4000
  const calculatedHours = Math.round(annualPVGeneration / (systemSize * 0.8))
  
  return {
    hours: calculatedHours,
    isFromTable: false
  }
}

export default function LocationDataCard({ trueSolarEnergyGenerated = 0 }: LocationDataCardProps) {
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // State for localStorage data
  const [businessProposal, setBusinessProposal] = useState<any>({})
  const [roofArea, setRoofArea] = useState<string>("60")
  const [selectedLocation, setSelectedLocation] = useState<any>({})
  const [energyIndependenceData, setEnergyIndependenceData] = useState<any>({})

  // Check if mobile on mount
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const businessProposalData = localStorage.getItem("business_proposal")
      if (businessProposalData) {
        setBusinessProposal(JSON.parse(businessProposalData))
      }
      
      const roofAreaData = localStorage.getItem("roof_area")
      if (roofAreaData) {
        setRoofArea(roofAreaData)
      }
      
      const selectedLocationData = localStorage.getItem("selectedLocation")
      if (selectedLocationData) {
        setSelectedLocation(JSON.parse(selectedLocationData))
      }

      const energyIndependenceDataRaw = localStorage.getItem("energy_independence_data")
      if (energyIndependenceDataRaw) {
        setEnergyIndependenceData(JSON.parse(energyIndependenceDataRaw))
      }
    } catch (error) {
    }
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

  const handleMouseEnter = useCallback((index: number) => {
    if (!isMobile) {
      setActiveItem(index)
    }
  }, [isMobile])

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setActiveItem(null)
    }
  }, [isMobile])

  const handleCardClick = useCallback((e: React.MouseEvent, index: number) => {
    if (isMobile) {
      e.preventDefault()
      e.stopPropagation()
      setActiveItem(activeItem === index ? null : index)
    }
  }, [isMobile, activeItem])

  const handleTooltipClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  // Get sunshine hours using new lookup logic
  const sunshineData = getSunshineHours(selectedLocation, businessProposal, trueSolarEnergyGenerated, energyIndependenceData)

  const locationData: LocationDataItem[] = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Solar System Size",
      value: `${parseFloat(businessProposal.system_size || "4").toFixed(1)} kWp`,
      color: "from-blue-500 to-indigo-600",
      tooltip: `kWp = kilowatt peak - the maximum power your solar panels can generate under ideal conditions. Your ${parseFloat(businessProposal.system_size || "4").toFixed(1)} kWp system has ~${Math.round((parseFloat(businessProposal.system_size || "4") / parseFloat(process.env.PANEL_WATTAGE || "0.45")))} panels and generates ~${Math.round(trueSolarEnergyGenerated || (parseFloat(businessProposal.system_size || "4") * 1000))} kWh/year`
    },
    {
      icon: <Ruler className="w-5 h-5" />,
      label: "Roof Area", 
      value: `${Math.round(Number(roofArea)) || 60} m²`,
      color: "from-sky-400 to-blue-500",
      tooltip: `Based on satellite imagery analysis, your property has an estimated footprint of approximately ${roofArea || "60"} square meters.`
    },
    {
      icon: <Sun className="w-5 h-5" />,
      label: "Annual Sunshine",
      value: `${sunshineData.hours} hours`,
      color: "from-yellow-400 to-amber-500",
      tooltip: sunshineData.isFromTable 
        ? `Your location receives approximately ${sunshineData.hours} hours of sunshine annually based on Met Éireann data for ${sunshineData.location?.charAt(0).toUpperCase()}${sunshineData.location?.slice(1)}. This official meteorological data provides accurate local sunshine statistics for solar energy calculations.`
        : `Your location receives approximately ${sunshineData.hours} hours of sunshine annually. This is calculated based on your system's ${Math.round(trueSolarEnergyGenerated || energyIndependenceData.annualPVGeneration || 4000)} kWh annual generation capacity and ${businessProposal.system_size || "4"} kW system size.`
    },
    {
      icon: <Leaf className="w-5 h-5" />,
      label: "CO₂ Avoided",
      value: `${businessProposal.carbon_avoided_per_year || "1.3"} tonnes/year`,
      color: "from-lime-400 to-green-500",
      tooltip: `Your solar system will prevent approximately ${businessProposal.carbon_avoided_per_year || "1.3"} tonnes of CO₂ emissions annually - equivalent to planting ${Math.round((parseFloat(businessProposal.carbon_avoided_per_year || "1.3") * 46))} trees!`
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 mb-16"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Location Insights</h3>
            <p className="text-slate-300 text-sm opacity-90">Key data points for your property</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-4 sm:p-6 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {locationData.map((item, index) => (
            <motion.div
              key={index}
              ref={el => { cardRefs.current[index] = el }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              className="relative group h-full"
              onMouseEnter={() => handleMouseEnter(index)}
              // onMouseLeave={() => handleMouseLeave()}
              onClick={(e) => handleCardClick(e, index)}
            >
              <div className={cn(
                "bg-white rounded-xl p-3 sm:p-4 border border-slate-200 group-hover:border-slate-300 transition-all duration-300 group-hover:shadow-md h-full flex flex-col justify-between cursor-pointer select-none",
                "hover:scale-[1.02] transform touch-manipulation",
                activeItem === index && "border-amber-300 shadow-lg scale-[1.02]"
              )}>
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm",
                      item.color
                    )}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 text-xs sm:text-sm leading-tight">{item.label}</h4>
                    </div>
                    <div className="relative">
                      <Info className={cn(
                        "w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-600 transition-colors cursor-help",
                        activeItem === index && "text-amber-500"
                      )} />
                    </div>
                  </div>
                  
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-2">{item.value}</div>
                </div>
                
                <motion.div
                  className={cn(
                    "w-full h-1.5 rounded-full bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity",
                    item.color
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Animated background glow on hover/active */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 -z-10 pointer-events-none",
                  item.color
                )}
                animate={{
                  opacity: activeItem === index ? 0.1 : 0
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Enhanced Thought Bubble Tooltip */}
              <AnimatePresence mode="wait">
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
                    className={cn(
                      "fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
                    )}
                    style={{
                      // No transform here!
                    }}
                    onClick={handleTooltipClick}
                  >
                    <div
                      className={cn(
                        "shadow-2xl border border-gray-200 bg-white rounded-2xl overflow-hidden p-4",
                        "w-72 sm:w-80 max-w-[90vw] pointer-events-auto relative"
                      )}
                      style={{
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Close button in top right corner - Made larger and more visible */}
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
                          item.color
                        )}>
                          {item.icon}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-base">{item.label}</h4>
                      </div>
                      
                      {/* Tooltip content */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-1">
                        {item.tooltip}
                      </p>
                      
                      {/* Bubble tail - Improved positioning with extra space for bottom bubbles */}
                      {/* <div className={cn(
                        "absolute w-6 h-6 bg-white border-r border-b border-gray-200 transform rotate-45",
                        index < 2 
                          ? "-top-3 left-6" 
                          : "-bottom-6 left-6"
                      )} /> */}
                      
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
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: locationData.length * 0.1 + 0.5, duration: 0.6 }}
          className="mt-4 sm:mt-6 text-center"
        >
          <p className="text-slate-500 text-xs flex items-center justify-center">
            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-slate-400" />
            {isMobile ? 'Tap cards for detailed explanations' : 'Hover or click cards for detailed explanations'}
          </p>
        </motion.div>
      </div>
      
      {/* Overlay to close tooltip when clicking outside - Improved for mobile */}
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

// Add AnimatePresence import if not already there (it's part of framer-motion)
// import { AnimatePresence } from "framer-motion" 
// Ensure this is handled correctly. Framer Motion's AnimatePresence is usually imported with motion. 
