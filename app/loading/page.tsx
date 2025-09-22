"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { Check, Sun, Home, Calculator, TrendingUp, CheckCircle, Settings, Clipboard } from "lucide-react"
import proposal from "@/app/api/proposal"
import { ProgressBars } from "@/components/progress-bars"
import { setAppNavigation } from "@/lib/navigation-tracker"

// ProgressStep component for navigation
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

// Define our checklist items with detailed descriptions
const ANALYSIS_STEPS = [
  "**Scanning Roof** - Analyzing dimensions and orientation",
  "**Calculating Sunlight** - Measuring annual exposure",
  "**Optimizing Layout** - Finding best panel placement",
  "**Projecting Savings** - Estimating your benefits",
]

export default function LoadingPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isChecklistComplete, setIsChecklistComplete] = useState(false)
  const [isStreetViewComplete, setIsStreetViewComplete] = useState(false)
  const [isProposalLoadingComplete, setIsProposalLoadingComplete] = useState(false)

  // Set navigation marker for this app session
  useEffect(() => {
    setAppNavigation()
  }, [])

  // Map the analysis steps to the new UI format
  const steps = [
    {
      id: "scanning",
      title: "Scanning Roof",
      description: "Analyzing dimensions and orientation",
      icon: <Home className="w-5 h-5 text-white" />,
    },
    {
      id: "calculating",
      title: "Calculating Sunlight", 
      description: "Measuring annual exposure",
      icon: <Sun className="w-5 h-5 text-white" />,
    },
    {
      id: "optimizing",
      title: "Optimizing Layout",
      description: "Finding best panel placement", 
      icon: <Calculator className="w-5 h-5 text-white" />,
    },
    {
      id: "projecting",
      title: "Projecting Savings",
      description: "Estimating your benefits",
      icon: <TrendingUp className="w-5 h-5 text-white" />,
    },
  ]

  // Calculate energy independence data
  const calculateEnergyIndependence = (businessProposal: any) => {
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
      console.log(`consumption used: ${averageConsumption} kWh`);
    } catch (error) {
      console.error('Failed to get bill amount from localStorage:', error);
    }
    
    // Calculate annual PV generation from monthly forecast
    const annualPVGeneration = businessProposal?.monthly_forecast?.reduce(
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
      selfConsumptionFactor: SELF_CONSUMPTION_FACTOR,
      calculatedAt: new Date().toISOString(),
      source: 'loading-page'
    };
  };

  const fetchStreetView = async () => {
    try {
      const locationData = localStorage.getItem("selectedLocation")
      if (!locationData) {
        router.push("/address")
        return
      }

      // Clean up any existing street view data
      localStorage.removeItem("streetViewUrl")

      const { lat, lng } = JSON.parse(locationData)
      const response = await fetch(`/api/streetview?lat=${lat}&lng=${lng}&ts=${Date.now()}`)

      if (response.ok) {
        const blob = await response.blob()
        // Convert blob to base64 string for storage
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64data = reader.result as string
          // Only store if it's a valid base64 image
          if (base64data.startsWith('data:image')) {
            localStorage.setItem("streetViewUrl", base64data)
          } else {
            localStorage.setItem("streetViewUrl", "null")
          }
          setIsStreetViewComplete(true)
        }
      } else {
        // If street view fails, store null to indicate we should show satellite view
        localStorage.setItem("streetViewUrl", "null")
        setIsStreetViewComplete(true)
      }
    } catch (error) {
      console.error('Error fetching street view:', error)
      // On error, store null to indicate we should show satellite view
      localStorage.setItem("streetViewUrl", "null")
      setIsStreetViewComplete(true)
    }
  }

  // Helper function to get max panels based on property type (copied from property-details)
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

  useEffect(() => {
    // Navigate when both processes are complete
    if (isChecklistComplete && isStreetViewComplete && isProposalLoadingComplete) {
      // Check roof area - if it's 0, apply property type logic directly instead of redirecting
      const roofAreaData = localStorage.getItem("roof_area")
      const roofArea = roofAreaData ? JSON.parse(roofAreaData) : 0
      
      if (roofArea === 0) {
        // Get homeType from personalise_answers instead of redirecting to property-details
        try {
          const personaliseAnswers = localStorage.getItem("personalise_answers")
          if (personaliseAnswers) {
            const parsed = JSON.parse(personaliseAnswers)
            const homeType = parsed.homeType
            const bedrooms = parsed.bedrooms
            const hasEV = parsed.hasEV
            const hasHeatPump = parsed.hasHeatPump
            const hasElectricShower = parsed.hasElectricShower
            
            if (homeType) {
              // Apply the same logic that was in property-details page
              // Convert homeType to lowercase to match property-details format
              const normalizedHomeType = homeType.toLowerCase()
              const maxPanels = getMaxPanelsForPropertyType(normalizedHomeType)
              const maxSystemSize = maxPanels * 440 // 440 watts per panel
              
              // Get existing business_proposal from localStorage
              const businessProposalStr = localStorage.getItem("business_proposal")
              if (businessProposalStr) {
                try {
                  const businessProposal = JSON.parse(businessProposalStr)
                  
                  // Check if system_size exists and exceeds the limit
                  if (businessProposal.system_size && businessProposal.system_size > maxSystemSize) {
                    console.log(`System size ${businessProposal.system_size}W exceeds limit for ${homeType} (${maxSystemSize}W). Adjusting to maximum.`)
                    businessProposal.system_size = maxSystemSize
                    
                    // Save the updated business_proposal back to localStorage
                    localStorage.setItem("business_proposal", JSON.stringify(businessProposal))
                  }
                } catch (error) {
                  console.error("Error parsing business_proposal from localStorage:", error)
                }
              }
              
              // Store the property details in localStorage (same as property-details page)
              // Include all the estimator data for future use
              const propertyDetails = {
                houseType: normalizedHomeType,
                bedrooms: bedrooms || '',
                hasEV: hasEV || false,
                hasHeatPump: hasHeatPump || false,
                hasElectricShower: hasElectricShower || false,
                timestamp: new Date().toISOString()
              }
              localStorage.setItem("propertyDetails", JSON.stringify(propertyDetails))
              
              console.log('Property details stored from loading page:', propertyDetails)
            }
          }
        } catch (error) {
          console.error("Error processing homeType from localStorage:", error)
        }
      }
      
      // Always go to snapshot now, whether roof area was 0 or not
      router.push("/snapshot")
    }
  }, [isChecklistComplete, isStreetViewComplete, isProposalLoadingComplete, router])

  useEffect(() => {
    // Function to process a single step
    const processStep = (stepIndex: number) => {
      // Set the active step (showing spinner)
      setActiveStep(stepIndex)

      // After 1.5 seconds, mark this step as completed
      setTimeout(() => {
        // Add this step to completed steps (showing checkmark)
        setCompletedSteps((prev) => [...prev, stepIndex])

        // Clear the active step
        setActiveStep(null)

        // Move to next step or finish
        if (stepIndex < ANALYSIS_STEPS.length - 1) {
          // Wait 0.5 seconds before starting the next step
          setTimeout(() => {
            processStep(stepIndex + 1)
          }, 500)
        } else {
          // All steps completed
          setIsChecklistComplete(true)
        }
      }, 1000)
    }

    // Start both processes
    const initialTimer = setTimeout(() => {
      processStep(0)
      fetchStreetView()
      fetchProposal()
    }, 500)

    // Cleanup function
    return () => {
      clearTimeout(initialTimer)
    }
  }, [router])

  const fetchProposal = async () => {
    const locationData = localStorage.getItem("selectedLocation")
    if (!locationData) {
      router.push("/address")
      return
    }

    const { lat, lng, address } = JSON.parse(locationData)
    
    // Get billAmount from localStorage with default value of 250
    let billAmount = 250
    try {
      const personaliseAnswers = localStorage.getItem("personalise_answers")
      if (personaliseAnswers) {
        const parsedAnswers = JSON.parse(personaliseAnswers)
        billAmount = parsedAnswers.billAmount || 250
      }
    } catch (error) {
      console.log("Error parsing personalise_answers from localStorage:", error)
      billAmount = 250
    }

    await proposal.getBusinessProposalByLocation({ lat, lng, billAmount }).then((res: any) => {
      localStorage.setItem("business_proposal", JSON.stringify(res?.data?.data))
      localStorage.setItem("roof_area", JSON.stringify(res?.data?.roof_area))
      localStorage.setItem("roof_default_data", JSON.stringify(res?.data?.roof_default_data))
      localStorage.setItem("max_panels", JSON.stringify(res?.data?.max_panels))
      
      // Calculate and store energy independence data right after business proposal is stored
      const energyIndependenceData = calculateEnergyIndependence(res?.data?.data)
      if (energyIndependenceData.annualPVGeneration > 0) {
        try {
          localStorage.setItem('energy_independence_data', JSON.stringify(energyIndependenceData))
          console.log('Energy independence data calculated and stored in loading page:', energyIndependenceData)
        } catch (error) {
          console.error('Failed to store energy independence data:', error)
        }
      }
      
      setIsProposalLoadingComplete(true)
    }).catch((err: any) => {
      console.log(err)
      setIsProposalLoadingComplete(true)
    })
  }

  // Helper function to get step status
  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return "completed"
    if (activeStep === index) return "active"
    return "pending"
  }

  // Calculate progress percentage
  const progressPercentage = Math.round(((completedSteps.length + (activeStep !== null ? 0.5 : 0)) / 4) * 100)

  return (
    <>
      <AppHeader maxWidth="max-w-4xl" />
      {/* Progress Bar */}
      <ProgressBars 
        addressActive={true}
        potentialActive={true}
        personaliseActive={false}
        planActive={false}
        maxWidth="max-w-4xl"
      />
      
      <main className="flex-1 bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-start justify-center pt-2 pb-2 px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full mb-2 shadow-lg">
              <Sun className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Analyzing Your Solar Potential
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-900">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              
              return (
                                 <div
                   key={step.id}
                   className={`flex items-start space-x-3 p-3 md:p-4 rounded-xl transition-all duration-500 ${
                    status === "active"
                      ? "bg-white shadow-lg border border-orange-100 scale-105"
                      : status === "completed"
                        ? "bg-green-50 border border-green-100"
                        : "bg-gray-50 border border-gray-100"
                  }`}
                >
                                     {/* Status Indicator */}
                   <div className="flex-shrink-0 relative">
                     {status === "completed" ? (
                       <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                         <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                       </div>
                     ) : status === "active" ? (
                       <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md relative">
                         {React.cloneElement(step.icon, { className: "w-3 h-3 md:w-4 md:h-4 text-white" })}
                         <div className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping" />
                       </div>
                     ) : (
                       <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                         <div className="w-3 h-3 md:w-4 md:h-4 text-gray-400">
                           {React.cloneElement(step.icon, { className: "w-3 h-3 md:w-4 md:h-4 text-gray-400" })}
                         </div>
                       </div>
                     )}
                   </div>

                                     {/* Content */}
                   <div className="flex-1 min-w-0">
                     <h3
                       className={`text-base md:text-lg font-semibold mb-0.5 md:mb-1 ${
                        status === "active"
                          ? "text-gray-900"
                          : status === "completed"
                            ? "text-green-800"
                            : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs md:text-sm ${
                        status === "active"
                          ? "text-gray-600"
                          : status === "completed"
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>

                    {/* Loading animation for active step */}
                    {status === "active" && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs text-orange-600 font-medium">Processing...</span>
                      </div>
                    )}
                  </div>

                                     {/* Step number */}
                   <div
                     className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      status === "completed"
                        ? "bg-green-100 text-green-600"
                        : status === "active"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              )
            })}
          </div>

          
        </div>
      </main>
      
      <AvatarAssistant step={1} pageType="loading" />
    </>
  )
}
