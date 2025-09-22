import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, LightbulbIcon } from "lucide-react"
import { MonthlyProductionChart } from "@/components/monthly-production-chart"

interface MonthlyData {
  timestamp: string
  monthly_sum: number
}

interface MonthlyEnergyProductionCardProps {
  data: MonthlyData[]
}

export function MonthlyEnergyProductionCard({ data }: MonthlyEnergyProductionCardProps) {
  // Calculate annual total
  const annualTotal = data.reduce((sum, month) => sum + month.monthly_sum, 0)
  const roundedAnnualTotal = Math.round(annualTotal)

  // Find peak month
  const peakMonth = data.reduce((max, month) => (month.monthly_sum > max.monthly_sum ? month : max), data[0])
  const peakMonthName = peakMonth.timestamp.split("-")[0]
  const peakValue = Math.round(peakMonth.monthly_sum)

  return (
    <Card className="bg-green-50 border-green-100 w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-row items-center gap-2 mb-4">
          <CalendarIcon className="h-6 w-6 text-green-700 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-semibold text-green-800">Monthly Energy Production</h2>
        </div>

        <p className="text-green-700 mb-4">
          Your solar system will produce different amounts of energy throughout the year based on seasonal sunlight.
        </p>

        {/* Chart section - takes full width */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base sm:text-lg font-medium text-green-800">Monthly Solar Production</h3>
            <span className="text-sm text-green-600">kWh generated</span>
          </div>

          <div className="h-64 w-full">
            <MonthlyProductionChart data={data} />
          </div>
        </div>

        {/* Stats section */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 border-t border-green-200 pt-4">
          <div className="text-green-800">
            <span className="font-semibold">Annual Total:</span> {roundedAnnualTotal} kWh
          </div>
          <div className="text-green-800">
            <span className="font-semibold">Peak Month:</span> {peakMonthName} ({Math.round(peakValue)} kWh)
          </div>
        </div>

        {/* Info section */}
        {/* <div className="bg-green-100 rounded-lg p-3 sm:p-4 mt-4 flex items-center">
          <LightbulbIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-green-800 text-sm sm:text-base">
            <span className="font-semibold">Seasonal Pattern:</span> Higher production in summer months due to longer
            daylight hours and stronger sun intensity
          </p>
        </div> */}
      </CardContent>
    </Card>
  )
} 