"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Lightbulb, Clock, Info, CheckCircle, ChevronLeft, ChevronRight, X, Square, CheckSquare, TrendingUp, Settings, Clipboard, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { ProgressBars } from "@/components/progress-bars"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"



export default function PersonalisePage() {
  const router = useRouter()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{
    "time-of-use"?: string
    "motivation"?: string[]
    "house-built-date"?: string
  }>({})

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
    // Load answers from localStorage if available
    const savedAnswers = localStorage.getItem("personalise_answers")
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers)
        // Ensure motivation is properly formatted as string array
        if (parsed.motivation && Array.isArray(parsed.motivation)) {
          // Filter out any non-string values and single characters that might be artifacts
          parsed.motivation = parsed.motivation.filter((item: any) => 
            typeof item === 'string' && item.length > 1
          )
        }
        setAnswers(parsed)
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  const questions = [
    {
      id: "time-of-use",
      icon: Clock,
      title: "When do you use the most electricity?",
      info: `This helps us see how much solar you’ll use - and if a battery could boost your savings.`,
      hasInfoModal: true,
      infoModalTitle: "Why timing matters for batteries",
      infoModalContent: (
        <div className="space-y-4 p-2">
          <div className="text-center mb-4">
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Your usage pattern determines how much you'll benefit from battery storage.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">☀️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-900 text-sm md:text-base mb-1">
                    Morning & Day Usage
                  </h3>
                  <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                    You'll use solar energy directly as it's generated. Battery storage is still beneficial for storing excess energy for evening use.
                  </p>
                </div>
              </div>
              <div className="bg-amber-100/50 rounded-lg p-2 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">💡 Benefit: Medium battery value</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 text-sm md:text-base mb-1">
                    Evening Usage
                  </h3>
                  <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                    Battery storage is highly recommended. Store daytime solar energy to power your home during peak evening hours.
                  </p>
                </div>
              </div>
              <div className="bg-blue-100/50 rounded-lg p-2 border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">⚡ Benefit: High battery value</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🔋</span>
              <span className="font-semibold text-green-800 text-xs md:text-sm">Pro Tip</span>
            </div>
            <p className="text-xs md:text-sm text-green-700 leading-relaxed">
              Most households use 60-70% of their electricity in the evening, making battery storage a smart investment for maximizing solar savings.
            </p>
          </div>
        </div>
      ),
      options: [
        {
          value: "morning-evening",
          label: "Morning + Evening",
          icon: "🌅🌙",
          description: "6am-9am + 5pm-12am peak usage",
        },
        {
          value: "evening",
          label: "Evening",
          icon: "🌙",
          description: "5pm-12am peak usage",
        },
        {
          value: "all-day",
          label: "All day",
          icon: "🔄",
          description: "Consistent usage throughout",
        },
      ],
    },
    {
      id: "motivation",
      icon: Lightbulb,
      title: "What's motivating you?",
      options: [
        {
          value: "lowering-bills",
          label: "Lowering bills",
          icon: "💰",
          description: "Save money on electricity costs",
        },
        {
          value: "energy-independence",
          label: "Being energy independent",
          icon: "🏠",
          description: "Generate your own clean energy",
        },
        {
          value: "futureproofing",
          label: "Futureproofing",
          icon: "🚀",
          description: "Prepare for EVs, heat pumps, etc.",
        },
        {
          value: "curious",
          label: "I'm just curious",
          icon: "🤔",
          description: "Exploring my options",
        },
      ],
    },
    {
      id: "house-built-date",
      icon: Home,
      title: "When was your house built?",
      info: `This determines your eligibility for the SEAI grant of €1,800 for solar installations above 3kWp.`,
      hasInfoModal: true,
      infoModalTitle: "SEAI Grant Eligibility",
      infoModalContent: (
        <div className="space-y-4 p-2">
          <div className="text-center mb-4">
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              SEAI grants are available for homes built before 31st December 2020.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-green-900 text-sm md:text-base mb-1">
                    Eligible for SEAI Grant
                  </h3>
                  <p className="text-xs md:text-sm text-green-800 leading-relaxed">
                    Houses built before 31st December 2020 qualify for the €1,800 SEAI grant for solar installations above 3kWp.
                  </p>
                </div>
              </div>
              <div className="bg-green-100/50 rounded-lg p-2 border border-green-200">
                <p className="text-xs text-green-700 font-medium">💰 Benefit: €1,800 off your installation</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">❌</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-orange-900 text-sm md:text-base mb-1">
                    Not Eligible for SEAI Grant
                  </h3>
                  <p className="text-xs md:text-sm text-orange-800 leading-relaxed">
                    Houses built after 31st December 2020 do not qualify for the SEAI solar grant. Solar is still a great investment!
                  </p>
                </div>
              </div>
              <div className="bg-orange-100/50 rounded-lg p-2 border border-orange-200">
                <p className="text-xs text-orange-700 font-medium">ℹ️ Note: Still excellent savings without grant</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">📋</span>
              <span className="font-semibold text-blue-800 text-xs md:text-sm">Important</span>
            </div>
            <p className="text-xs md:text-sm text-blue-700 leading-relaxed">
              Grant eligibility is subject to final verification during the site survey. We handle all the paperwork for you.
            </p>
          </div>
        </div>
      ),
      options: [
        {
          value: "before-2021",
          label: "Before 31st Dec 2020",
          icon: "✅",
          description: "Eligible for €1,800 SEAI grant",
        },
        {
          value: "after-2020",
          label: "After 31st Dec 2020",
          icon: "🏠",
          description: "Not eligible for SEAI grant",
        },
        {
          value: "not-sure",
          label: "Not sure",
          icon: "❓",
          description: "We'll help you determine eligibility",
        },
      ],
    },
  ]

  const currentQuestion = questions[questionIndex]

  const handleSelect = (id: string, value: string) => {
    if (id === "motivation") {
      handleMultiSelect(id, value)
      return
    }
    
    setSelectedOption(value)
    const newAnswers = { ...answers, [id]: value }
    setAnswers(newAnswers)
    
    // Save to localStorage
    localStorage.setItem("personalise_answers", JSON.stringify(newAnswers))

    // Auto-advance after selection with minimal animation delay for smooth feedback
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1)
        setSelectedOption(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Ensure latest answers are saved before navigating to plan page
        localStorage.setItem("personalise_answers", JSON.stringify(newAnswers))
        router.push("/plan")
      }
    }, 200)
  }

  const handleMultiSelect = (id: string, value: string) => {
    const currentAnswer = answers[id as keyof typeof answers]
    let currentSelections: string[] = []
    
    // Safely get current selections and ensure they are valid strings
    if (Array.isArray(currentAnswer)) {
      currentSelections = currentAnswer.filter(item => typeof item === 'string' && item.length > 1)
    }
    
    let newSelections: string[]
    
    if (currentSelections.includes(value)) {
      // Remove if already selected
      newSelections = currentSelections.filter(item => item !== value)
    } else {
      // Add if not selected
      newSelections = [...currentSelections, value]
    }
    
    const newAnswers = { ...answers, [id]: newSelections }
    setAnswers(newAnswers)
    
    // Save to localStorage
    localStorage.setItem("personalise_answers", JSON.stringify(newAnswers))
  }

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1)
      setSelectedOption(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      setSelectedOption(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Ensure latest answers are saved before navigating to plan page
      localStorage.setItem("personalise_answers", JSON.stringify(answers))
      router.push("/plan")
    }
  }

  const progress = ((questionIndex + 1) / questions.length) * 100

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <AppHeader showBackButton={true} maxWidth="max-w-4xl" />
      
      {/* Progress Bar */}
      <ProgressBars 
        addressActive={true}
        potentialActive={true}
        personaliseActive={true}
        planActive={false}
        maxWidth="max-w-4xl"
      />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-2 md:px-4 lg:px-0 py-2 md:py-4">
          <div className="space-y-2 md:space-y-4">
            {/* Progress Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-1 md:space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base md:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Question {questionIndex + 1} of {questions.length}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-xs md:max-w-md mx-auto">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
              </div>
            </motion.div>

            {/* Question Card */}
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <CardContent className="p-3 md:p-6">
                  <div className="text-center mb-3 md:mb-5">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg"
                    >
                      <currentQuestion.icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg md:text-2xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                    >
                      {currentQuestion.title}
                    </motion.h2>

                    {currentQuestion.info && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-2 px-2"
                      >
                        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-lg p-2 md:p-3 shadow-sm max-w-lg mx-auto">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                              <Lightbulb className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-left text-xs md:text-sm text-amber-800 leading-snug">
                                  {currentQuestion.info}
                                </p>
                                {currentQuestion.hasInfoModal && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="p-0.5 h-auto flex-shrink-0">
                                        <Info className="w-3 h-3 text-blue-500" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[90vw] max-w-sm sm:max-w-md rounded-xl border-0 shadow-2xl max-h-[85vh] overflow-y-auto">
                                      {/* Close button */}
                                      <DialogClose asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-3 top-3 w-6 h-6 p-0 rounded-full hover:bg-gray-100"
                                        >
                                          <X className="w-3 h-3 text-gray-500" />
                                        </Button>
                                      </DialogClose>
                                      
                                      <DialogHeader className="space-y-2 pb-2">
                                        <DialogTitle className="text-lg md:text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pr-8">
                                          {currentQuestion.infoModalTitle}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="relative">
                                        {currentQuestion.infoModalContent}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 gap-2 md:gap-3"
                  >
                    {currentQuestion.options.map((opt, index) => {
                      const isMultiSelect = currentQuestion.id === "motivation"
                      const currentAnswer = answers[currentQuestion.id as keyof typeof answers]
                      
                      let isSelected: boolean
                      if (isMultiSelect) {
                        isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)
                      } else {
                        isSelected = currentAnswer === opt.value
                      }
                      
                      const isCurrentlySelected = selectedOption === opt.value

                      return (
                        <motion.div 
                          key={opt.value}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="relative"
                        >
                          <button
                            onClick={() => handleSelect(currentQuestion.id, opt.value)}
                            className={cn(
                              "p-3 md:p-4 border-2 rounded-xl text-left transition-all duration-300 w-full flex items-center group hover:scale-[1.02]",
                              isSelected || isCurrentlySelected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-lg"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
                            )}
                          >
                            <div className="text-xl md:text-2xl mr-3 md:mr-4 transition-transform duration-300 group-hover:scale-110">
                              {opt.icon}
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold text-gray-800 text-sm md:text-base">{opt.label}</p>
                              <p className="text-xs md:text-sm text-gray-500">{opt.description}</p>
                            </div>
                            {isMultiSelect ? (
                              <div className="ml-2">
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-in zoom-in duration-300" />
                                ) : (
                                  <Square className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                                )}
                              </div>
                            ) : (
                              (isSelected || isCurrentlySelected) && (
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500 animate-in zoom-in duration-300" />
                              )
                            )}
                          </button>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </CardContent>

                <CardFooter className="p-3 md:p-6 flex justify-between items-center bg-gray-50">
                  <Button
                    variant="ghost"
                    onClick={questionIndex > 0 ? handleBack : () => router.back()}
                    className="flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" /> Back
                  </Button>

                  <div className="flex gap-1 md:gap-2">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300",
                          index === questionIndex ? "bg-purple-500 w-4 md:w-6" : "bg-gray-300",
                          index < questionIndex && "bg-green-500",
                        )}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-sm md:text-base"
                    disabled={(() => {
                      const currentAnswer = answers[currentQuestion.id as keyof typeof answers]
                      if (currentQuestion.id === "motivation") {
                        return !Array.isArray(currentAnswer) || currentAnswer.length === 0
                      }
                      return !currentAnswer
                    })()}
                  >
                    {questionIndex < questions.length - 1 ? "Next" : "Continue"}
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </main> 
      
      <AvatarAssistant step={questionIndex + 1} pageType="personalise" />
    </div>
  )
}
