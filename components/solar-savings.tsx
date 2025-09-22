"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ArrowUpRight,
  ChevronDown,
  Home,
  LineChart,
  Timer,
  Zap,
  Plus,
  Info,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  Award,
  X,
  Car,
  Battery,
  Receipt,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { MonthlyEnergyProductionCard } from "@/components/monthly-energy-production-card"

// Utility function to get energy independence data from localStorage (can be used by other components)
export const getEnergyIndependenceFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('energy_independence_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to retrieve energy independence data from localStorage:', error);
    }
  }
  return null;
};

// Utility function to save energy independence data to localStorage (can be used by other components)
export const saveEnergyIndependenceToStorage = (data: any, source = 'unknown') => {
  if (typeof window !== 'undefined') {
    try {
      const energyIndependenceStorage = {
        ...data,
        calculatedAt: new Date().toISOString(),
        source
      };
      localStorage.setItem('energy_independence_data', JSON.stringify(energyIndependenceStorage));
      console.log('Energy independence data saved to localStorage:', energyIndependenceStorage);
      return true;
    } catch (error) {
      console.error('Failed to save energy independence data to localStorage:', error);
      return false;
    }
  }
  return false;
};

export default function SolarSavings({ businessProposalData }: { businessProposalData: any }) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Energy calculations for savings and independence
  const calculateEnergyData = () => {
    // Bill to kWh mapping as specified
    const bill_to_kwh_mapping = {
      150: 3000,  
      250: 4500, 
      350: 6000,   
      450: 7500,   
      550: 9000,  
      700: 10000   
    };

    // Get bill amount from localStorage
    let averageConsumption = 4200; // Default fallback
    try {
      if (typeof window !== 'undefined') {
        const personaliseData = localStorage.getItem('personalise_answers');
        if (personaliseData) {
          const parsed = JSON.parse(personaliseData);
          const billAmount = parsed.billAmount;
          if (billAmount && bill_to_kwh_mapping[billAmount as keyof typeof bill_to_kwh_mapping]) {
            averageConsumption = bill_to_kwh_mapping[billAmount as keyof typeof bill_to_kwh_mapping];
          }
        }
      }
    } catch (error) {
      console.error('Failed to get bill amount from localStorage:', error);
    }
    
    // Calculate annual PV generation from monthly forecast
    const annualPVGeneration = businessProposalData?.monthly_forecast?.reduce(
      (total: number, forecast: any) => total + forecast.monthly_sum, 0
    ) || 0;

    // Raw independence ratio (before self-consumption adjustment)
    const rawIndependenceRatio = annualPVGeneration > 0 ? (annualPVGeneration / averageConsumption) * 100 : 0;

    // Self-consumption factor (typical 30-50% without batteries in Ireland)
    // Using 65% as the target independence level
    const SELF_CONSUMPTION_FACTOR = 0.65;

    // Practical energy independence (accounting for self-consumption)
    const practicalIndependence = annualPVGeneration > 0 ? ((annualPVGeneration * SELF_CONSUMPTION_FACTOR) / averageConsumption) * 100 : 0;

    return {
      annualPVGeneration: Math.round(annualPVGeneration),
      averageConsumption,
      rawIndependenceRatio: Math.round(rawIndependenceRatio),
      practicalIndependence: Math.round(practicalIndependence),
      selfConsumptionFactor: SELF_CONSUMPTION_FACTOR
    };
  };

  const energyData = calculateEnergyData();
  
  // Save energy independence data to localStorage
  useEffect(() => {
    if (energyData.annualPVGeneration > 0) {
      saveEnergyIndependenceToStorage(energyData, 'solar-savings-component');
    }
  }, [energyData.annualPVGeneration, energyData.practicalIndependence, energyData.averageConsumption]);

  const [animatedValues, setAnimatedValues] = useState({
    savings: parseInt(businessProposalData?.electricity_bill_savings?.toFixed(0)) || 1200,
    lifetime: 30000,
    property: 4,
  })
  const [showHint, setShowHint] = useState(true)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Detect if device is mobile/touch device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window))
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Animate values when card is expanded
  useEffect(() => {
    const targetSavings = parseInt(businessProposalData?.electricity_bill_savings?.toFixed(0)) || 1200;
    
    if (expandedCard === 0) {
      // Reset to 0 first, then animate to target
      setAnimatedValues(prev => ({ ...prev, savings: 0 }));
      const interval = setInterval(() => {
        setAnimatedValues((prev) => ({
          ...prev,
          savings: Math.min(prev.savings + 50, targetSavings),
        }))
      }, 20)
      return () => clearInterval(interval)
    }

    if (expandedCard === 1) {
      // Reset to 0 first, then animate to target
      setAnimatedValues(prev => ({ ...prev, property: 0 }));
      const interval = setInterval(() => {
        setAnimatedValues((prev) => ({
          ...prev,
          property: Math.min(prev.property + 0.2, 4),
        }))
      }, 40)
      return () => clearInterval(interval)
    }

    // Reset values to static values when cards collapse
    if (expandedCard === null) {
      setAnimatedValues({
        savings: targetSavings,
        lifetime: 30000,
        property: 4,
      })
    }
  }, [expandedCard, businessProposalData?.electricity_bill_savings])

  // Hide the hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const toggleCard = useCallback((index: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    setShowHint(false)
    setExpandedCard(expandedCard === index ? null : index)
  }, [expandedCard])

  // Prevent content click from closing card
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Monthly energy production data (kWh)
  const monthlyProduction = businessProposalData?.monthly_forecast?.map((forecast: any) => {
    // Keep the original timestamp for the MonthlyEnergyProductionCard component
    return { 
      timestamp: forecast.timestamp, // Keep original timestamp (e.g., "Jan-2024")
      monthly_sum: forecast.monthly_sum 
    };
  }).sort((a: { timestamp: string; monthly_sum: number }, b: { timestamp: string; monthly_sum: number }) => {
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthA = a.timestamp.split('-')[0];
    const monthB = b.timestamp.split('-')[0];
    return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
  }) || [];

  // 25-year savings data with 5-year intervals
  const longTermSavings = [
    { year: 5, value: 6000, roi: 59 },
    { year: 10, value: 12000, roi: 118 },
    { year: 15, value: 18000, roi: 176 },
    { year: 20, value: 24000, roi: 235 },
    { year: 25, value: 30000, roi: 294 },
  ]

  // Add this helper function near the top, inside the component but before the cards array
  const getBerImprovement = () => {
    let from = "D";
    let to = "B";
    try {
      if (typeof window !== "undefined") {
        const personalise = localStorage.getItem("personalise_answers");
        if (personalise) {
          const parsed = JSON.parse(personalise);
          if (parsed.berRating && typeof parsed.berRating === "string") {
            const ratings = ["A", "B", "C", "D", "E", "F", "G"];
            const currentIdx = ratings.indexOf(parsed.berRating.toUpperCase());
            if (currentIdx !== -1) {
              from = ratings[currentIdx];
              if (currentIdx > 1) {
                to = ratings[currentIdx - 2];
              } else {
                to = "A";
              }
            }
          }
        }
      }
    } catch (e) {
      // fallback to default
    }
    return { from, to };
  };

  // Get BER improvement values before cards array
  const { from: berFrom, to: berTo } = getBerImprovement();

  const cards = [
    {
      title: "Estimated Solar Energy Savings",
      value: `€${parseInt(businessProposalData?.electricity_bill_savings?.toFixed(0)).toLocaleString()}`,
      animatedValue: `€${animatedValues.savings.toLocaleString()}`,
      subtitle: "per year",
      icon: <LineChart className="w-5 h-5 text-white" />,
      color: "from-emerald-400 to-emerald-600",
      bgLight: "bg-emerald-50",
      progress: 100,
      detailedContent: (
        <div className="space-y-4">
          {/* How we calculated this section */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <h4 className="font-medium text-emerald-800 text-sm flex items-center mb-2">
              <Receipt className="w-4 h-4 mr-2" />
              How we calculated this
            </h4>
            
            {/* Compact calculation steps */}
            <div className="bg-white rounded-lg p-3 border border-emerald-100 space-y-2">
              {/* Steps in more compact format */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Left column */}
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold mr-2">1</div>
                    <span className="text-gray-600 text-xs">Roof capacity:</span>
                  </div>
                  <div className="font-bold text-emerald-600 ml-7">~{Math.ceil((energyData.annualPVGeneration || 4200) / 400)} panels</div>
                </div>
                
                {/* Right column */}
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold mr-2">2</div>
                    <span className="text-gray-600 text-xs">Generation:</span>
                  </div>
                  <div className="font-bold text-emerald-600 ml-7">{energyData.annualPVGeneration.toLocaleString()} kWh/year</div>
                </div>
              </div>

              {/* Step 3: Calculation - centered */}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold mr-2">3</div>
                  <span className="text-gray-600 text-xs">Calculation:</span>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 text-center">
                  <div className="text-sm text-emerald-700">
                    {energyData.annualPVGeneration.toLocaleString()} kWh × €0.30 = <span className="font-bold text-emerald-600">€{Math.round(energyData.annualPVGeneration * 0.30).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MonthlyEnergyProductionCard
            data={monthlyProduction.map((m: { timestamp: string; monthly_sum: number }) => ({
              timestamp: m.timestamp,
              monthly_sum: m.monthly_sum,
            }))}
          />
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3">
            <div className="flex items-start">
              <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                <Info className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-800 text-sm">Did You Know?</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Your solar system will continue producing energy for 25+ years, with only a small decrease in
                  efficiency over time (about 0.5% per year).
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Property Value Uplift",
      value: "+4%",
      animatedValue: `+${animatedValues.property.toFixed(1)}%`,
      subtitle: "property value increase",
      icon: <Home className="w-5 h-5 text-white" />,
      color: "from-teal-400 to-emerald-500",
      bgLight: "bg-teal-50",
      arrow: <ArrowUpRight className="w-4 h-4" />,
      progress: 100,
      detailedContent: (
        <div className="space-y-6">
          <div className="bg-teal-50 rounded-lg p-4">
            <h4 className="font-medium text-teal-800 flex items-center mb-2">
            <Home className="w-4 h-4 mr-2 flex-shrink-0" />
              Property Value Enhancement
            </h4> 
            <p className="text-xs text-teal-700 mb-4">
              Solar panels can significantly increase your property's market value and appeal to buyers.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-teal-100 p-4">
            <h4 className="font-medium text-gray-800 flex items-center mb-3">
              <Award className="w-4 h-4 mr-2 text-teal-600 flex-shrink-0" />
              Research-Backed Value Increase
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="min-w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs mr-2 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Lawrence Berkeley National Laboratory</span> found that homes with
                    solar sell for 4.1% more than comparable homes without solar.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="min-w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs mr-2 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Zillow Research</span> shows that homes with solar energy systems sold
                    for 4.1% more than comparable homes without solar power.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="min-w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs mr-2 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">European studies</span> indicate even higher premiums of 6-8% in
                    markets with high energy costs like Ireland.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="p-2 rounded-full shadow-sm mr-3">
                <Info className="w-4 h-4 flex-shrink-0 text-teal-500" />
              </div>
              <div>
                <h4 className="font-medium text-teal-800 text-sm">Buyer Appeal</h4>
                <p className="text-xs text-teal-700 mt-1">
                  Beyond the monetary value increase, solar systems make your property more attractive to
                  environmentally conscious buyers and those looking to save on energy costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    
  ]

  // Animation variants for content
  const contentVariants = {
    hidden: {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "top",
      transition: {
        opacity: { duration: 0.15 },
        scaleY: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
      },
    },
    visible: {
      opacity: 1,
      scaleY: 1,
      transformOrigin: "top",
      transition: {
        opacity: { duration: 0.2, delay: 0.05 },
        scaleY: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
      },
    },
  }

  // Pulse animation for the expand button
  const pulseAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop" as const,
    },
  }

  return (
    <div className="w-full">
      {/* Hint message that appears at the top */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-emerald-50 text-emerald-700 rounded-lg p-3 mb-4 text-center text-sm flex items-center justify-center"
          >
            <span className="animate-pulse mr-2">💡</span>
            Tap any card to explore your personalised benefits
            <button onClick={() => setShowHint(false)} className="ml-2 text-emerald-500 hover:text-emerald-600">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact View */}
      <div className="md:hidden max-w-full mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            ref={el => { cardRefs.current[index] = el }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={cn(
              "bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 select-none touch-manipulation",
              expandedCard === index ? "mb-5 ring-2 ring-emerald-200" : "mb-4",
              "relative", // Added for positioning the "Tap to expand" label
            )}
            onClick={handleContentClick}
          >
            {/* New: Tap to expand indicator */}
            {expandedCard !== index && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-medium pointer-events-none">
                Tap for details
              </div>
            )}

            <motion.div
              className={cn(
                "flex items-center justify-between py-5 px-3 cursor-pointer relative mt-2",
                expandedCard === index ? "border-b border-gray-100" : "",
                "active:bg-emerald-50", // Visual feedback on tap
              )}
              onClick={(event) => toggleCard(index, event)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-1 pointer-events-none">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0",
                    card.color,
                  )}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-[13px] pl-1 font-medium text-gray-700">{card.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1 pointer-events-none">
                {expandedCard !== index && (
                  <div className="font-bold text-emerald-600 text-[18px] mr-1 flex items-center">
                    {card.value}
                    {card.arrow && <span className="text-emerald-500">{card.arrow}</span>}
                  </div>
                )}
                <motion.div
                  animate={expandedCard === index ? { rotate: 180 } : pulseAnimation}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    expandedCard === index ? "bg-emerald-100" : "bg-emerald-50",
                  )}
                  style={{ width: "28px", height: "28px" }}
                >
                  {expandedCard === index ? (
                    <ChevronDown className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-emerald-600" />
                  )}
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence initial={false} mode="wait">
              {expandedCard === index && (
                <motion.div
                  key={`content-${index}`}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="px-5 pb-6 pt-3 overflow-hidden"
                  style={{ transformOrigin: "top" }}
                  onClick={handleContentClick}
                >
                  <div>
                    <div className="mb-5">
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent flex items-center">
                        {card.animatedValue}
                        {card.arrow && <span className="text-emerald-500 ml-1">{card.arrow}</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">{card.subtitle}</div>
                    </div>

                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${card.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r", card.color)}
                      />
                    </div>

                    {card.detailedContent}
                  </div>

                  {/* New: Close button at the bottom */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={(event) => toggleCard(index, event)}
                      className="text-emerald-600 text-sm font-medium flex items-center justify-center mx-auto touch-manipulation"
                    >
                      <ChevronDown className="w-4 h-4 mr-1 transform rotate-180" />
                      Close details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Desktop View (Enhanced Original Layout) */}
      <div className="hidden md:grid w-full grid-cols-2 gap-x-4 gap-y-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={(event) => toggleCard(index, event)}
          >
            <div className="flex items-center gap-1 mb-6">
              <div
                className={cn(
                  "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0",
                  card.color,
                )}
              >
                {card.icon} 
              </div>
              <div>
              <h3 className="text-[16px] pl-1 font-medium text-gray-700">{card.title}</h3>
              </div> 
            </div>

            <div className="mb-7">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent flex items-center">
                {card.value}
                {card.arrow && <span className="text-emerald-500 ml-1">{card.arrow}</span>}
              </div>
              <div className="text-gray-500 mt-2">{card.subtitle}</div>
            </div>

            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className={cn("absolute top-0 left-0 h-full rounded-full bg-gradient-to-r w-full", card.color)} />
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs text-emerald-600 font-medium flex items-center justify-center">
                Click to explore details
                <ChevronDown className="w-3 h-3 ml-1" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for desktop view */}
      <AnimatePresence>
        {expandedCard !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:flex fixed inset-0 bg-black/50 backdrop-blur-sm z-50 items-center justify-center p-4"
            onClick={() => setExpandedCard(null)}
            style={{
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm",
                      cards[expandedCard].color,
                    )}
                  >
                    {cards[expandedCard].icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">{cards[expandedCard].title}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setExpandedCard(null)
                  }}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6" onClick={(e) => e.stopPropagation()}>
                <div>
                  <div className="mb-6">
                    <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent flex items-center">
                      {cards[expandedCard].animatedValue}
                      {cards[expandedCard].arrow && (
                        <span className="text-emerald-500 ml-1">{cards[expandedCard].arrow}</span>
                      )}
                    </div>
                    <div className="text-gray-500 mt-2">{cards[expandedCard].subtitle}</div>
                  </div>

                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cards[expandedCard].progress}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r",
                        cards[expandedCard].color,
                      )}
                    />
                  </div>

                  {cards[expandedCard].detailedContent}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
