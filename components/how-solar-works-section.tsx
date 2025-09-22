"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Battery, Home, TrendingUp, ArrowRight } from 'lucide-react'

export function HowSolarWorksSection() {
  const steps = [
    {
      icon: Sun,
      title: "Capture",
      description: "Solar panels capture sunlight",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: Battery,
      title: "Convert",
      description: "Convert to electricity",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Home,
      title: "Power",
      description: "Power your home",
      color: "from-green-500 to-green-600",
    },
    {
      icon: TrendingUp,
      title: "Save",
      description: "Reduce your bills",
      color: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl font-bold text-center">How Solar Works</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 md:gap-0 md:flex-col md:text-center w-full md:w-auto">
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}
              >
                <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1 md:flex-none md:mt-3">
                <h3 className="font-semibold text-sm md:text-base mb-1">{step.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 md:hidden" />
              )}
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
