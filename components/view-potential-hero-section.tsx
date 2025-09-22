"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ViewPotentialHeroSectionProps {
  panelCount: number
  annualSolarKwh: number
  energyOffset: number
  annualHomeKwh: number
}

export function ViewPotentialHeroSection({
  panelCount,
  annualSolarKwh,
  energyOffset,
  annualHomeKwh,
}: ViewPotentialHeroSectionProps) {
  const [imageUrl, setImageUrl] = useState<string>("/images/house2.png")

  useEffect(() => {
    const streetViewUrl = localStorage.getItem("streetViewUrl")
    if (streetViewUrl) {
      setImageUrl(streetViewUrl)
    }
  }, [])

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Image Section */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="relative h-[160px] md:h-[300px]">
          <img
            src={imageUrl}
            alt="Your home with solar panels visualization"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge className="bg-white/20 text-white border-white/30 text-xs">AI-Powered Analysis</Badge>
          </div>
        </div>
      </Card>

      {/* Summary Statement */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-3 md:p-4">
          <p className="text-sm md:text-base text-gray-900 leading-relaxed text-center">
            <span className="font-semibold">We recommend {panelCount} panels</span> that will generate{" "}
            <span className="font-semibold text-green-600">{annualSolarKwh.toLocaleString()} kWh annually</span>,
            covering <span className="font-semibold text-blue-600">{energyOffset}% of your electricity needs</span>.
          </p>
        </CardContent>
      </Card>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Current Usage */}
        <Card className="border-0 shadow-md bg-red-50 border-l-4 border-l-red-500">
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-900 text-xs md:text-sm">Estimated Usage</p>
                <p className="text-xs text-red-700">From the grid</p>
              </div>
              <div className="text-right">
                <p className="text-base md:text-lg lg:text-xl font-bold text-red-900">{annualHomeKwh.toLocaleString()}</p>
                <p className="text-xs text-red-700">kWh/year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solar Generation */}
        <Card className="border-0 shadow-md bg-green-50 border-l-4 border-l-green-500">
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Sun className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-900 text-xs md:text-sm">Solar Generation</p>
                <p className="text-xs text-green-700">{panelCount} panels</p>
              </div>
              <div className="text-right flex items-center gap-1.5 md:gap-2">
                <div className="bg-green-200 rounded-full px-1.5 py-0.5 md:px-2 md:py-1">
                  <span className="text-xs font-bold text-green-800">{energyOffset}%</span>
                </div>
                <div>
                  <p className="text-base md:text-lg lg:text-xl font-bold text-green-900">{annualSolarKwh.toLocaleString()}</p>
                  <p className="text-xs text-green-700">kWh/year</p>
                </div>
                
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
