"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, ArrowLeft, Printer, Loader2, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PDFProposal from "@/components/pdf-proposal"
import api from "../api/api"
import { useToast } from "@/hooks/use-toast"

interface ApiResponse {
  id: number
  name: string
  email: string
  phone: string | null
  personalise_answers: {
    billAmount: number
    motivation: string
    'time-of-use': string
  }
  selectedLocation: {
    lat: number
    lng: number
    address: string
  }
  solar_plan_data: {
    costs: {
      seaiGrant: number
      finalPrice: number
      batteryCost: number
      evChargerCost: number
      systemBaseCost: number
      totalSystemCost: number
      monthlyFinancing: number
      heatPumpAdditionalCost: number
    }
    savings: {
      billOffset: number
      newAnnualBill: number
      paybackPeriod: number
      heatPumpSavings: number
      evChargerSavings: number
      gridIndependence: number
      solarAnnualSavings: number
      totalAnnualSavings: number
      annualBillReduction: number
      batteryAnnualSavings: number
    }
    metadata: {
      planVersion: string
      planCreatedAt: string
      businessProposal: {
        systemSize: number
        monthlyPerformance: Array<{
          timestamp: string
          monthly_sum: number
        }>
        electricityBillSavings: number
      }
      userInfo: {
        email: string
        fullName: string
        submittedAt: string
        agreeToTerms: boolean
      }
      equipment: {
        battery: {
          id: string
          name: string
          tier: string
          price: number
          reason: string
          capacity: number
          warranty: string
          recommended: boolean
        } | null
        heatPump: any
        inverter: {
          id: string
          name: string
          tier: string
          reason: string
          warranty: string
          efficiency: string
          recommended: boolean
          priceAdjustment: number
        }
        evCharger: any
        solarPanel: {
          id: string
          name: string
          tier: string
          reason: string
          quantity: number
          warranty: string
          efficiency: string
          recommended: boolean
          totalWattage: number
          priceAdjustment: number
        }
      }
      systemSpecs: {
        systemSizeKwp: number
        annualBillAmount: number
        annualPVGenerated: number
        perPanelGeneration: number
      }
      propertyImpact: {
        berImprovement: string
        propertyValueUplift: number
        valueUpliftPercentage: string
      }
      systemConfiguration: {
        basePanelCount: number
        evPanelsNeeded: number
        includeBattery: boolean
        includeHeatPump: boolean
        selectedBattery: any
        totalPanelCount: number
        includeEVCharger: boolean
        selectedInverter: any
        powerOutageBackup: boolean
        selectedSolarPanel: any
        heatPumpPanelsNeeded: number
      }
    }
  }
  call_date: string
  call_time: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export default function PDFPreviewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const email = searchParams.get('email')
    
    if (!email) {
      // Fallback to localStorage if no email provided
      loadFromLocalStorage()
      return
    }

    fetchUserData(email)
  }, [searchParams])

  // Check if user came from /plan and show notification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      const fromPlan = searchParams.get('from')
      
      // Check if user came from /plan route (either via referrer or explicit param)
      if (referrer.includes('/plan') || fromPlan === 'plan') {
        toast({
          title: "Proposal Sent! 📧",
          description: "The link to this proposal has also been sent to your email inbox. You can view it later too.",
          duration: Infinity, // Stay until user closes it
        })
      }
    }
  }, [searchParams, toast])

  const loadFromLocalStorage = () => {
    // Create mock API data structure from localStorage as fallback
    if (typeof window !== "undefined") {
      const businessProposal = localStorage.getItem("business_proposal")
      const personaliseAnswers = localStorage.getItem("personalise_answers")
      const selectedLocation = localStorage.getItem("selectedLocation")

      let mockData: Partial<ApiResponse> = {
        id: 0,
        name: "Local User",
        email: "local@example.com",
        phone: null,
        created_at: new Date().toISOString(),
      }

      // Build mock solar_plan_data structure
      mockData.solar_plan_data = {
        costs: {
          seaiGrant: 1800,
          finalPrice: 10200,
          batteryCost: 0,
          evChargerCost: 0,
          systemBaseCost: 10200,
          totalSystemCost: 10200,
          monthlyFinancing: 0,
          heatPumpAdditionalCost: 0
        },
        savings: {
          billOffset: 75,
          newAnnualBill: 600,
          paybackPeriod: 7,
          heatPumpSavings: 0,
          evChargerSavings: 0,
          gridIndependence: 75,
          solarAnnualSavings: 1200,
          totalAnnualSavings: 1200,
          annualBillReduction: 1200,
          batteryAnnualSavings: 0
        },
        metadata: {
          planVersion: "1.0",
          planCreatedAt: new Date().toISOString(),
          businessProposal: {
            systemSize: 4.8,
            monthlyPerformance: [],
            electricityBillSavings: 1200
          },
          userInfo: {
            email: "local@example.com",
            fullName: "Local User",
            submittedAt: new Date().toISOString(),
            agreeToTerms: true
          },
          equipment: {
            battery: null,
            heatPump: null,
            inverter: {
              id: "default",
              name: "Standard Inverter",
              tier: "Standard",
              reason: "Default selection",
              warranty: "10 years",
              efficiency: "95%",
              recommended: true,
              priceAdjustment: 0
            },
            evCharger: null,
            solarPanel: {
              id: "default",
              name: "Standard Solar Panel",
              tier: "Tier 1",
              reason: "Default selection",
              quantity: 12,
              warranty: "25 years",
              efficiency: "20%",
              recommended: true,
              totalWattage: 4800,
              priceAdjustment: 0
            }
          },
          systemSpecs: {
            systemSizeKwp: 4.8,
            annualBillAmount: 1800,
            annualPVGenerated: 4000,
            perPanelGeneration: 333
          },
          propertyImpact: {
            berImprovement: "D → B",
            propertyValueUplift: 8000,
            valueUpliftPercentage: "4-6%"
          },
          systemConfiguration: {
            basePanelCount: 12,
            evPanelsNeeded: 0,
            includeBattery: false,
            includeHeatPump: false,
            selectedBattery: null,
            totalPanelCount: 12,
            includeEVCharger: false,
            selectedInverter: null,
            powerOutageBackup: false,
            selectedSolarPanel: null,
            heatPumpPanelsNeeded: 0
          }
        }
      }

      if (selectedLocation) {
        try {
          const location = JSON.parse(selectedLocation)
          mockData.selectedLocation = location
        } catch (e) {
          mockData.selectedLocation = {
            lat: 53.3498,
            lng: -6.2603,
            address: "Sample Address, Ireland"
          }
        }
      }

      if (personaliseAnswers) {
        try {
          const answers = JSON.parse(personaliseAnswers)
          mockData.personalise_answers = {
            billAmount: answers.billAmount || 200,
            motivation: answers.motivation || "lowering-bills",
            'time-of-use': answers['time-of-use'] || "day"
          }
        } catch (e) {
          mockData.personalise_answers = {
            billAmount: 200,
            motivation: "lowering-bills",
            'time-of-use': "day"
          }
        }
      }

      setApiData(mockData as ApiResponse)
    }
    setLoading(false)
  }

  const fetchUserData = async (email: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get('public_users/get_new_journey_installer_user_by_email', {
        params: {
          email: email
        }
      })
      
      const data: ApiResponse = response.data
      setApiData(data)
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load user data'
      setError(errorMessage)
      // Fallback to localStorage on error
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    // For now, this will just print the page
    // In a real implementation, you'd use a library like Puppeteer or jsPDF
    window.print()
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading proposal data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}. Showing data from local storage as fallback.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* PDF Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="bg-white shadow-lg rounded-lg sm:rounded-xl overflow-hidden">
          <PDFProposal apiData={apiData} />
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .shadow-lg {
            box-shadow: none !important;
          }
        }

        @media (max-width: 640px) {
          .container {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  )
} 