"use client"

import { ViewPotentialHeroSection } from "./view-potential-hero-section"
import { SystemAtAGlanceCards } from "./system-at-a-glance-cards"
import { HowSolarWorksSection } from "./how-solar-works-section"
import { HowWeSizeSystemCard } from "./how-we-size-system-card"
import { ContinueCTA } from "./continue-cta"
import { CheckCircle, TrendingUp, Settings, Clipboard } from "lucide-react"
import { ProgressBars } from "./progress-bars"

interface ViewPotentialScreenProps {
  panelCount: number
  annualSolarKwh: number
  energyOffset: number
  annualSavings: number
  treesSaved: number
  systemSizeKw: number
  annualHomeKwh: number
  onContinue: () => void
}

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

export function ViewPotentialScreen({
  panelCount,
  annualSolarKwh,
  energyOffset,
  annualSavings,
  treesSaved,
  systemSizeKw,
  annualHomeKwh,
  onContinue,
}: ViewPotentialScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <ProgressBars 
        addressActive={true}
        potentialActive={true}
        personaliseActive={false}
        planActive={false}
        maxWidth="max-w-4xl"
      />

      <main className="w-full px-2 md:px-4 py-3 md:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-3 md:mb-6 px-1">
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Here's what solar could look like for your home
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Based on your roof analysis and energy usage</p>
          </div>

          <div className="space-y-3 md:space-y-6">
            <ViewPotentialHeroSection
              panelCount={panelCount}
              annualSolarKwh={annualSolarKwh}
              energyOffset={energyOffset}
              annualHomeKwh={annualHomeKwh}
            />
            <SystemAtAGlanceCards
              panelCount={panelCount}
              systemSizeKw={systemSizeKw}
              annualSavings={annualSavings}
              annualSolarKwh={annualSolarKwh}
              treesSaved={treesSaved}
            />
            {/* <HowSolarWorksSection /> */}
            <HowWeSizeSystemCard panelCount={panelCount} systemSizeKw={systemSizeKw} annualHomeKwh={annualHomeKwh} />
          </div>
        </div>
      </main>
      <ContinueCTA onContinue={onContinue} />
    </div>
  )
}
