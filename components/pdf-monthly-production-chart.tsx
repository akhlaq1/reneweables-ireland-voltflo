"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts"
import type { ReactNode } from "react"

interface MonthlyData {
  timestamp: string
  monthly_sum: number
}

interface PdfMonthlyProductionChartProps {
  data: MonthlyData[]
}

interface ChartTooltipProps {
  children: ReactNode
}

function ChartTooltip({ children }: ChartTooltipProps) {
  return <div className="rounded-md border bg-white p-3 text-gray-800 shadow-md text-sm">{children}</div>
}

export function PdfMonthlyProductionChart({ data }: PdfMonthlyProductionChartProps) {
  // Define month order for proper sorting
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // Format and sort data for the chart
  const chartData = data
    .map((item) => ({
      month: item.timestamp.split("-")[0],
      value: Math.round(item.monthly_sum),
      sortOrder: monthOrder.indexOf(item.timestamp.split("-")[0])
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by month order
    .map(({ month, value }) => ({ month, value })) // Remove sortOrder from final data

  // Get the maximum value for setting the chart height
  const maxValue = Math.max(...chartData.map((item) => item.value))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="month" 
          axisLine={true} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#4B5563" }}
          height={60}
          interval={0}
          angle={-45}
        />
        <YAxis
          domain={[0, maxValue + 100]}
          axisLine={true}
          tickLine={true}
          tick={{ fontSize: 11, fill: "#6B7280" }}
          width={40}
        />
        <Tooltip
          content={({ active, payload }: any) => {
            if (active && payload && payload.length) {
              return (
                <ChartTooltip>
                  <div className="font-medium">{payload[0].payload.month}</div>
                  <div className="text-muted-foreground">{payload[0].value} kWh</div>
                </ChartTooltip>
              )
            }
            return null
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[4, 4, 0, 0]} 
          fill="#10B981" 
          barSize={30} 
          fillOpacity={0.9}
        >
          <LabelList
            dataKey="value"
            position="top"
            fill="#374151"
            fontSize={10}
            fontWeight="600"
            formatter={(value: number) => `${value}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
