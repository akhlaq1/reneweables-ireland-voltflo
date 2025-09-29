"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Instagram, Linkedin, Facebook, Clock, Phone } from "lucide-react"
import { getBranding } from "@/lib/branding"

export function CallBookingTerminal() {
  const branding = getBranding()
  
  const handleInstagramClick = () => {
    if (branding.social?.instagram) {
      window.open(branding.social.instagram, '_blank')
    }
  }

  const handleFacebookClick = () => {
    if (branding.social?.facebook) {
      window.open(branding.social.facebook, '_blank')
    }
  }

  const handleLinkedInClick = () => {
    if (branding.social?.linkedin) {
      window.open(branding.social.linkedin, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
        {/* Header Section - More compressed */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200 mb-2 sm:mb-3">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Excellent! Your Call is Booked 🎉</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            We're excited to chat with you about your solar journey
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-2 max-w-xs sm:max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-medium text-gray-800">
              📧 Confirmation email sent - check your inbox! 😊
            </p>
          </div>
        </div>

        {/* Main Content - Single column, more compressed */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* What to Expect Card - More compact and centered */}
          <Card className="bg-white border-green-200 shadow-lg max-w-full sm:max-w-2xl mx-auto">
            <CardContent className="p-2 sm:p-3">
              <div className="text-center mb-2">
                <div className="mx-auto w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-full flex items-center justify-center mb-1">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">What to Expect on Your Call</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md sm:max-w-lg mx-auto">
                <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Answer your questions</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Review your solar plan</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-800">Plan next steps together</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-green-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">No pressure, just helpful advice</span>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Social Media Section - With JR Energy logo */}
          <Card className="bg-white border-green-200 shadow-lg max-w-full sm:max-w-2xl mx-auto">
            <CardContent className="p-2 sm:p-3">
              <div className="text-center mb-2">
                <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 mb-1">
                  <img src={branding.logo} alt={branding.name} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Follow {branding.name}</h2>
              </div>
              <p className="text-gray-600 text-center mb-2 text-sm">
                See real solar installations from Irish homeowners and stay updated with our latest projects! 🏠⚡
              </p>
              <div className="flex gap-1 sm:gap-1.5 justify-center flex-wrap">
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  onClick={handleInstagramClick}
                >
                  <Instagram className="w-3 h-3 mr-1" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  onClick={handleLinkedInClick}
                >
                  <Linkedin className="w-3 h-3 mr-1" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  onClick={handleFacebookClick}
                >
                  <Facebook className="w-3 h-3 mr-1" />
                  Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Powered by VoltFlo */}
        <div className="text-center space-y-2 py-3 sm:py-4 border-t border-green-100">
          <p className="text-xs sm:text-sm text-gray-600">
         Questions or need help?{" "}
            {branding.email && (
              <a href={`mailto:${branding.email}`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              {branding.email}
              </a>
            )}
          </p>
          <p className="text-xs text-gray-400">Powered by VoltFlo</p>
        </div>
      </div>
    </div>
  )
}
