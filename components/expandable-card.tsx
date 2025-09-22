"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ExpandableCardProps {
  title: string
  children: React.ReactNode
  initialOpen?: boolean
}

export function ExpandableCard({ title, children, initialOpen = false }: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <Card>
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-800">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 text-gray-600">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 