"use client"

import { useState, useRef, useEffect } from "react"
import { Sun, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, CreditCard, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SolarPricingCardProps {
  systemSize?: number;
  originalPrice?: number;
  grantAmount?: number;
  finalPrice?: number;
}

export default function SolarPricingCard({
  systemSize = 4.4,
  originalPrice = 6930,
  grantAmount = 1800,
  finalPrice = 5130
}: SolarPricingCardProps) {
  const [isGrantInfoOpen, setIsGrantInfoOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate panel count (assuming 0.4 kWp per panel)
  const panelCount = Math.round(systemSize / parseFloat(process.env.PANEL_WATTAGE || "0.45"));

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsGrantInfoOpen(false)
      }
    }

    if (isGrantInfoOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isGrantInfoOpen])


  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
      <CardContent className="p-4 sm:p-6 space-y-4 relative">
        {/* Mobile Header */}
        <div className="flex flex-col gap-2 block sm:hidden">
          <div className="flex items-start justify-between gap-3">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 show-between-464-633">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Solar System Price</h2>
                <p className="text-sm text-gray-600">Sized for your roof</p>
                <p className="text-xs text-gray-500">{systemSize} kWp • {panelCount} panels</p>
              </div>

            </div>

            {/* Grant Info Button - Aligned with heading */}
            <div className="flex-shrink-0 mt-1"
            // ref={containerRef}
            >
              <button
                onClick={() => setIsGrantInfoOpen(!isGrantInfoOpen)}
                className="bg-white/80 hover:bg-white border border-amber-200 hover:border-amber-300 rounded-full px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <Info className="w-4 h-4" />
                Grants
                {isGrantInfoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

          </div>
          <div className="flex-1 min-w-0 show-below-464 text-left">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">Solar System Price</h2>
            <p className="text-sm text-gray-600">Sized for your roof</p>
            <p className="text-xs text-gray-500">{systemSize} kWp • {panelCount} panels</p>
          </div>
        </div>

        {/* Desktop Header Section */}
        <div className="hidden sm:block">
          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Solar System Price</h2>
                <p className="text-sm text-gray-600">Sized for your roof</p>
                <p className="text-xs text-gray-500">{systemSize} kWp • {panelCount} panels</p>
              </div>
            </div>

            {/* Grant Info Button - Aligned with heading */}
            <div className="flex-shrink-0 mt-1"
            // ref={containerRef}
            >
              <button
                onClick={() => setIsGrantInfoOpen(!isGrantInfoOpen)}
                className="bg-white/80 hover:bg-white border border-amber-200 hover:border-amber-300 rounded-full px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <Info className="w-4 h-4" />
                Grants
                {isGrantInfoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Grant Info Expanded Section */}
        {isGrantInfoOpen && (
          <div className="bg-white/90 border border-amber-200 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Up to €{grantAmount?.toLocaleString()} SEAI grant available</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Paid after installation</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Loan based on full cost upfront</span>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="text-center py-2">
          <div className="text-3xl sm:text-4xl font-bold text-orange-600">€{originalPrice?.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Estimated cost (national averages)</div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">Estimate only</span>, actual quote may vary after inspection.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 