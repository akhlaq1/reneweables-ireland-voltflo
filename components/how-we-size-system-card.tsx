"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, Eye, Satellite, Sun, RotateCcw, X } from "lucide-react"

interface HowWeSizeSystemCardProps {
  panelCount: number
  systemSizeKw: number
  annualHomeKwh: number
}

export function HowWeSizeSystemCard({ panelCount, systemSizeKw, annualHomeKwh }: HowWeSizeSystemCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold">How we sized your system</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-sm md:text-base">
              Learn more
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold mb-4">Our Solar Analysis Technology</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-gray-600 text-sm md:text-base">
                We use advanced AI and satellite imagery to analyse your roof:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 p-3 md:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1 text-sm md:text-base">Computer Vision Models</h3>
                    <p className="text-xs md:text-sm text-blue-800">
                      AI analyses roof structure, obstacles, and optimal panel placement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-3 md:p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Satellite className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1 text-sm md:text-base">Aerial Imagery Analysis</h3>
                    <p className="text-xs md:text-sm text-green-800">
                      High-resolution satellite data for precise roof measurements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-3 md:p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1 text-sm md:text-base">Sunshine Hours Mapping</h3>
                    <p className="text-xs md:text-sm text-orange-800">
                      Local weather data and solar irradiance calculations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-3 md:p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1 text-sm md:text-base">Orientation Analysis</h3>
                    <p className="text-xs md:text-sm text-purple-800">
                      Roof pitch, direction, and shading analysis for optimal performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mt-6">
                <p className="text-xs md:text-sm text-gray-700 font-medium">
                  This comprehensive analysis ensures your system is perfectly tailored to your home's unique
                  characteristics.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm md:text-base">Based on your roof size</span>
              <span className="text-gray-600 text-sm md:text-base">
                {" "}
                using machine learning, computer vision, and AI calculations
              </span>
              <p className="text-xs md:text-sm text-gray-500 mt-1">(we account for vents, chimneys & shading)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-sm md:text-base">Matched to your typical energy usage</span>
              <p className="text-xs md:text-sm text-gray-500 mt-1">(from your answer earlier)</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs md:text-sm">💡</span>
            </div>
            <span className="font-semibold text-blue-900 text-sm md:text-base">That gave us:</span>
          </div>
          <p className="text-base md:text-lg lg:text-xl font-bold text-blue-900">
            {panelCount} panels = {systemSizeKw}kW system, tailored to your home and needs.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
