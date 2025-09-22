"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import PDFPreviewClient from "./PDFPreviewClient"

export default function PDFPreviewPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading proposal data...</p>
          </div>
        </div>
      }
    >
      <PDFPreviewClient />
    </Suspense>
  )
}
