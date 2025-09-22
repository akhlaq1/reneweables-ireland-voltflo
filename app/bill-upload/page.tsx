"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, FileText, Info, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AppHeader } from "@/components/app-header"
import { StepBadges } from "@/components/step-badges"
import { AvatarAssistant } from "@/components/avatar-assistant"

export default function BillUploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSkip = () => {
    router.push("/confirmation")
  }

  const handleUpload = () => {
    router.push("/confirmation")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <StepBadges currentStep={4} />
      <main className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-8">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                Want faster design and accuracy?
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">
                        We don't store your bill. We only extract your usage to improve your plan.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600">
                Upload your last electricity bill (PDF or photo). We'll extract key data and delete it automatically.
              </p>

              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragging ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-green-600" />
                    <p className="mt-2 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Drag and drop your bill here, or click to browse</p>
                    <div className="mt-4 flex gap-4">
                      <Button variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                      <label htmlFor="file-upload">
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                        />
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <FileText className="mr-2 h-4 w-4" />
                            Browse Files
                          </span>
                        </Button>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSkip} variant="outline" className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleUpload} className="flex-1 bg-green-600 hover:bg-green-700" disabled={!file}>
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AvatarAssistant step={1} pageType="bill-upload" />
    </div>
  )
}
