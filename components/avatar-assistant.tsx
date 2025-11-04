"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AvatarAssistantProps {
  step: number
  pageType: string
  onComplete?: () => void
}

export function AvatarAssistant({ step, pageType, onComplete }: AvatarAssistantProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(true) // Start minimized by default
  const [message, setMessage] = useState("")
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  // Messages for different steps and pages
  const stepMessages = {
    address:
      "Enter your full address so we can analyse your roof's solar potential. This helps us calculate your potential savings accurately.",
    loading: "We're analysing your home's energy profile using satellite imagery. This only takes a few seconds!",
    snapshot:
      "Look at those potential savings! This is just an estimate - we'll refine it as you provide more details.",
    personalise1:
      "Let's start by understanding your electricity usage. The national average is €180/month - drag the slider to match your typical bill.",
    personalise2:
      "Your BER rating helps us understand your home's current energy efficiency. Don't worry if you're not sure - we can estimate it.",
    personalise3:
      "Do you own an electric vehicle or plan to get one? This affects your electricity usage and potential savings.",
    personalise4:
      "Battery storage lets you use solar energy at night. It costs more upfront but increases your independence from the grid.",
    plan: "Here's your personalised plan! The loan practically pays for itself through energy savings. You're just €7/month away from energy independence!",
    financing:
      "Compare cash payment vs financing options. Many customers find that the monthly loan payment is less than their energy savings!",
    login:
      "We'll keep your plan safe and send it to your email. Don't worry - we never share your information or send marketing emails.",
    "loan-submission":
      "This is not a formal application yet - just sending your plan to the Credit Union for review. You're still in control!",
    "site-visit":
      "A quick site visit helps confirm everything is suitable for installation. Our approved installers are all certified professionals.",
    "bill-upload":
      "Uploading your bill helps us fine-tune your plan. We only extract usage data and then delete the file - your privacy is important!",
    "installer-booking":
      "Choose a trusted installer from our Credit Union-vetted partners. They'll visit your home to confirm measurements and finalize your installation plan.",
    completion:
      "Congratulations! You've completed all the steps. Your energy upgrade journey is now in motion, and you'll soon be enjoying the benefits!",
    signup:
      "Creating an account lets you save your plan and track your installation progress. Don't worry - we'll never share your information or send marketing emails.",
  }

  const completionMessages = {
    address: "Great job! We've found your home and can now analyse your solar potential.",
    snapshot: "Excellent! Now let's personalise your plan to maximise your savings.",
    personalise1: "Perfect! Now let's talk about your home's energy efficiency.",
    personalise2: "Thanks for that information! Now let's consider your transportation needs.",
    personalise3: "You're doing great! Just one more question about energy storage.",
    personalise4: "Wow! You've unlocked an extra €220 in annual savings! Let's see your full plan.",
    plan: "Amazing! Your plan shows you'll save €1,200 per year while helping the environment!",
    financing: "Great choice! Now you can see how affordable green energy can be with the right financing.",
    login: "Thanks for your details! We'll keep your plan safe and accessible.",
    "loan-submission": "Great choice! The Credit Union will help you with affordable green financing.",
    "site-visit": "Excellent! A site visit will ensure you get the perfect system for your home.",
    "bill-upload": "Thank you! This will help us fine-tune your savings calculations.",
    "installer-booking": "Perfect! Your site visit is now scheduled. We're one step closer to your energy upgrade!",
    signup:
      "Thanks for creating an account! Now you can access your plan anytime and track your installation progress.",
  }

  useEffect(() => {
    // Set the initial message based on the page type
    if (pageType === "personalise") {
      setMessage(stepMessages[`personalise${step}`] || "")
    } else {
      setMessage(stepMessages[pageType] || "")
    }

    // Show completion message when a component mounts (simulating completion of previous step)
    // except for the first page
    if (pageType !== "address" && !showCompletionMessage) {
      const previousPage =
        pageType === "snapshot"
          ? "address"
          : pageType === "plan"
            ? "personalise4"
            : pageType === "signup"
              ? "plan"
              : pageType === "installer-booking"
                ? "signup"
                : pageType === "completion"
                  ? "installer-booking"
                  : pageType === "personalise" && step > 1
                    ? `personalise${step - 1}`
                    : pageType

      const completionMsg = completionMessages[previousPage]

      if (completionMsg) {
        setShowCompletionMessage(true)
        setMessage(completionMsg)

        // After showing completion message, switch to current step message
        const timer = setTimeout(() => {
          setShowCompletionMessage(false)
          if (pageType === "personalise") {
            setMessage(stepMessages[`personalise${step}`] || "")
          } else {
            setMessage(stepMessages[pageType] || "")
          }
        }, 4000)

        return () => clearTimeout(timer)
      }
    }
  }, [step, pageType, showCompletionMessage])

  // Handle clicks outside the avatar component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        messageRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !messageRef.current.contains(event.target as Node) &&
        !isMinimized
      ) {
        setIsMinimized(true)
      }
    }

    // Handle input focus events
    const handleInputFocus = () => {
      setIsMinimized(true)
    }

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside)

    // Add focus listeners to all input elements
    const inputs = document.querySelectorAll('input, textarea, select, [role="combobox"]')
    inputs.forEach((input) => {
      input.addEventListener("focus", handleInputFocus)
    })

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleInputFocus)
      })
    }
  }, [isMinimized])

  if (!isVisible) return null

  // return (
  //   <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
  //     {/* Message bubble */}
  //     {!isMinimized && (
  //       <div
  //         ref={messageRef}
  //         className={cn(
  //           "mb-3 max-w-xs rounded-lg bg-white p-4 shadow-lg border border-green-100",
  //           showCompletionMessage ? "bg-green-50 border-green-200" : "",
  //         )}
  //       >
  //         <div className="flex justify-between items-start">
  //           <p className={cn("text-sm", showCompletionMessage ? "text-green-700 font-medium" : "text-gray-700")}>
  //             {message}
  //           </p>
  //           <Button
  //             variant="ghost"
  //             size="sm"
  //             className="h-6 w-6 p-0 ml-2 -mr-1 -mt-1 rounded-full"
  //             onClick={() => setIsMinimized(true)}
  //           >
  //             <X className="h-4 w-4" />
  //             <span className="sr-only">Minimize</span>
  //           </Button>
  //         </div>
  //         <div className="absolute -bottom-2 right-5 h-3 w-3 rotate-45 bg-white border-r border-b border-green-100"></div>
  //       </div>
  //     )}

  //     {/* Avatar */}
  //     <div ref={avatarRef}>
  //       <button
  //         onClick={() => setIsMinimized(false)}
  //         className={cn(
  //           "flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:bg-green-700 opacity-80 hover:opacity-100",
  //           isMinimized ? "animate-bounce" : "",
  //           showCompletionMessage ? "ring-4 ring-green-200" : "",
  //         )}
  //       >
  //         <span className="text-xl">🌱</span>
  //       </button>
  //     </div>
  //   </div>
  // )

  return null

}
