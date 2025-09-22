"use client"

import { useEffect, useState } from "react"
import { Calendar, Download, HelpCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepBadges } from "@/components/step-badges"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"

export default function CompletionPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasSiteVisit, setHasSiteVisit] = useState(false)
  const [siteVisitDate, setSiteVisitDate] = useState(null)
  const [siteVisitTime, setSiteVisitTime] = useState(null)
  const [selectedInstaller, setSelectedInstaller] = useState(null)
  const [installerName, setInstallerName] = useState("")

  useEffect(() => {
    // Show confetti animation when component mounts
    setShowConfetti(true)

    // Check if user has scheduled a site visit
    const siteVisitScheduled = localStorage.getItem("siteVisitScheduled") === "true"
    const siteVisitSkipped = localStorage.getItem("siteVisitSkipped") === "true"

    setHasSiteVisit(siteVisitScheduled && !siteVisitSkipped)

    if (siteVisitScheduled) {
      setSiteVisitDate(localStorage.getItem("siteVisitDate"))
      setSiteVisitTime(localStorage.getItem("siteVisitTime"))
    }

    // Check if user selected an installer
    const installer = localStorage.getItem("selectedInstaller")
    if (installer) {
      setSelectedInstaller(installer)
      setInstallerName(localStorage.getItem("installerName") || "")
    }

    // Clean up confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Your plan would be downloaded as a PDF")
  }

  const handleFAQs = () => {
    // In a real app, this would navigate to FAQs or open a modal
    alert("This would open the FAQs section")
  }

  const handleScheduleVisit = () => {
    // Navigate back to site visit page for users who skipped
    window.location.href = "/site-visit"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <StepBadges currentStep={6} />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mt-8 space-y-8">
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="fixed inset-0 z-50 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="confetti-container">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={i}
                        className="confetti"
                        style={{
                          left: `${Math.random() * 100}%`,
                          width: `${Math.random() * 10 + 5}px`,
                          height: `${Math.random() * 10 + 5}px`,
                          backgroundColor: [
                            "#1aac54", // green
                            "#4ade80", // light green
                            "#22c55e", // medium green
                            "#bbf7d0", // very light green
                            "#ffffff", // white
                            "#fbbf24", // yellow (matching logo)
                          ][Math.floor(Math.random() * 6)],
                          animationDuration: `${Math.random() * 3 + 2}s`,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-green-100"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-green-600">LCU</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
                Completion Badge
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Your upgrade plan is in motion!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-gray-600">
                    Congratulations on taking this important step towards energy independence and a greener future.
                  </p>
                  <p className="font-medium text-green-600">
                    Your Credit Union will be in touch within 2–3 working days
                  </p>
                </div>

                {selectedInstaller && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">Your Selected Installer: {installerName}</h3>
                    <p className="mt-2 text-sm text-green-700">
                      We've shared your details with {installerName}. They will contact you within 48 hours to discuss
                      next steps and schedule an initial assessment.
                    </p>
                  </div>
                )}

                {hasSiteVisit && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">Your Site Visit is Confirmed</h3>
                    <p className="mt-2 text-sm text-green-700">
                      We've sent the details to your email. A confirmation SMS will be sent 24 hours before your
                      appointment {siteVisitDate && siteVisitTime && `on ${siteVisitDate} at ${siteVisitTime}`}.
                    </p>
                  </div>
                )}

                {!hasSiteVisit && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Want a professional assessment?</h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Our experts can visit your home to provide a detailed assessment and optimize your solar
                          setup.
                        </p>
                        <Button
                          onClick={handleScheduleVisit}
                          variant="outline"
                          className="mt-3 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Schedule a Site Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Plan Again
                  </Button>
                  <Button onClick={handleFAQs} variant="outline">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQs
                  </Button>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">What happens next?</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedInstaller
                          ? `${installerName} will contact you to arrange a detailed assessment and provide a final quote. Your Credit Union advisor will also be in touch to finalize your financing options.`
                          : hasSiteVisit
                            ? "After your site visit, you'll receive a final quote within 48 hours. Your Credit Union advisor will contact you to discuss financing options and help you complete any paperwork."
                            : "Your Credit Union advisor will contact you to discuss financing options and next steps. They'll help you arrange a site visit if needed and guide you through the installation process."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="completion" />

      {/* Confetti CSS */}
      <style jsx global>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          top: -10px;
          border-radius: 0;
          animation: fall linear forwards;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
