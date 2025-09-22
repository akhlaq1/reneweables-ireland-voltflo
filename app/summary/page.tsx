"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowRight,
  Download,
  Share2,
  Mail,
  Home,
  Calendar,
  Sun,
  Battery,
  Car,
  CreditCard,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface SummaryData {
  address: string
  roofSize: string
  roofOrientation: string
  shadingLevel: string
  streetViewUrl: string
  electricityBill: string
  berRating: string
  evOwnership: string
  batteryInterest: string
  systemSize: string
  panelCount: number
  includeBattery: boolean
  includeEvCharger: boolean
  totalCost: number
  annualSavings: number
  paybackPeriod: number
  financingOption: string
  monthlyPayment: number
  interestRate: number
  downPayment: number
  co2Reduction: number
  treesEquivalent: number
  energyOffset: number
  berImprovement: { from: string; to: string }
  propertyValueIncrease: number
  installerVisit: string
  estimatedInstallation: string
}

export default function SummaryPage() {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState({
    home: true,
    system: true,
    financial: true,
    next: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [showSatellite, setShowSatellite] = useState(false)
  const [satelliteUrl, setSatelliteUrl] = useState<string | null>(null)

  // Simulate loading user data
  useEffect(() => {
    // Get address and image from localStorage
    const locationData = localStorage.getItem("selectedLocation")
    const streetViewUrl = localStorage.getItem("streetViewUrl")

    if (locationData) {
      const { lat, lng } = JSON.parse(locationData)
      
      // Set up satellite view as fallback
      const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      setSatelliteUrl(satelliteImageUrl)

      // Check if we should show satellite view immediately
      if (streetViewUrl === "null") {
        setShowSatellite(true)
      }
    }

    // In a real app, this would fetch the user's selections from a database or state management
    setTimeout(() => {
      setSummaryData({
        // Home details
        address: locationData ? JSON.parse(locationData).address : "Address not found",
        roofSize: "85 m²",
        roofOrientation: "South-facing",
        shadingLevel: "Minimal",
        streetViewUrl: streetViewUrl && streetViewUrl !== "null" ? streetViewUrl : "/solar-hero-background.png",

        // Energy profile
        electricityBill: "€180/month",
        berRating: "D",
        evOwnership: "Planning",
        batteryInterest: "Yes",

        // System details
        systemSize: "4.32 kWp",
        panelCount: 12,
        includeBattery: true,
        includeEvCharger: true,

        // Financial details
        totalCost: 14900,
        annualSavings: 1500,
        paybackPeriod: 9.9,
        financingOption: "5-year loan",
        monthlyPayment: 192,
        interestRate: 4.2,
        downPayment: 0,

        // Environmental impact
        co2Reduction: 2.5,
        treesEquivalent: 115,
        energyOffset: 75,

        // Property details
        berImprovement: { from: "D", to: "B" },
        propertyValueIncrease: 15000,

        // Next steps
        installerVisit: "Not scheduled",
        estimatedInstallation: "4-6 weeks after site visit",
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper to detect 'no imagery' image
  const handleStreetViewLoad = (e: any) => {
    const img = e.target
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(img, 0, 0)
      
      // Sample a grid of points across the image for better coverage
      const sampleSize = 15 // Sample 15x15 grid for good coverage without being too intensive
      const stepX = Math.max(1, Math.floor(img.naturalWidth / sampleSize))
      const stepY = Math.max(1, Math.floor(img.naturalHeight / sampleSize))
      
      const brightnessValues: number[] = []
      
      // Collect brightness values from a grid of sample points
      for (let x = stepX; x < img.naturalWidth - stepX; x += stepX) {
        for (let y = stepY; y < img.naturalHeight - stepY; y += stepY) {
          const pixel = ctx.getImageData(x, y, 1, 1).data
          const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3
          brightnessValues.push(brightness)
        }
      }
      
      if (brightnessValues.length === 0) return
      
      // Calculate statistical measures
      const avgBrightness = brightnessValues.reduce((sum, val) => sum + val, 0) / brightnessValues.length
      const variance = brightnessValues.reduce((sum, val) => sum + Math.pow(val - avgBrightness, 2), 0) / brightnessValues.length
      const standardDeviation = Math.sqrt(variance)
      
      // Detect "no imagery" with more restrictive conditions
      // Google's "no imagery" placeholders are typically very uniform and extremely light
      const isVeryUniform = standardDeviation < 8 // Very low variance indicates uniform color
      const isExtremelyLight = avgBrightness > 240 // Very high brightness
      const isUniformAndLight = standardDeviation < 15 && avgBrightness > 230
      
      // Only trigger satellite view for very obvious placeholder images
      if ((isVeryUniform && isExtremelyLight) || (standardDeviation < 5)) {
        setShowSatellite(true)
      }
    }
  }

  // Helper to handle image load errors
  const handleImageError = () => {
    setShowSatellite(true)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  const handleContinue = () => {
    router.push("/completion")
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Your summary would be downloaded as a PDF")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Your summary would be shared")
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block rounded-full bg-green-100 p-4 mb-4">
              <Sun className="h-8 w-8 text-green-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Preparing Your Summary</h2>
            <p className="text-gray-500 mb-4">We're gathering all your selections...</p>
            <Progress value={65} className="w-64 mx-auto" />
          </div>
        </main>
      </div>
    )
  }

  if (!summaryData) return null

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="bg-gradient-to-b from-green-50 to-white py-8 print:hidden">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">Plan Summary</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Green Energy Journey</h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Here's a complete overview of your personalised solar energy plan. You're on your way to energy
              independence and significant savings!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Plan
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Home Details Section */}
            <Card className="overflow-hidden border-green-100">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("home")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Home Details</h2>
                </div>
                {expandedSections.home ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>

              {expandedSections.home && (
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="rounded-lg overflow-hidden mb-4 relative">
                        <div className="bg-gray-100 px-4 py-3 rounded-lg">
                          <p className="font-medium text-gray-700">{summaryData.address}</p>
                        </div>
                        <div className="relative h-48 mt-2 rounded-lg">
                          {(summaryData.streetViewUrl && !showSatellite && summaryData.streetViewUrl.startsWith("data:image")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={summaryData.streetViewUrl}
                              alt="Street View of your property"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              className="rounded-lg"
                              onLoad={handleStreetViewLoad}
                              onError={handleImageError}
                            />
                          ) : (satelliteUrl && showSatellite) ? (
                            <div className="relative w-full h-full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={satelliteUrl}
                                alt="Satellite View of your property"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                className="rounded-lg"
                              />
                              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">Satellite View</div>
                            </div>
                          ) : (
                            <Image
                              src={summaryData.streetViewUrl || "/placeholder.svg"}
                              alt="Your home"
                              fill
                              className="object-cover rounded-lg"
                              unoptimized={summaryData.streetViewUrl.startsWith("data:image")}
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Roof Size</span>
                          <span className="font-medium">{summaryData.roofSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orientation</span>
                          <span className="font-medium">{summaryData.roofOrientation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shading</span>
                          <span className="font-medium">{summaryData.shadingLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Your Energy Profile</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <Zap className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Monthly Electricity Bill</p>
                            <p className="font-medium">{summaryData.electricityBill}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Award className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">BER Rating</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500 text-white font-bold text-sm">
                                {summaryData.berRating}
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white font-bold text-sm">
                                {summaryData.berImprovement.to}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Car className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Electric Vehicle</p>
                            <p className="font-medium">{summaryData.evOwnership}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Battery className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Battery Storage Interest</p>
                            <p className="font-medium">{summaryData.batteryInterest}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* System Details Section */}
            <Card className="overflow-hidden border-green-100">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("system")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Sun className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Your Solar System</h2>
                </div>
                {expandedSections.system ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>

              {expandedSections.system && (
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                          <Sun className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{summaryData.systemSize}</h3>
                          <p className="text-gray-600">{summaryData.panelCount} solar panels</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50">
                          <Battery className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">Battery Storage</p>
                              <Badge
                                variant={summaryData.includeBattery ? "default" : "outline"}
                                className={summaryData.includeBattery ? "bg-green-600" : ""}
                              >
                                {summaryData.includeBattery ? "Included" : "Not Included"}
                              </Badge>
                            </div>
                            {summaryData.includeBattery && (
                              <p className="text-sm text-gray-600 mt-1">13.5 kWh capacity</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50">
                          <Car className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">EV Charger</p>
                              <Badge
                                variant={summaryData.includeEvCharger ? "default" : "outline"}
                                className={summaryData.includeEvCharger ? "bg-green-600" : ""}
                              >
                                {summaryData.includeEvCharger ? "Included" : "Not Included"}
                              </Badge>
                            </div>
                            {summaryData.includeEvCharger && (
                              <p className="text-sm text-gray-600 mt-1">7.2 kW fast charging</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Environmental Impact</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">{summaryData.co2Reduction}</div>
                          <p className="text-sm text-gray-600">Tonnes CO₂ saved per year</p>
                        </div>

                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">{summaryData.treesEquivalent}</div>
                          <p className="text-sm text-gray-600">Equivalent trees planted</p>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Energy Independence</h4>
                          <span className="font-bold text-green-600">{summaryData.energyOffset}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Percentage of your electricity needs covered by solar
                        </p>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 rounded-full"
                            style={{ width: `${summaryData.energyOffset}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">Property Value Increase</h4>
                          <span className="font-bold text-green-600">
                            €{summaryData.propertyValueIncrease.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Estimated added value to your home</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Financial Details Section */}
            <Card className="overflow-hidden border-green-100">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("financial")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Financial Overview</h2>
                </div>
                {expandedSections.financial ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>

              {expandedSections.financial && (
                <CardContent className="p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="overview">Financial Overview</TabsTrigger>
                      <TabsTrigger value="financing">Financing Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            €{summaryData.totalCost.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Total System Cost</p>
                        </div>

                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            €{summaryData.annualSavings.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Annual Savings</p>
                        </div>

                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-xl font-bold text-green-600 mb-1">{summaryData.paybackPeriod} years</div>
                          <p className="text-xs text-gray-600">Payback Period</p>
                        </div>

                        <div className="rounded-lg border p-3 text-center">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            €{(summaryData.annualSavings * 25).toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">25-Year Savings</p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                        <h3 className="font-medium mb-4">Savings Over Time</h3>
                        <div className="space-y-4">
                          {[5, 10, 15, 25].map((years) => {
                            const savings = summaryData.annualSavings * years
                            const percentage = Math.min((savings / summaryData.totalCost) * 100, 100)
                            return (
                              <div key={years}>
                                <div className="flex justify-between mb-1">
                                  <span>{years} Year Savings</span>
                                  <span className="font-medium">€{savings.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-600 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                {percentage >= 100 && (
                                  <p className="text-xs text-green-600 mt-1">
                                    System fully paid off + €{(savings - summaryData.totalCost).toLocaleString()} in
                                    additional savings
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium">Monthly Impact</h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Monthly Electricity</span>
                            <span className="font-medium">€180</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Loan Payment</span>
                            <span className="font-medium">€{summaryData.monthlyPayment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">New Electricity Bill (est.)</span>
                            <span className="font-medium">
                              €{Math.round(180 * (1 - summaryData.energyOffset / 100))}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Net Monthly Impact</span>
                            <span className="text-green-600">
                              €
                              {180 -
                                Math.round(180 * (1 - summaryData.energyOffset / 100)) -
                                summaryData.monthlyPayment}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="financing" className="space-y-6">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-4">Selected Financing Option</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loan Term</span>
                            <span className="font-medium">{summaryData.financingOption}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Payment</span>
                            <span className="font-medium">€{summaryData.monthlyPayment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interest Rate</span>
                            <span className="font-medium">{summaryData.interestRate}% APR</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Down Payment</span>
                            <span className="font-medium">€{summaryData.downPayment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Financed Amount</span>
                            <span className="font-medium">€{summaryData.totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Interest</span>
                            <span className="font-medium">
                              €{(summaryData.monthlyPayment * 60 - summaryData.totalCost).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium">Financing Benefits</h3>
                        </div>

                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-3 w-3 rounded-full bg-green-600"></div>
                            <span className="text-sm">No early repayment penalties</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-3 w-3 rounded-full bg-green-600"></div>
                            <span className="text-sm">Fixed interest rate for entire term</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-3 w-3 rounded-full bg-green-600"></div>
                            <span className="text-sm">Simple online application process</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-3 w-3 rounded-full bg-green-600"></div>
                            <span className="text-sm">Backed by Synergy Credit Union</span>
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-3">Monthly Cash Flow</h3>
                        <div className="relative pt-5">
                          <div className="absolute top-0 left-0 w-full flex justify-between text-xs text-gray-500">
                            <span>Year 1</span>
                            <span>Year 5</span>
                            <span>Year 10</span>
                            <span>Year 25</span>
                          </div>
                          <div className="h-16 w-full bg-gray-100 rounded-lg relative">
                            {/* Loan payment period */}
                            <div className="absolute top-0 left-0 h-full w-1/5 bg-blue-100 rounded-l-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-800">Loan Period</span>
                            </div>
                            {/* Pure savings period */}
                            <div className="absolute top-0 left-1/5 h-full w-4/5 bg-green-100 rounded-r-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-green-800">Pure Savings</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>

            {/* Next Steps Section */}
            <Card className="overflow-hidden border-green-100">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("next")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-white">Next Steps</h2>
                </div>
                {expandedSections.next ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>

              {expandedSections.next && (
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100 shadow-sm">
                      <div className="flex flex-col items-center text-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                          You're in Control
                        </h3>
                        <p className="text-gray-600 mt-2 max-w-lg">
                          Choose your own path to solar energy. We've designed multiple options to fit your preferences.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-purple-600" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">I have a contractor already</h4>
                          <p className="text-gray-500 text-sm mb-4">
                            Continue with your preferred contractor and we'll provide all the system specifications.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            Select
                          </Button>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">Help me compare quotes</h4>
                          <p className="text-gray-500 text-sm mb-4">
                            Get a curated list of quotes from local contractors based on your system design.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Compare
                          </Button>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                          <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                            <Download className="h-6 w-6 text-teal-600" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">Send me a contractor guide</h4>
                          <p className="text-gray-500 text-sm mb-4">
                            Receive our best-practice guide for selecting and working with solar contractors.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Get Guide
                          </Button>
                        </div>
                      </div>

                      <div className="mt-8 bg-gradient-to-r from-green-600/10 to-teal-600/10 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-700">
                          We've sent a copy of this summary to your email. You can access your plan anytime by logging
                          into your account.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <div className="print:hidden">
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="summary" />
    </div>
  )
}
