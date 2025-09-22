"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, Check, Clock, Home, Star, ArrowLeft, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { StepBadges } from "@/components/step-badges"

export default function InstallerSelectionPage() {
  const router = useRouter()
  const [selectedInstaller, setSelectedInstaller] = useState(null)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const installers = [
    {
      id: "solar-experts",
      name: "Solar Experts",
      logo: "/solar-company-logo.png",
      rating: 4.8,
      reviews: 156,
      established: 2010,
      completedHomes: 1250,
      description: "Specializing in residential solar installations with premium panels and 25-year warranty.",
      features: ["Premium panels", "25-year warranty", "Free maintenance for 2 years"],
      earliestVisit: "Next week",
    },
    {
      id: "eco-solar",
      name: "Eco Solar",
      logo: "/eco-solar-logo.png",
      rating: 4.7,
      reviews: 124,
      established: 2012,
      completedHomes: 980,
      description: "Eco-friendly installation methods with focus on energy efficiency and sustainability.",
      features: ["Eco-friendly materials", "20-year warranty", "Energy monitoring app"],
      earliestVisit: "2 weeks",
    },
    {
      id: "green-power",
      name: "Green Power",
      logo: "/green-power-logo.png",
      rating: 4.9,
      reviews: 203,
      established: 2008,
      completedHomes: 1580,
      description: "Full-service solar provider with the highest quality materials and expert installation.",
      features: ["Premium materials", "30-year warranty", "24/7 customer support"],
      earliestVisit: "3 weeks",
    },
  ]

  const handleSelectInstaller = (installerId) => {
    setSelectedInstaller(installerId)
  }

  const handleContinue = () => {
    if (selectedInstaller) {
      // Store selected installer in localStorage
      localStorage.setItem("selectedInstaller", selectedInstaller)

      // Find the selected installer object
      const installer = installers.find((i) => i.id === selectedInstaller)
      if (installer) {
        localStorage.setItem("installerName", installer.name)
      }
    }

    // Navigate to completion page
    router.push("/completion")
  }

  const handleSkip = () => {
    // Clear any previously selected installer
    localStorage.removeItem("selectedInstaller")
    localStorage.removeItem("installerName")

    // Navigate to completion page
    router.push("/completion")
  }

  const handleBack = () => {
    router.push("/financing")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <StepBadges currentStep={5} />
      {/* Custom Step Indicator */}
      {/* <div className="w-full bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between py-3">
            <button onClick={handleBack} className="flex items-center text-green-600 hover:text-green-700 font-medium">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Financing
            </button>
            <div className="text-sm text-gray-500">Step 5 of 6</div>
          </div>
        </div>
      </div> */}

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="space-y-6">
            {/* Updated header with no-obligation messaging */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">Choose an Installer for a Free Site Visit</h1>
              <p className="text-gray-500 max-w-xl mx-auto">
                Select an installer for a <span className="font-medium">no-obligation, free site assessment</span>. You
                can change your mind at any time.
              </p>
            </div>

            {/* No-obligation banner */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">No Obligation Site Visit</h3>
                <p className="text-sm text-green-700 mt-1">
                  Selecting an installer only schedules a free assessment. There's no commitment to purchase and no
                  pressure to proceed.
                </p>
              </div>
            </div>

            <RadioGroup
              value={selectedInstaller}
              onValueChange={handleSelectInstaller}
              className="space-y-3 sm:space-y-4"
            >
              {installers.map((installer) => (
                <div key={installer.id} className="relative">
                  <RadioGroupItem value={installer.id} id={installer.id} className="peer sr-only" />
                  <Label htmlFor={installer.id} className="block cursor-pointer">
                    <Card
                      className={`overflow-hidden transition-all ${
                        selectedInstaller === installer.id
                          ? "border-green-600 ring-2 ring-green-600 ring-opacity-50"
                          : "border-gray-200 hover:border-green-200"
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Logo Section - Hidden on smallest screens */}
                          <div className="hidden sm:flex items-center justify-center bg-gray-50 p-4 sm:w-1/4 md:w-1/5">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                              <Image
                                src={installer.logo || "/placeholder.svg"}
                                alt={installer.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-lg flex items-center">
                                  {installer.name}
                                  {selectedInstaller === installer.id && (
                                    <Check className="ml-2 h-5 w-5 text-green-600" />
                                  )}
                                </h3>

                                {/* Rating - Shown on all screens */}
                                <div className="flex items-center mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(installer.rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-sm text-gray-600">
                                    {installer.rating} ({installer.reviews})
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Badges - Compact for mobile */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                <Clock className="mr-1 h-3 w-3" />
                                Est. {installer.established}
                              </div>
                              <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                <Home className="mr-1 h-3 w-3" />
                                {installer.completedHomes}+ homes
                              </div>
                              <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                <Calendar className="mr-1 h-3 w-3" />
                                Visit: {installer.earliestVisit}
                              </div>
                            </div>

                            {/* Features - Compact list */}
                            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                              {installer.features.map((feature, index) => (
                                <li key={index} className="text-sm flex items-start">
                                  <div className="mr-1.5 mt-0.5 h-3 w-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <Check className="h-2 w-2" />
                                  </div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* What happens next section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                    1
                  </span>
                  <span>The installer will contact you to schedule a convenient time for a site visit</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                    2
                  </span>
                  <span>They'll assess your property and confirm if the estimated cost is accurate</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                    3
                  </span>
                  <span>You'll receive a detailed proposal with no obligation to proceed</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 py-5 text-base flex items-center justify-center"
              >
                {selectedInstaller ? "Schedule free site visit" : "Continue without site visit"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={handleSkip}
                size="lg"
                variant="outline"
                className="w-full py-5 text-base flex items-center justify-center"
              >
                Skip for now
              </Button>
            </div>

            {/* No obligation reminder */}
            <p className="text-center text-sm text-gray-500">
              Remember, scheduling a site visit is completely free and comes with no obligation to purchase.
            </p>
          </div>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="installer" />
    </div>
  )
}
