"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ReactNode } from "react"

interface MonthlyData {
  timestamp: string
  monthly_sum: number
}

interface MonthlyProductionChartProps {
  data: MonthlyData[]
}

interface ChartTooltipProps {
  children: ReactNode
}

function ChartTooltip({ children }: ChartTooltipProps) {
  return <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-md">{children}</div>
}

export function MonthlyProductionChart({ data }: MonthlyProductionChartProps) {
  const isMobile = useIsMobile()

  // Format data for the chart
  const chartData = data.map((item) => ({
    month: item.timestamp.split("-")[0],
    value: Math.round(item.monthly_sum),
  }))

  // Get the maximum value for setting the chart height
  const maxValue = Math.max(...chartData.map((item) => item.value))
  
  // Calculate a nice upper bound for the chart with proper rounding
  // Find a nice round number above the max value
  const buffer = Math.max(50, Math.ceil(maxValue * 0.1)) // 10% buffer, minimum 50
  const roughUpperBound = maxValue + buffer
  const roundedUpperBound = Math.ceil(roughUpperBound / 100) * 100 // Round up to nearest 100
  
  // Create equally spaced tick values (5 intervals = 6 ticks)
  const tickInterval = roundedUpperBound / 5
  const tickValues = [
    0,
    Math.round(tickInterval),
    Math.round(tickInterval * 2),
    Math.round(tickInterval * 3),
    Math.round(tickInterval * 4),
    roundedUpperBound
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: isMobile ? 10 : 12, fill: "#047857" }}
          interval={0}
          angle={isMobile ? -45 : 0}
          textAnchor={isMobile ? 'end' : 'middle'}
          height={isMobile ? 50 : 30}
        />
        <YAxis
          domain={[0, roundedUpperBound]}
          axisLine={false}
          tickLine={true}
          tick={{ fontSize: 10, fill: "#047857" }}
          width={30}
          allowDecimals={false}
        />
        <Tooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length) {
              const value = Math.round(payload[0].value)
              return (
                <ChartTooltip>
                  <div className="text-sm font-medium">{payload[0].payload.month}</div>
                  <div className="text-sm text-muted-foreground">{value} kWh</div>
                </ChartTooltip>
              )
            }
            return null
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#059669" barSize={isMobile ? 20 : 32} fillOpacity={0.9}>
          <LabelList
            dataKey="value"
            position="top"
            fill="#047857"
            fontSize={isMobile ? 9 : 11}
            fontWeight="600"
            formatter={(value: number) => `${Math.round(value)}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
} 