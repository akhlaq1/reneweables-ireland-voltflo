"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AddressInput } from "@/components/address-input"
import { Check, MapPin } from "lucide-react"

// Configuration object - easily interchangeable
const CONFIG = {
  companyLogo: "/jr-energy-logo.png",
  companyName: "JR Energy",
  reviewRating: "5.0",
  reviewCount: "86",
  certificationLogo: "/seai-logo.png",
  certificationName: "SEAI-Registered",
  certificationSubtext: "Installer",
  keyPoints: [],
  savingsPercentage: "80%",
  timeframe: "under 60 seconds",
  addressPlaceholder: "Enter your Eircode or full address...",
  addressHint: "Eircode preferred for best results",
}

// Template 1: Original Design (Gradient & Bordered)
const Template1 = () => {
  const [address, setAddress] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <img
            src={CONFIG.companyLogo || "/placeholder.svg"}
            alt="Company Logo"
            className="h-16 sm:h-20 mx-auto mb-4"
          />
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="text-green-600">{CONFIG.savingsPercentage} on Your Utility Bills</span> With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">
                  {CONFIG.timeframe}
                </span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="address-template1" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <AddressInput
                    id="address-template1"
                    ref={inputRef}
                    value={address}
                    onChange={handleAddressChange}
                    placeholder={CONFIG.addressPlaceholder}
                    className="h-14 sm:h-16 text-base sm:text-lg rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">{CONFIG.addressHint}</p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                >
                  Get My Free Assessment →
                </Button>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Check className="w-3 h-3 text-green-600 mr-1 flex-shrink-0" />
                  <span>100% Private & Secure</span>
                </div>
              </form>
            </div>

            <p className="text-center text-sm text-gray-600 font-medium mb-6">
              Includes a personalised solar plan + savings report (PDF)
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <img
                  src={CONFIG.companyLogo || "/placeholder.svg"}
                  alt="JR Energy"
                  className="h-6 w-auto flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900 text-xs">{CONFIG.reviewRating}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">({CONFIG.reviewCount} reviews)</p>
                </div>
                <svg className="h-4 w-auto flex-shrink-0" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#4285F4"
                    d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                  />
                </svg>
              </div>
              <div className="flex-1 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <img
                  src={CONFIG.certificationLogo || "/placeholder.svg"}
                  alt="SEAI Registered"
                  className="h-6 opacity-90 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs">{CONFIG.certificationName}</p>
                  <p className="text-xs text-gray-600">{CONFIG.certificationSubtext}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-500">Voltflo</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Template 2: Clean Minimal (SAME FONTS)
const Template2 = () => {
  const [address, setAddress] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <img
            src={CONFIG.companyLogo || "/placeholder.svg"}
            alt={`${CONFIG.companyName} Logo`}
            className="h-14 sm:h-18 mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="text-orange-600">{CONFIG.savingsPercentage} on Your Utility Bills</span> With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">
                  {CONFIG.timeframe}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="address-template2" className="block text-sm font-semibold text-gray-800 mb-3">
                  Enter Your Address
                </label>
                <AddressInput
                  id="address-template2"
                  ref={inputRef}
                  value={address}
                  onChange={handleAddressChange}
                  placeholder={CONFIG.addressPlaceholder}
                  className="h-16 text-lg rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-2">{CONFIG.addressHint}</p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-lg transition-all duration-200"
              >
                Get My Free Assessment →
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                  <Check className="w-3 h-3 text-green-600 mr-1" />
                  <span>100% Private & Secure</span>
                </div>
                <p className="text-sm text-gray-600">Includes personalised solar plan + savings report (PDF)</p>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <img src={CONFIG.companyLogo || "/placeholder.svg"} alt={CONFIG.companyName} className="h-5 w-auto" />
                  <span className="font-semibold">{CONFIG.reviewRating} ⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-500">({CONFIG.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={CONFIG.certificationLogo || "/placeholder.svg"}
                    alt={CONFIG.certificationName}
                    className="h-5 opacity-80"
                  />
                  <span className="text-gray-600 font-medium">{CONFIG.certificationName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-500">Voltflo</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Template 3: Bold Modern (SAME FONTS)
const Template3 = () => {
  const [address, setAddress] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <img
            src={CONFIG.companyLogo || "/placeholder.svg"}
            alt={`${CONFIG.companyName} Logo`}
            className="h-16 sm:h-20 mx-auto mb-4 brightness-0 invert"
          />
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {CONFIG.savingsPercentage}
                </span>{" "}
                on Your Utility Bills With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-semibold">
                  {CONFIG.timeframe}
                </span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border-2 border-emerald-200 mb-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="address-template3" className="block text-lg font-bold text-gray-800 mb-3">
                    🏠 YOUR ADDRESS
                  </label>
                  <AddressInput
                    id="address-template3"
                    ref={inputRef}
                    value={address}
                    onChange={handleAddressChange}
                    placeholder={CONFIG.addressPlaceholder}
                    className="h-16 text-lg font-medium rounded-xl border-3 border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 shadow-lg bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold text-xl rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  GET FREE ASSESSMENT →
                </Button>

                <div className="flex items-center justify-center text-sm text-gray-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 mr-2" />
                  <span>PRIVATE & SECURE • FREE PDF REPORT</span>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <img src={CONFIG.companyLogo || "/placeholder.svg"} alt={CONFIG.companyName} className="h-6 w-auto" />
                  <span className="font-bold text-gray-900">{CONFIG.reviewRating}</span>
                </div>
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-medium">{CONFIG.reviewCount} REVIEWS</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={CONFIG.certificationLogo || "/placeholder.svg"}
                    alt={CONFIG.certificationName}
                    className="h-6 opacity-90"
                  />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="font-bold text-gray-900 text-sm">{CONFIG.certificationName.toUpperCase()}</p>
                <p className="text-xs text-gray-600 font-medium">{CONFIG.certificationSubtext.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-300">
            Powered by <span className="font-medium text-white">Voltflo</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Template 4: Card-Based (SAME FONTS)
const Template4 = () => {
  const [address, setAddress] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-lg w-full space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center">
          <img
            src={CONFIG.companyLogo || "/placeholder.svg"}
            alt={`${CONFIG.companyName} Logo`}
            className="h-14 mx-auto mb-4"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Your Home Could Save{" "}
            <span className="text-purple-600">{CONFIG.savingsPercentage} on Your Utility Bills</span> With Solar
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Get your personalised solar plan in{" "}
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold">{CONFIG.timeframe}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="address-template4" className="block text-sm font-semibold text-gray-800 mb-2">
                Property Address
              </label>
              <AddressInput
                id="address-template4"
                ref={inputRef}
                value={address}
                onChange={handleAddressChange}
                placeholder={CONFIG.addressPlaceholder}
                className="h-14 text-base rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">{CONFIG.addressHint}</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base rounded-xl transition-all duration-200"
            >
              Get My Free Assessment →
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                <Check className="w-3 h-3 text-green-600 mr-1" />
                <span>100% Private & Secure</span>
              </div>
              <p className="text-sm text-gray-600">Includes personalised solar plan + savings report</p>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <img src={CONFIG.companyLogo || "/placeholder.svg"} alt={CONFIG.companyName} className="h-5 w-auto" />
              <span className="font-bold text-gray-900 text-sm">{CONFIG.reviewRating}</span>
            </div>
            <div className="flex text-yellow-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-gray-600">{CONFIG.reviewCount} Reviews</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={CONFIG.certificationLogo || "/placeholder.svg"}
                alt={CONFIG.certificationName}
                className="h-5 opacity-90"
              />
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="font-bold text-gray-900 text-sm">{CONFIG.certificationName}</p>
            <p className="text-xs text-gray-600">{CONFIG.certificationSubtext}</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-500">Voltflo</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Template 5: Centered Compact (SAME FONTS)
const Template5 = () => {
  const [address, setAddress] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src={CONFIG.companyLogo || "/placeholder.svg"}
            alt={`${CONFIG.companyName} Logo`}
            className="h-12 mx-auto mb-6"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Your Home Could Save <span className="text-teal-600">{CONFIG.savingsPercentage}</span> on Your Utility Bills
            With Solar
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Get your personalised solar plan in <span className="font-semibold text-teal-600">{CONFIG.timeframe}</span>
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AddressInput
              id="address-template5"
              ref={inputRef}
              value={address}
              onChange={handleAddressChange}
              placeholder={CONFIG.addressPlaceholder}
              className="h-14 text-base rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
            />

            <Button
              type="submit"
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Get Free Assessment
            </Button>
          </form>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Check className="w-3 h-3 text-green-600 mr-1" />
              <span>Private & Secure • Free PDF Report</span>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <img src={CONFIG.companyLogo || "/placeholder.svg"} alt={CONFIG.companyName} className="h-4 w-auto" />
                <span className="font-semibold">{CONFIG.reviewRating} ⭐</span>
                <span className="text-gray-500">({CONFIG.reviewCount})</span>
              </div>
              <div className="flex items-center space-x-1">
                <img
                  src={CONFIG.certificationLogo || "/placeholder.svg"}
                  alt={CONFIG.certificationName}
                  className="h-4 opacity-80"
                />
                <span className="text-gray-600">{CONFIG.certificationName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-500">Voltflo</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SolarTemplates() {
  const [activeTemplate, setActiveTemplate] = useState(1)

  const templates = [
    { id: 1, name: "Gradient & Bordered", component: Template1 },
    { id: 2, name: "Clean Minimal", component: Template2 },
    { id: 3, name: "Bold Modern", component: Template3 },
    { id: 4, name: "Card-Based", component: Template4 },
    { id: 5, name: "Centered Compact", component: Template5 },
  ]

  const ActiveComponent = templates.find((t) => t.id === activeTemplate)?.component || Template1

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setActiveTemplate(template.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTemplate === template.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  V{template.id}: {template.name}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 ml-4">
              <span className="font-medium">Current:</span> {CONFIG.companyName} • {CONFIG.reviewRating}★ (
              {CONFIG.reviewCount}) • {CONFIG.certificationName}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20">
        <ActiveComponent />
      </div>
    </div>
  )
}
