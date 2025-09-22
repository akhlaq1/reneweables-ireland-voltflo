"use client"

import { Calendar, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepBadges } from "@/components/step-badges"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-8">
          <StepBadges currentStep={4} />

          <div className="mt-8 space-y-8">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-green-100"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-green-200"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-green-300"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
                  🎉
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Your Home Energy Plan is Ready 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-gray-600">Your Credit Union will follow up shortly.</p>
                  <p className="text-gray-600">Installer visit scheduled.</p>
                  <p className="text-gray-600">Plan sent to your email.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Plan Again
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Add Site Visit to Calendar
                  </Button>
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share With Partner
                  </Button>
                </div>

                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="font-medium text-green-800">
                    Congratulations on taking the first step towards a greener home!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="confirmation" />
    </div>
  )
}
