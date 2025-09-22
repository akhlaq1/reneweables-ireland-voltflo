"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppHeader({ showBackButton = true, maxWidth = "max-w-7xl", onBack }: { showBackButton?: boolean; maxWidth?: string; onBack?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      // Use browser history to go to the actual previous page
      router.back()
    }
  }

  return (
    <header 
    className={`bg-white z-50 relative border-b pt-2 `}
    // className={`bg-gray-50 z-50 relative border-b pt-2 `}
    >
      <div className={`container bg-white mx-auto ${maxWidth} px-4`}>
      {/* <div className={`container border-b bg-white mx-auto ${maxWidth} px-4`}> */}
        <div className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="rounded-full hover:bg-green-50 hover:text-green-600 hover:p-2  p-0"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Back</span>
              </Button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600"></span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
