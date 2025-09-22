"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepBadges } from "@/components/step-badges"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"

export default function LoanSubmissionPage() {
  const router = useRouter()

  const handleGoToOnlineBanking = () => {
    window.open("https://synergycu.ie/loans/apply-now", "_blank")
    router.push("/site-visit")
  }

  const handleRequestCall = () => {
    router.push("/site-visit")
  }

  const handleEmailPlan = () => {
    router.push("/site-visit")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <StepBadges currentStep={5} />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">Apply through your Credit Union's secure banking portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600">
                You've created your personalised upgrade plan. To apply for finance, complete the loan application
                through your CU's online portal.
              </p>

              <div className="space-y-4">
                <Button onClick={handleGoToOnlineBanking} className="w-full bg-green-600 hover:bg-green-700">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Online Banking
                </Button>

                <Button onClick={handleRequestCall} variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Request a Call First
                </Button>

                <Button onClick={handleEmailPlan} variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Me This Plan
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500">
                This is not a loan application, just your personal plan. You're always in control.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="loan-submission" />
    </div>
  )
}
