"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Phone } from 'lucide-react'

interface ContinueCTAProps {
  onContinue: () => void
  onBookCall?: () => void
}

export function ContinueCTA({ onContinue, onBookCall }: ContinueCTAProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="w-full px-2 md:px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-3">
            <div className="text-center sm:text-left">
              <h3 className="text-sm md:text-base font-bold text-gray-900">Get your personalised solar plan</h3>
              <p className="text-xs md:text-sm text-gray-600">Customize your system to fit your needs and budget</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {onBookCall && (
                <Button
                  onClick={onBookCall}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 md:px-6 py-2 md:py-3 text-sm font-semibold w-full sm:w-auto shrink-0"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Book a Call
                </Button>
              )}
              <Button
                onClick={onContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 text-sm font-semibold w-full sm:w-auto shrink-0"
              >
                Continue to Personalization
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
