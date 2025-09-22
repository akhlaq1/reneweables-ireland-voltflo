"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PdfExpandableCardProps {
  title: string
  children: React.ReactNode
  initialOpen?: boolean
}

export function PdfExpandableCard({ title, children, initialOpen = false }: PdfExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-semibold text-gray-800">{title}</h4>
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>
        {isOpen && <div className="px-4 pb-4 text-gray-600">{children}</div>}
      </CardContent>
    </Card>
  )
}
