"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MessageCircle, Instagram, Linkedin, Facebook } from "lucide-react"
import { useRouter } from "next/navigation"
import { setAppNavigation } from "@/lib/navigation-tracker"
import { getBranding } from "@/lib/branding"

export default function ReviewReportLanding() {
  const router = useRouter()
  const branding = getBranding()

  const handleBookConsultation = () => {
    console.log("[v0] User clicked Book Consultation from landing page")
    setAppNavigation()
    router.push('/call-page')
  }

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

  const handleLinkedinClick = () => {
    if (branding.social?.linkedin) {
      window.open(branding.social.linkedin, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
        {/* Header Section - More compressed */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 mb-2 sm:mb-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Perfect! Your Plan is On Its Way 🎉</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            Take your time reviewing it - we're here when you're ready
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 max-w-xs sm:max-w-md mx-auto">
            <p className="text-xs sm:text-sm font-medium text-gray-800">
              📧 Check your inbox, spam & promotions folders (just in case) 😊
            </p>
          </div>
        </div>

        {/* Main Content - Single column, more compressed */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* What's Next Card - More compact and centered */}
          <Card className="bg-white border-blue-200 shadow-lg max-w-full sm:max-w-2xl mx-auto">
            <CardContent className="p-2 sm:p-3">
              <div className="text-center mb-2">
                <div className="mx-auto w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-full flex items-center justify-center mb-1">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Your Solar Breakdown</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md sm:max-w-lg mx-auto">
                <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <span className="text-xs font-medium text-gray-800">Personalised system design</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <span className="text-xs font-medium text-gray-800">Government grants available</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Expected savings timeline</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 rounded">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Next steps to get started</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready to Chat Section - More prominent */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg max-w-full sm:max-w-2xl mx-auto">
            <CardContent className="p-2 sm:p-3 text-center">
              <div className="mx-auto w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Need Help Understanding Your Results? 🤔
              </h2>
              <p className="text-gray-700 mb-2 max-w-xs sm:max-w-sm mx-auto text-sm">
                Most homeowners have 3-4 questions after going through their analysis. We can answer them in 10 minutes
                - no obligation, just friendly advice! ☕
              </p>
              <Button
                onClick={handleBookConsultation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Let's Have a Quick Chat! 📞
              </Button>
            </CardContent>
          </Card>

          {/* Social Media Section */}
          <Card className="bg-white border-blue-200 shadow-lg max-w-full sm:max-w-2xl mx-auto">
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
                {branding.social?.instagram && (
                  <Button
                    variant="outline"
                    onClick={handleInstagramClick}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  >
                    <Instagram className="w-3 h-3 mr-1" />
                    Instagram
                  </Button>
                )}
                {branding.social?.linkedin && (
                  <Button
                    variant="outline"
                    onClick={handleLinkedinClick}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  >
                    <Linkedin className="w-3 h-3 mr-1" />
                    LinkedIn
                  </Button>
                )}
                {branding.social?.facebook && (
                  <Button
                    variant="outline"
                    onClick={handleFacebookClick}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white px-2 sm:px-3 py-1 font-medium text-xs"
                  >
                    <Facebook className="w-3 h-3 mr-1" />
                    Facebook
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Powered by VoltFlo */}
        <div className="text-center space-y-2 py-3 sm:py-4 border-t border-blue-100">
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
