"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Home, LineChart, Settings, FileText, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepBadges({ currentStep }) {
  const router = useRouter()
  const [animateStep, setAnimateStep] = useState(null)

  useEffect(() => {
    // Trigger animation when currentStep changes
    setAnimateStep(currentStep)
    const timer = setTimeout(() => setAnimateStep(null), 1000)
    return () => clearTimeout(timer)
  }, [currentStep])

  const steps = [
    {
      name: "Address",
      description: "Confirm location",
      icon: Home,
      path: "/address",
    },
    {
      name: "Savings",
      description: "View potential",
      icon: LineChart,
      path: "/snapshot",
    },
    {
      name: "Personalise",
      description: "Answer questions",
      icon: Settings,
      path: "/personalise",
    },
    {
      name: "Plan",
      description: "Get your plan",
      icon: FileText,
      path: "/plan",
    },
    {
      name: "Complete",
      description: "Finish journey",
      icon: Flag,
      path: "/completion",
    },
  ]

  const handleNavigateToPreviousStep = (stepNumber) => {
    // Only allow navigation to completed steps (steps before current step)
    if (stepNumber < currentStep) {
      router.push(steps[stepNumber - 1].path)
    }
  }

  return (
    <div className="w-full bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-center py-2">
          {/* <div className="text-sm text-gray-500">Step {currentStep} of 5</div> */}
        </div>

        <div className="relative flex justify-between pb-2">

          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = currentStep > stepNumber
            const isCurrent = currentStep === stepNumber
            const isAnimating = animateStep === stepNumber

            const StepIcon = step.icon

            return (
             
              <div
                key={step.name}
                className={cn("relative flex flex-col items-center z-10 flex-1", isCompleted ? "cursor-pointer" : "")}
                onClick={() => (isCompleted ? handleNavigateToPreviousStep(stepNumber) : null)}
              > 
                {/* Badge */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500",
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white" 
                      : isCurrent
                        ? "border-green-600 text-green-600 bg-white"
                        : "border-gray-300 text-gray-400 bg-white",
                  )}
                  style={{
                    transform: isAnimating ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.5s ease-in-out",
                  }}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>

                {/* Pulse animation for current step */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    {/* <div className="animate-ping absolute w-8 h-8 rounded-full bg-green-400 opacity-30"></div> */}
                  </div>
                )}

                {/* Step name */}
                <div className="mt-1 text-center">
                  <p
                    className={cn("text-xs font-medium", isCompleted || isCurrent ? "text-green-600" : "text-gray-500")}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                </div>
              
              
              
              </div>
             
            )
          })}
        </div>
      </div>
    </div>
  )
}
