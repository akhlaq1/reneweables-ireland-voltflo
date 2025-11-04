"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Euro, Home, Leaf, Info, X } from 'lucide-react'

interface SystemAtAGlanceCardsProps {
  panelCount: number
  systemSizeKw: number
  annualSavings: number
  annualSolarKwh: number
  treesSaved: number
}

export function SystemAtAGlanceCards({
  panelCount,
  systemSizeKw,
  annualSavings,
  annualSolarKwh,
  treesSaved,
}: SystemAtAGlanceCardsProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const cards = [
    {
      id: "system-size",
      icon: Home,
      title: "System Size",
      value: `${systemSizeKw}kW`,
      subtitle: `${panelCount} panels`,
      color: "blue",
      details: {
        title: "Your Solar System Size",
        content: (
          <div className="space-y-4">
            <p className="text-gray-600">Your system is sized based on your roof space and energy needs.</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">System Details:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• {panelCount} high-efficiency solar panels</li>
                <li>• {systemSizeKw}kW total system capacity</li>
                <li>• Optimised for your roof orientation and shading</li>
                <li>• Professional installation included</li>
              </ul>
            </div>
          </div>
        ),
      },
    },
    {
      id: "annual-savings",
      icon: Euro,
      title: "Annual Savings",
      value: `€${annualSavings.toLocaleString()}`,
      subtitle: "First year",
      color: "green",
      details: {
        title: "Your Annual Savings Breakdown",
        content: (
          <div className="space-y-4">
            <p className="text-gray-600">Your savings come from reduced electricity bills and energy exports.</p>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Annual Generation & Savings:</h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Annual solar generation: {annualSolarKwh.toLocaleString()} kWh</li>
                <li>• Reduced electricity bills: ~€{Math.round(annualSolarKwh * 0.3 * 0.35).toLocaleString()}</li>
                <li>• Energy export credits: ~€{Math.round(annualSolarKwh * 0.7 * 0.20).toLocaleString()}</li>
                <li>• 25-year total savings: ~€{(annualSavings * 25).toLocaleString()}</li>
                <li>• Savings increase with rising energy costs</li>
              </ul>
            </div>
          </div>
        ),
      },
    },
    {
      id: "environmental",
      icon: Leaf,
      title: "Green Impact",
      value: `${treesSaved} trees`,
      subtitle: "Saved",
      color: "emerald",
      details: {
        title: "Your Environmental Impact",
        content: (
          <div className="space-y-4">
            <p className="text-gray-600">Your solar system will significantly reduce your carbon footprint.</p>
            <div className="bg-emerald-50 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-2">Annual Environmental Benefits:</h4>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li>• Annual generation: {annualSolarKwh.toLocaleString()} kWh</li>
                <li>• CO₂ reduction: ~{Math.round(annualSolarKwh * 0.4).toLocaleString()} kg per year</li>
                <li>• Equivalent to planting {treesSaved} trees annually</li>
                <li>• Reduces reliance on fossil fuels</li>
                <li>• Contributes to Ireland's renewable energy goals</li>
              </ul>
            </div>
          </div>
        ),
      },
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getButtonColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 hover:text-blue-700 hover:bg-blue-100",
      green: "text-green-600 hover:text-green-700 hover:bg-green-100",
      emerald: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
      {cards.map((card, index) => (
        <Dialog key={index} open={openDialog === card.id} onOpenChange={(open) => setOpenDialog(open ? card.id : null)}>
          <DialogTrigger asChild>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="pb-1.5 md:pb-2 px-3 pt-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${getColorClasses(card.color)} group-hover:scale-105 transition-transform`}
                  >
                    <card.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <Button variant="ghost" size="sm" className={`p-1 md:p-1.5 ${getButtonColorClasses(card.color)} opacity-60 group-hover:opacity-100 transition-opacity`}>
                    <Info className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </Button>
                </div>
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-sm mx-auto md:max-w-md left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DialogHeader className="relative">
              <DialogTitle className="text-sm md:text-base lg:text-lg font-bold pr-8">{card.details.title}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 p-1 h-auto w-auto text-gray-400 hover:text-gray-600"
                onClick={() => setOpenDialog(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto text-sm">
              {card.details.content}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
