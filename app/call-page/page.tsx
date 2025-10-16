"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Clock, MessageCircle, Phone, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Info, ArrowRight, User, Mail, ArrowLeft, CheckCircle, TrendingUp, Settings, Clipboard, StepBackIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { AppHeader } from "@/components/app-header"
import { ProgressBars } from "@/components/progress-bars"
import { CallBookingTerminal } from "@/components/call-booking-terminal"
import api from "@/app/api/api"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { hasAppNavigation, setAppNavigation } from "@/lib/navigation-tracker"
import { useIsMobile } from "@/hooks/use-mobile"
import { getEmailBranding } from "@/lib/branding"

export default function CallPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  // Get today's date
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth() // 0-indexed
  const todayYear = today.getFullYear()
  const minBookingTime = new Date(today.getTime() + 4 * 60 * 60 * 1000)

  // Remove months generation as react-day-picker handles month display

  // Remove findCurrentMonthIndex as we no longer need it

  // Step management for new UI
  const [step, setStep] = useState<"select-date" | "select-time" | "enter-details" | "booking-success">("select-date")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [hoveredTime, setHoveredTime] = useState("")
  const [showCalendar, setShowCalendar] = useState(true) // For mobile UX - hide calendar when time slots are shown
  const [isExpectationExpanded, setIsExpectationExpanded] = useState(false) // For mobile expandable card
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  })

  // Legacy state for compatibility with existing logic
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [showContactFields, setShowContactFields] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [showProposalSentBanner, setShowProposalSentBanner] = useState(false)
  // Remove currentMonthIndex as we're using react-day-picker's built-in navigation
  const [bookedSlots, setBookedSlots] = useState<Set<number>>(new Set())
  const [bookingsLoaded, setBookingsLoaded] = useState(false)
  const [isDirectAccess, setIsDirectAccess] = useState(false)

  // New UI handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setStep("select-time")
      setSelectedTime("")
      // Keep calendar visible on mobile - don't hide it anymore
      // setShowCalendar(false) // Commented out - calendar stays visible

      // Scroll to time slots section on mobile only after a short delay
      if (isMobile) {
        setTimeout(() => {
          const timeSlotsSection = document.getElementById('time-slots-section')
          if (timeSlotsSection) {
            timeSlotsSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
          }
        }, 100) // Small delay to ensure DOM updates are complete
      }
    }
  }

  // Handler to show calendar again (for mobile date change) - deprecated since calendar is always shown
  const handleShowCalendar = () => {
    setShowCalendar(true)
    setSelectedTime("")
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleNext = () => {
    if (step === "select-time" && selectedDate && selectedTime) {
      setStep("enter-details")
      // Sync form data with legacy fields - populate with existing data if available
      setFormData({
        name: fullName,
        email: email,
        phone: phoneNumber,
        notes: ""
      })
    }
  }

  const handleBack = () => {
    if (step === "enter-details") {
      setStep("select-time")
      // Calendar is always visible now, no need to manage its state
    } else if (step === "select-time") {
      setStep("select-date")
      setSelectedDate(undefined)
      setSelectedTime("")
      // Calendar is always visible now, no need to manage its state
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Sync with legacy fields
    if (field === "name") setFullName(value)
    if (field === "email") setEmail(value)
    if (field === "phone") setPhoneNumber(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleConfirmCall()
  }

  // Check if form is valid for new UI
  const isNewFormValid = () => {
    // Phone number is always required
    const phoneValid = phoneNumber.trim() !== ""

    if (showContactFields) {
      // If showing contact fields, name and email are also required
      return formData.name.trim() !== "" && formData.email.trim() !== "" && phoneValid
    } else {
      // If not showing contact fields, we already have name/email from localStorage/URL
      return phoneValid
    }
  }

  // Check localStorage on component mount
  useEffect(() => {
    // Check if this is direct access by looking for app navigation marker
    const isDirectlyAccessed = !hasAppNavigation()
    setIsDirectAccess(isDirectlyAccessed)

    // Set the navigation marker for future page navigations
    setAppNavigation()

    // First, check URL parameters and update localStorage if needed
    let emailParam: string | null = null
    let nameParam: string | null = null
    let phoneParam: string | null = null
    try {
      const sp = new URLSearchParams(window.location.search)
      emailParam = sp.get('email')
      nameParam = sp.get('name')
      phoneParam = sp.get('phone')
    } catch (e) {
      // Ignore parsing errors
    }

    if (emailParam || nameParam || phoneParam) {
      // Get existing contact info from localStorage
      let existingContactInfo: any = {}
      try {
        const stored = localStorage.getItem("user_contact_info")
        if (stored) {
          existingContactInfo = JSON.parse(stored)
        }
      } catch (error) {
        // If parsing fails, start with empty object
        existingContactInfo = {}
      }

      // Update with URL parameters
      const updatedContactInfo = {
        ...existingContactInfo,
        ...(emailParam && { email: emailParam }),
        ...(nameParam && { fullName: nameParam }),
        ...(phoneParam && { phone: phoneParam })
      }

      // Store back to localStorage
      localStorage.setItem("user_contact_info", JSON.stringify(updatedContactInfo))
    }

    // Then proceed with existing logic
    try {
      const userContactInfo = localStorage.getItem("user_contact_info")
      if (userContactInfo) {
        const contactData = JSON.parse(userContactInfo)
        const hasEmail = contactData.email && contactData.email.trim() !== ""
        const hasFullName = contactData.fullName && contactData.fullName.trim() !== ""
        const hasPhone = contactData.phone && contactData.phone.trim() !== ""

        // Set the values we have
        if (hasEmail) setEmail(contactData.email)
        if (hasFullName) setFullName(contactData.fullName)
        if (hasPhone) setPhoneNumber(contactData.phone)

        if (hasEmail && hasFullName) {
          // User has both email and fullName, don't show name/email fields
          setShowContactFields(false)
          // Only show proposal banner if not direct access
          setShowProposalSentBanner(!isDirectlyAccessed)
        } else {
          // Missing either email or fullName, show those fields
          setShowContactFields(true)
          setShowProposalSentBanner(false)
        }
      } else {
        // No user_contact_info in localStorage, show additional fields
        setShowContactFields(true)
        setShowProposalSentBanner(false)
      }
    } catch (error) {
      // Error parsing localStorage, show additional fields to be safe
      setShowContactFields(true)
      setShowProposalSentBanner(false)
    }
  }, [])

  // Fetch booked calls to disable those time slots
  useEffect(() => {
    const monthNameToIndex: Record<string, number> = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    }

    const parseCallDateTime = (call_date: string, call_time: string) => {
      // call_date format: "August 15, 2025"; call_time: "10:00 AM"
      try {
        const [monthName, dayWithComma, yearStr] = call_date.split(" ")
        const day = parseInt(dayWithComma.replace(",", ""), 10)
        const year = parseInt(yearStr, 10)
        const monthIndex = monthNameToIndex[monthName]
        let [timePart, ampm] = call_time.split(" ")
        const [hhStr, mmStr] = timePart.split(":")
        let hour = parseInt(hhStr, 10)
        const minute = parseInt(mmStr, 10)
        if (ampm === "PM" && hour !== 12) hour += 12
        if (ampm === "AM" && hour === 12) hour = 0
        const dt = new Date(year, monthIndex, day, hour, minute, 0, 0)
        return dt
      } catch (e) {
        return null
      }
    }

    const fetchAllBookedCalls = async () => {
      try {
        let page = 1
        const per_page = 50
        let aggregated: number[] = []
        while (true) {
          const res = await api.get('public_users/installer-users-today-future-calls', { params: { page, per_page } })
          const data = res?.data || {}
          const calls = Array.isArray(data.calls) ? data.calls : []
          for (const c of calls) {
            const dt = parseCallDateTime(c.call_date, c.call_time)
            if (dt) aggregated.push(dt.getTime())
          }
          if (data?.has_next) {
            page += 1
          } else {
            break
          }
        }
        setBookedSlots(new Set(aggregated))
      } catch (err) {
        // Fail silently; no booked slots will be disabled if API fails
        setBookedSlots(new Set())
      } finally {
        setBookingsLoaded(true)
      }
    }

    fetchAllBookedCalls()
  }, [])

  // Remove custom month navigation as react-day-picker handles it

  // Remove custom calendar generation as react-day-picker handles it

  // 15-minute slots within 9-11 AM and 4-6 PM
  const formatTime = (hour24: number, minute: number) => {
    const ampm = hour24 >= 12 ? "PM" : "AM"
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
    const minuteStr = minute.toString().padStart(2, "0")
    return `${hour12}:${minuteStr} ${ampm}`
  }

  const generateTimeSlotsForDate = (year: number, month: number, day: number) => {
    const slots: { label: string, date: Date }[] = []
    const addWindow = (startHour: number, endHour: number) => {
      for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 15) {
          if (h === endHour && m > 0) break // include endHour only at :00
          const date = new Date(year, month, day, h, m, 0, 0)
          slots.push({ label: formatTime(h, m), date })
        }
      }
    }
    
    // Check if this is the next day (tomorrow)
    const selectedDate = new Date(year, month, day)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    const isNextDay = selectedDate.getTime() === tomorrow.getTime()
    
    if (isNextDay) {
      // For next day bookings, only show slots after 12 PM (4-6 PM window)
      addWindow(16, 18)
    } else {
      // For other days, show both morning and afternoon slots
      addWindow(9, 11)
      addWindow(16, 18)
    }
    
    return slots
  }

  const dayHasAvailableSlots = (year: number, month: number, day: number) => {
    return generateTimeSlotsForDate(year, month, day).some(slot => {
      const ts = slot.date.getTime()
      const isFutureEnough = ts >= minBookingTime.getTime()
      const isNotBooked = !bookedSlots.has(ts)
      return isFutureEnough && isNotBooked
    })
  }

  const findFirstAvailableDate = () => {
    // Start from today and look for the first available date in the next 6 months
    const startDate = new Date(today)

    for (let i = 0; i < 180; i++) { // Check next 180 days (roughly 6 months)
      const checkDate = new Date(startDate)
      checkDate.setDate(startDate.getDate() + i)

      if (dayHasAvailableSlots(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())) {
        return { date: checkDate }
      }
    }
    return null
  }

  // Remove the effect that was setting currentMonthIndex since react-day-picker handles month display
  useEffect(() => {
    if (!bookingsLoaded) return

    // Just find the first available date for reference, but don't set any state
    // react-day-picker will handle the month display automatically
    const first = findFirstAvailableDate()
    if (first) {
      // Log for debugging if needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingsLoaded])

  const timeSlots = selectedDate
    ? generateTimeSlotsForDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    : []

  // Check if all required fields are filled
  const isFormValid = () => {
    if (step === "enter-details") {
      // For new UI in enter-details step
      return selectedDate && selectedTime && isNewFormValid()
    }

    // Legacy validation for old UI (if somehow still used)
    const basicFieldsValid = selectedDate && selectedTime && phoneNumber
    const selectedSlot = timeSlots.find(s => s.label === selectedTime)
    const isTimeValid = !!selectedSlot && selectedSlot.date.getTime() >= minBookingTime.getTime() && !bookedSlots.has(selectedSlot.date.getTime())
    if (showContactFields) {
      return basicFieldsValid && fullName.trim() !== "" && email.trim() !== "" && isTimeValid
    }
    return !!basicFieldsValid && isTimeValid
  }

  // Handle confirm call submission
  const handleConfirmCall = async () => {
    if (!isFormValid()) {
      setSubmitError("Please complete all fields with a valid time at least 4 hours from now.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Validate time one more time on submit
      const selectedSlot = timeSlots.find(s => s.label === selectedTime)
      if (!selectedSlot || selectedSlot.date.getTime() < minBookingTime.getTime() || bookedSlots.has(selectedSlot.date.getTime())) {
        setSubmitError("Please choose an available time at least 4 hours from now.")
        setIsSubmitting(false)
        return
      }

      // Get final name, email, and phone values (from form data or legacy fields)
      const finalEmail = step === "enter-details" ? (showContactFields ? formData.email.trim() : email.trim()) : email.trim()
      const finalName = step === "enter-details" ? (showContactFields ? formData.name.trim() : fullName.trim()) : fullName.trim()
      const finalPhone = step === "enter-details" ? formData.phone.trim() : phoneNumber.trim()

      // Collect data from localStorage for API call (same as plan page)
      const solarPlanData = localStorage.getItem('solar_plan_data')
      const personaliseAnswers = localStorage.getItem('personalise_answers')
      const selectedLocation = localStorage.getItem('selectedLocation')

      // Format the date for API
      const dateForApi = selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""

      // Prepare API request body
      const requestBody = {
        email: finalEmail,
        name: finalName,
        phone: finalPhone,
        call_date: dateForApi,
        call_time: selectedTime,
        solar_plan_data: solarPlanData ? JSON.parse(solarPlanData) : null,
        personalise_answers: personaliseAnswers ? JSON.parse(personaliseAnswers) : null,
        selectedLocation: selectedLocation ? JSON.parse(selectedLocation) : null,
        branding: getEmailBranding(),
        company_id: 3,

      }

      // Make API call to the same endpoint as plan page
      const response = await api.post('public_users/new-journey-installer-user', requestBody)

      // Save contact info to localStorage for future use
      const contactInfoToSave = {
        email: finalEmail,
        fullName: finalName,
        phone: finalPhone
      }
      localStorage.setItem("user_contact_info", JSON.stringify(contactInfoToSave))

      // Show the booking success terminal UI
      setStep("booking-success")

    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message ||
        'Failed to book your call. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show terminal UI when booking is successful
  if (step === "booking-success") {
    return <CallBookingTerminal />
  }

  return (
    <div className="min-h-screen">
      {/* App Header - only show if not direct access */}
      {!isDirectAccess && (
        <AppHeader showBackButton={true} maxWidth="max-w-7xl" />
      )}

      {/* Progress Steps */}
      <ProgressBars
        addressActive={true}
        potentialActive={true}
        personaliseActive={true}
        planActive={true}
        maxWidth="max-w-7xl"
      />

      <div className="transition-all duration-300">
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            step === "select-date" ? "max-w-5xl" : step === "select-time" ? "max-w-7xl" : "max-w-6xl"
          )}
        >
          <div
            className={cn(
              "grid min-h-screen transition-all duration-300",
              step === "select-date"
                ? "grid-cols-1 lg:grid-cols-[400px_1fr]"
                : step === "select-time"
                  ? "grid-cols-1  lg:grid-cols-[300px_1fr_330px] xl:grid-cols-[400px_1fr_400px]"
                  : "grid-cols-1 lg:grid-cols-[400px_1fr]"
            )}
          >
            {/* Left Side - Event Details */}
            <div className="bg-white p-4 lg:p-8 lg:border-r border-gray-200 pb-0 lg:pb-8 -mb-16 lg:mb-0 relative">
              <div className="max-w-md">


                <div className="mb-0 lg:mb-8">
                  <div className="mb-3 lg:mb-4">
                    {/* Mobile: Logo, name and title in one row */}
                    <div className="flex items-center gap-3 lg:block mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center lg:mb-3">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 lg:block">
                        {/* <h2 className="text-sm text-gray-500 mb-1">Stephen Joyce • Solar Consultant</h2> */}
                        <h3 className="text-xl lg:text-3xl font-bold text-gray-900 mb-0 lg:mb-3">
                          Schedule a Call Back
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "block space-y-2 lg:space-y-3 mb-3 lg:mb-6 ",
                    // Hide on mobile when date is selected
                    // selectedDate ? "hidden lg:block" : "block"
                  )}>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-sm lg:text-base">15 minutes</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm lg:text-base">Phone call</span>
                    </div>

                    {/* Hide UK, Ireland, Lisbon Time on mobile */}
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Info className="w-4 h-4" />
                      </div>
                      <span className="text-sm lg:text-base">UK, Ireland, Lisbon Time</span>
                    </div>
                  </div>

                  {step === "enter-details" && selectedDate && selectedTime && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 lg:mb-6 mt-4">

                      <div className="flex items-center gap-2 text-blue-800">
                        <CalendarIcon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </div>
                          <div className="text-sm">
                            {(() => {
                              const selectedSlot = timeSlots.find(s => s.label === selectedTime)
                              if (selectedSlot) {
                                const endTime = new Date(selectedSlot.date.getTime() + 15 * 60000)
                                return `${selectedTime} - ${format(endTime, "h:mma")}`
                              }
                              return selectedTime
                            })()}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800 mb-0" style={{ textDecoration: "underline", textAlign: 'right', cursor:"pointer" }} onClick={() =>
                        setStep("select-time")
                      }>Change Date</p>
                    </div>
                  )}

                  {/* What to expect - Expandable on mobile, always expanded on desktop */}
                  <div className={` ${step === "enter-details" ? "bg-gray-50" : "bg-white"} rounded-lg overflow-hidden -mb-12 lg:mb-0 lg:mt-0 relative z-10 }`}>
                    {/* Mobile: Clickable header */}
                    <button
                      onClick={() => setIsExpectationExpanded(!isExpectationExpanded)}
                      className="lg:hidden w-full p-1 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900">What to expect</h4>
                      {isExpectationExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {/* Desktop: Always show header */}
                    <div className="hidden lg:block p-4 pb-2">
                      <h4 className="font-semibold text-gray-900">What to expect:</h4>
                    </div>

                    {/* Content - Expandable on mobile, always visible on desktop */}
                    <div className={cn(
                      "lg:block lg:px-4 lg:pb-4",
                      isExpectationExpanded ? "block px-1 pb-1" : "hidden"
                    )}>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        We'll call you at your chosen time to discuss your solar options, answer any questions about your quote, and help you get started with your solar journey. No pressure, just helpful advice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle - Calendar Section */}
            {step !== "enter-details" && (
              <div className="bg-white">
                <div className="h-full flex items-start justify-center pt-0 lg:pt-8 px-0 lg:px-6">
                  <div className={cn(
                    "w-full lg:max-w-2xl lg:mt-0 px-4 lg:px-0 relative z-0 lg:z-20",
                    // "w-full lg:max-w-2xl lg:mt-0 px-4 lg:px-0 relative z-20 bg-yellow-100",
                    // Add space when "What to expect" is expanded on mobile
                    isExpectationExpanded ? "-mt-[7rem]" : "-mt-[7rem]"
                  )}>

                    {/* Calendar - always visible on both mobile and desktop */}
                    <div className="block">
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-0 pt-2 lg:p-6 mt-[15.4rem] lg:mt-0">
                        {/* Let react-day-picker handle month navigation */}

                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => {
                            const dayBefore = new Date()
                            dayBefore.setDate(dayBefore.getDate() - 1)
                            const isSunday = date.getDay() === 0
                            return date < dayBefore || isSunday || !dayHasAvailableSlots(date.getFullYear(), date.getMonth(), date.getDate())
                          }}
                          className="w-full"
                          classNames={{
                            months: "flex flex-col",
                            month: "w-full",
                            caption: "flex justify-center pt-1 relative items-center mb-4",
                            caption_label: "text-lg lg:text-sm xl:text-2xl font-semibold text-gray-900",
                            nav: "space-x-1 flex items-center",
                            nav_button: "p-2 h-auto hover:bg-gray-100 rounded-lg transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse",
                            head_row: "flex mb-4",
                            head_cell:
                              "text-gray-500 rounded-md flex-1 h-8 lg:h-10 font-medium text-sm flex items-center justify-center uppercase",
                            row: "flex w-full mb-1 lg:mb-2",
                            cell: "relative flex-1 text-center focus-within:relative focus-within:z-20",
                            day: "h-10 lg:h-8 xl:h-12 w-full p-0 font-normal hover:bg-blue-50 rounded-lg transition-all text-sm border border-transparent hover:border-blue-200 mx-0.5",
                            day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 border-blue-600 shadow-md",
                            day_today: "bg-gray-100 text-gray-900 font-semibold border-gray-300",
                            day_outside: "text-gray-400 opacity-50",
                            day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                            day_range_middle: "text-blue-600 font-medium hover:bg-blue-50",
                          }}
                          fixedWeeks
                          showOutsideDays={false}
                          weekStartsOn={1}
                          fromDate={today}
                          toDate={addDays(today, 180)}
                        />

                        {/* Completely hide UK, Ireland, Lisbon Time section on mobile */}
                        <div className="hidden lg:block mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>UK, Ireland, Lisbon Time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right Side - Time Slots */}
            {step === "select-time" && selectedDate && (
              <div
                id="time-slots-section"
                className="bg-white lg:border-l border-gray-200 px-6 pb-6 pt-6 lg:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Available Times
                  </h3>

                  <div className="text-sm text-gray-600 mb-4">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-1 gap-3 lg:space-y-3 max-h-96 overflow-y-auto pr-2">
                    {timeSlots
                      .filter((slot) => {
                        const ts = slot.date.getTime()
                        const isAvailable = ts >= minBookingTime.getTime() && !bookedSlots.has(ts)
                        return isAvailable
                      })
                      .map((slot) => (
                        <div key={slot.label} className="lg:space-y-0">
                          {selectedTime === slot.label ? (
                            <div className="flex gap-3">
                              <Button
                                className="flex-1 justify-center py-3 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                onClick={() => handleTimeSelect(slot.label)}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                {slot.label}
                              </Button>
                              <Button
                                className="px-6 py-3 text-base bg-green-600 hover:bg-green-700 text-white font-medium"
                                onClick={handleNext}
                              >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full justify-center py-3 text-sm lg:text-base border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all"
                              onClick={() => handleTimeSelect(slot.label)}
                              onMouseEnter={() => setHoveredTime(slot.label)}
                              onMouseLeave={() => setHoveredTime("")}
                            >
                              <Clock className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                              {slot.label}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>

                  {timeSlots.filter((slot) => {
                    const ts = slot.date.getTime()
                    const isAvailable = ts >= minBookingTime.getTime() && !bookedSlots.has(ts)
                    return isAvailable
                  }).length > 6 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-3 py-2">
                        <div className="text-xs text-gray-500 text-center font-medium flex items-center gap-1">
                          <ChevronDown className="w-3 h-3" />
                          Scroll for more times
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Right Side - Enter Details Form */}
            {step === "enter-details" && (
              <div className="mt-[7rem] md:mt-[6rem]  lg:mt-0 bg-white lg:border-l border-gray-200 p-6 lg:p-8">
                {/* <ArrowLeft className="w-5 h-5 mb-3" onClick={()=>
                  setStep("select-time")
                } /> */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Details</h3>
                  <p className="text-gray-600">Please provide your contact information so we can reach you.</p>
                </div>

                {/* Show info about pre-filled data */}
                {!showContactFields && (fullName || email) && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        We have your {fullName && "name"}
                        {fullName && email && " and "}
                        {email && "email"} from your previous visit.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Conditionally show Name field */}
                  {showContactFields && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="h-12 border-2 border-gray-300 focus:border-blue-500 text-base"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  )}

                  {/* Conditionally show Email field */}
                  {showContactFields && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="h-12 border-2 border-gray-300 focus:border-blue-500 text-base"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  )}

                  {/* Always show Phone field */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="h-12 border-2 border-gray-300 focus:border-blue-500 text-base"
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="w-full h-32 px-4 py-3 border-2 border-gray-300 focus:border-blue-500 rounded-lg resize-none text-base"
                      placeholder="Share anything that will help us prepare for your call..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg mt-8 transition-colors"
                    disabled={!isNewFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scheduling Your Call...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Schedule My Call
                      </div>
                    )}
                  </Button>
                </form>

                {/* Error Message */}
                {submitError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-600 font-medium">{submitError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 