"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepBadges } from "@/components/step-badges"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Home, Building, Building2, Sparkles, Zap } from "lucide-react"

const HOUSE_TYPES = [
  { value: "detached", label: "Detached House", icon: Home, description: "Standalone house with space on all sides" },
  { value: "semi-detached", label: "Semi-Detached", icon: Building, description: "Attached to one other house" },
  { value: "terraced", label: "Terraced House", icon: Building2, description: "Part of a row of connected houses" }
]

export default function PropertyDetailsPage() {
  const router = useRouter()
  const [houseType, setHouseType] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleHouseTypeSelection = async (selectedType: string) => {
    setHouseType(selectedType)
    setIsSubmitting(true)


    // Store the property details in localStorage
    const propertyDetails = {
      houseType: selectedType,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem("propertyDetails", JSON.stringify(propertyDetails))
    

    // Verify and adjust system size based on property type limits
    const maxPanels = getMaxPanelsForPropertyType(selectedType)
    const maxSystemSize = maxPanels * 440 // 440 watts per panel
    
    // Get existing business_proposal from localStorage
    const businessProposalStr = localStorage.getItem("business_proposal")
    if (businessProposalStr) {
      try {
        const businessProposal = JSON.parse(businessProposalStr)
        
        // Check if system_size exists and exceeds the limit
        if (businessProposal.system_size && businessProposal.system_size > maxSystemSize) {
          console.log(`System size ${businessProposal.system_size}W exceeds limit for ${selectedType} (${maxSystemSize}W). Adjusting to maximum.`)
          businessProposal.system_size = maxSystemSize
          
          // Save the updated business_proposal back to localStorage
          localStorage.setItem("business_proposal", JSON.stringify(businessProposal))
        }
      } catch (error) {
        console.error("Error parsing business_proposal from localStorage:", error)
      }
    }

    // Small delay for better UX
    setTimeout(() => {
      router.push("/snapshot")
    }, 800)
  }

  // Helper function to get max panels based on property type
  const getMaxPanelsForPropertyType = (propertyType: string): number => {
    switch (propertyType) {
      case "detached":
        return 16
      case "semi-detached":
        return 12
      case "terraced":
        return 10
      default:
        return 12 // Default to semi-detached limit
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <AppHeader />
      <StepBadges currentStep={2} />
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative">
        {/* Background decoration - reduced on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-green-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-blue-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-emerald-200/10 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-2xl relative z-10 w-full -mt-8 sm:-mt-12">
          <Card className="w-full shadow-xl sm:shadow-2xl border-0 bg-white/95 sm:bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 sm:pb-8 pt-6 sm:pt-8 px-4 sm:px-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Tell us about your property
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
                We need a few details to provide accurate solar recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              {/* House Type Selection */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  What type of property is this?
                </Label>
                <div className="grid gap-3 sm:gap-4">
                  {HOUSE_TYPES.map((type) => {
                    const IconComponent = type.icon
                    const isSelected = houseType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleHouseTypeSelection(type.value)}
                        disabled={isSubmitting}
                        className={`
                          w-full p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left
                          ${isSelected 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25 shadow-sm hover:shadow-md'
                          }
                          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isSelected 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {isSubmitting && isSelected ? (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`
                              font-semibold text-base sm:text-lg
                              ${isSelected ? 'text-green-700' : 'text-gray-900'}
                            `}>
                              {type.label}
                            </h3>
                            <p className={`
                              text-sm sm:text-base mt-1
                              ${isSelected ? 'text-green-600' : 'text-gray-500'}
                            `}>
                              {type.description}
                            </p>
                          </div>
                          {isSelected && !isSubmitting && (
                            <div className="flex-shrink-0">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {isSubmitting && isSelected && (
                            <div className="flex-shrink-0">
                              <div className="text-green-600 text-sm sm:text-base font-medium">
                                Processing...
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AvatarAssistant step={2} pageType="property-details" />
    </div>
  )
} 