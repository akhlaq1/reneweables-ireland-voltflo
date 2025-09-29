"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, User, Download, MessageSquare, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import api from "@/app/api/api"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSignup: (email: string, firstName?: string, allowContact?: boolean, phoneNumber?: string) => void
  showSkip?: boolean
  onSkip?: () => void
}

export function SignupModal({ isOpen, onClose, onSignup, showSkip = false, onSkip }: SignupModalProps) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [allowContact, setAllowContact] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckboxTooltip, setShowCheckboxTooltip] = useState(false)
  const [tooltipShownBefore, setTooltipShownBefore] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName) {
      alert("Please enter both your full name and email address")
      return
    }

    if (!allowContact && !tooltipShownBefore) {
      setShowCheckboxTooltip(true)
      setTooltipShownBefore(true)
      // Hide tooltip after 5 seconds
      setTimeout(() => setShowCheckboxTooltip(false), 5000)
      return
    }

    setIsLoading(true)
    
    try {
      // Get data from localStorage
      const businessProposal = localStorage.getItem('business_proposal')
      const personaliseAnswers = localStorage.getItem('personalise_answers')
      const selectedLocation = localStorage.getItem('selectedLocation')
      const roofArea = localStorage.getItem('roof_area')
      const financeInfo = localStorage.getItem('financeInfo')
      
      // Get energy_independence from nested object
      const energyIndependenceData = localStorage.getItem('energy_independence_data')
      let energyIndependence = null
      if (energyIndependenceData) {
        try {
          const parsedData = JSON.parse(energyIndependenceData)
          energyIndependence = parsedData.practicalIndependence
        } catch (error) {
        }
      }

      // Prepare the data for the API request
      const requestData = {
        name: firstName,
        email: email,
        phone_number: phoneNumber || null,
        business_proposal: businessProposal,
        personalise_answers: personaliseAnswers,
        selectedLocation: selectedLocation,
        roof_area: roofArea,
        energy_independence: energyIndependence,
        financeInfo: financeInfo,
        consent: allowContact
      }

      // Make the POST request
      const response = await api.post('public_users/new-journey-user', requestData)
      
      // Handle successful response
      
      // Call the original onSignup callback
      onSignup(email, firstName, allowContact, phoneNumber)
      
    } catch (error) {
      // You might want to show a more user-friendly error message
      alert('There was an error saving your information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setAllowContact(checked as boolean)
    // Hide tooltip when checkbox is checked
    if (checked) {
      setShowCheckboxTooltip(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Want to save this plan or talk to your Credit Union?</h2>
          <p className="mt-2 text-gray-600">
            We'll email your personalised plan and let your Credit Union know you're interested. No spam. No commitment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  required
                  type="text"
                  placeholder="Your Full Name"
                  className="pl-10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="(0818) 272-927"
                  className="pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="relative flex items-start space-x-2 pt-2">
              <Checkbox
                id="allowContact"
                checked={allowContact}
                onCheckedChange={handleCheckboxChange}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="allowContact" className="text-sm font-normal text-gray-700">
                  I'm happy for my Credit Union to follow up.
                </Label>
              </div>
              
              {/* Tooltip pointing to checkbox */}
              {showCheckboxTooltip && (
                <div className="absolute -top-16 left-0 z-10 w-64 rounded-lg bg-red-50 border-2 border-red-200 p-3 shadow-lg">
                  <div className="absolute bottom-[-8px] left-4 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-200"></div>
                  <div className="text-sm font-medium text-red-800">
                    ✓ Please tick this checkbox to proceed with green financing with 0 downpayment
                  </div>
                  <button 
                    onClick={() => setShowCheckboxTooltip(false)}
                    className="absolute top-1 right-2 text-red-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 py-5"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Plan & Continue'}
            </Button>

            {allowContact && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>A Credit Union representative may contact you to discuss your options</span>
              </div>
            )}

            {/* {showSkip && (
              <Button
                type="button"
                variant="link"
                onClick={handleSkip}
                className="w-full text-gray-500 hover:text-green-600"
              >
                Skip for now
              </Button>
            )} */}
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          We'll never share your information with third parties or send marketing emails without your permission.
        </p>
      </div>
    </div>
  )
}
