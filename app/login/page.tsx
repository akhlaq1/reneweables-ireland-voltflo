"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepBadges } from "@/components/step-badges"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [followUp, setFollowUp] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email) {
      router.push("/loan-submission")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-8">
          <StepBadges currentStep={4} />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">Want to save your plan or get follow-up support?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="follow-up"
                    checked={followUp}
                    onCheckedChange={(checked) => setFollowUp(checked as boolean)}
                  />
                  <Label htmlFor="follow-up" className="text-sm">
                    I'd like a Credit Union advisor to follow up with me.
                  </Label>
                </div>

                <p className="text-sm text-gray-500">
                  We'll email your personalised plan + a link to resume anytime. We never send marketing.
                </p>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="login" />
    </div>
  )
}
