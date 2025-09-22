"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { StepBadges } from "@/components/step-badges"
import { AvatarAssistant } from "@/components/avatar-assistant"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SiteVisitPage() {
  const router = useRouter()
  const [isUserSignedUp, setIsUserSignedUp] = useState(false)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)

    // Check if user is signed up
    const userSignedUp = localStorage.getItem("userSignedUp") === "true"
    setIsUserSignedUp(userSignedUp)

    // If not signed up, redirect to signup page after a delay
    if (!userSignedUp) {
      const timer = setTimeout(() => {
        router.push("/get-plan")
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const dates = ["Mon, May 6", "Tue, May 7", "Wed, May 8", "Thu, May 9", "Fri, May 10"]
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

  const handleScheduleVisit = () => {
    if (selectedDate && selectedTime) {
      setIsScheduled(true)
      // Save site visit details to localStorage
      localStorage.setItem("siteVisitScheduled", "true")
      localStorage.setItem("siteVisitDate", selectedDate)
      localStorage.setItem("siteVisitTime", selectedTime)
    } else {
      alert("Please select a date and time for your visit")
    }
  }

  const handleContinue = () => {
    if (isUserSignedUp) {
      router.push("/completion")
    } else {
      router.push("/get-plan")
    }
  }

  const handleSkip = () => {
    // Clear any existing site visit data and set skipped flag
    localStorage.removeItem("siteVisitScheduled")
    localStorage.removeItem("siteVisitDate")
    localStorage.removeItem("siteVisitTime")
    localStorage.setItem("siteVisitSkipped", "true")

    router.push("/completion")
  }



  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <StepBadges currentStep={4} />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">Schedule Your Site Visit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600">
                Our expert can visit your home to assess your roof and finalize your solar system design. This step is
                optional but recommended for optimal results.
              </p>

              {isScheduled ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-green-800">Your visit is scheduled!</h3>
                  <p className="mb-4 text-green-700">
                    {selectedDate} at {selectedTime}
                  </p>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation to your email. Our representative will call you 24 hours before the
                    appointment.
                  </p>

                  <Button onClick={handleContinue} className="mt-6 bg-green-600 hover:bg-green-700">
                    Continue to Next Step
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">What to expect</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          The visit takes approximately 45-60 minutes. Our representative will:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-green-600">•</span>
                            <span>Assess your roof condition and orientation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-green-600">•</span>
                            <span>Check electrical panel and wiring</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-green-600">•</span>
                            <span>Confirm optimal panel placement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 text-green-600">•</span>
                            <span>Answer any questions you may have</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Select a Date & Time</h3>

                    <Tabs defaultValue="calendar" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="calendar">
                          <Calendar className="mr-2 h-4 w-4" />
                          Calendar View
                        </TabsTrigger>
                        <TabsTrigger value="list">
                          <Clock className="mr-2 h-4 w-4" />
                          List View
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="calendar" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-5 gap-2">
                            {dates.map((date) => (
                              <button
                                key={date}
                                className={`rounded-md border p-2 text-center text-sm transition-all ${
                                  selectedDate === date
                                    ? "border-green-600 bg-green-50 text-green-600"
                                    : "hover:border-green-200 hover:bg-green-50/50"
                                }`}
                                onClick={() => setSelectedDate(date)}
                              >
                                {date}
                              </button>
                            ))}
                          </div>

                          {selectedDate && (
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Available Times for {selectedDate}</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {times.map((time) => (
                                  <button
                                    key={time}
                                    className={`rounded-md border p-2 text-center text-sm transition-all ${
                                      selectedTime === time
                                        ? "border-green-600 bg-green-50 text-green-600"
                                        : "hover:border-green-200 hover:bg-green-50/50"
                                    }`}
                                    onClick={() => setSelectedTime(time)}
                                  >
                                    {time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="list" className="mt-4">
                        <div className="space-y-3">
                          {dates.map((date) => (
                            <div key={date} className="rounded-md border p-3">
                              <h4 className="font-medium">{date}</h4>
                              <div className="mt-2 grid grid-cols-4 gap-2">
                                {times.map((time) => (
                                  <button
                                    key={`${date}-${time}`}
                                    className={`rounded-md border p-1 text-center text-sm transition-all ${
                                      selectedDate === date && selectedTime === time
                                        ? "border-green-600 bg-green-50 text-green-600"
                                        : "hover:border-green-200 hover:bg-green-50/50"
                                    }`}
                                    onClick={() => {
                                      setSelectedDate(date)
                                      setSelectedTime(time)
                                    }}
                                  >
                                    {time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="rounded-lg bg-green-50 p-4">
                      <h3 className="font-medium text-green-800">Your Selected Appointment</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-green-600" />
                          <span>
                            Date: <strong>{selectedDate}</strong>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-green-600" />
                          <span>
                            Time: <strong>{selectedTime}</strong>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-green-600" />
                          <span>
                            Location: <strong>Your Home</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleScheduleVisit}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Schedule Visit
                  </Button>

                  <div className="mt-4 text-center">
                    <Button onClick={handleSkip} variant="link" className="text-gray-500 hover:text-green-600">
                      Skip site visit and continue
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="site-visit" />

    </div>
  )
}
