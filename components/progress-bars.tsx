"use client"

import { CheckCircle, TrendingUp, Settings, Clipboard } from "lucide-react"
import { cn } from "@/lib/utils"

// ProgressStep component
interface ProgressStepProps {
  icon: any
  label: string
  isActive: boolean
}

function ProgressStep({ icon: Icon, label, isActive }: ProgressStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors",
        isActive ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
      )}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <span className={cn(
        "text-xs md:text-sm mt-1 md:mt-2 font-medium transition-colors",
        isActive ? "text-blue-600" : "text-gray-500"
      )}>
        {label}
      </span>
    </div>
  )
}

// Main ProgressBars component
interface ProgressBarsProps {
  addressActive?: boolean
  potentialActive?: boolean
  personaliseActive?: boolean
  planActive?: boolean
  maxWidth?: string
}

export function ProgressBars({
  addressActive = false,
  potentialActive = false,
  personaliseActive = false,
  planActive = false,
  maxWidth = "max-w-4xl"
}: ProgressBarsProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-2 md:py-3">
      <div className={cn(maxWidth, "mx-auto px-4")}>
        {/* Desktop: Progress steps span full width including sidebar */}
        <div className="hidden lg:flex justify-between items-center w-full">
          <ProgressStep icon={CheckCircle} label="Address" isActive={addressActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            potentialActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={TrendingUp} label="Potential" isActive={potentialActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            personaliseActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={Settings} label="Personalise" isActive={personaliseActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            planActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={Clipboard} label="Plan" isActive={planActive} />
        </div>
        {/* Mobile: Centered progress steps */}
        <div className="lg:hidden flex justify-between items-center max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
          <ProgressStep icon={CheckCircle} label="Address" isActive={addressActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            potentialActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={TrendingUp} label="Potential" isActive={potentialActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            personaliseActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={Settings} label="Personalise" isActive={personaliseActive} />
          <div className={cn(
            "flex-1 h-px mx-1 md:mx-2",
            planActive ? "bg-blue-600" : "bg-gray-300"
          )} />
          <ProgressStep icon={Clipboard} label="Plan" isActive={planActive} />
        </div>
      </div>
    </div>
  )
}

