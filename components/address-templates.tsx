"use client"

import { Button } from "@/components/ui/button"
import { AddressInput } from "@/components/address-input"
import { Branding } from "@/lib/branding"
import Image from "next/image"
import { RefObject } from "react"

interface AddressTemplateProps {
  branding: Branding
  address: string
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: () => void
  mainInputRef: RefObject<HTMLInputElement | null>
  isLoading: boolean
  isGeocoding: boolean
  addressJustUpdated: boolean
  selectedLocation: google.maps.LatLng | null
  error: string | null
}

// Template 0: Default (Gradient & Bordered - matches solar Template1)
export const AddressTemplate0 = ({
  branding,
  address,
  handleAddressChange,
  handleSubmit,
  mainInputRef,
  isLoading,
  isGeocoding,
  addressJustUpdated,
  selectedLocation,
  error
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <Image
            src={branding.logo}
            alt={branding.name}
            width={80}
            height={40}
            className="h-16 sm:h-20 mx-auto mb-4 object-contain"
          />
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="text-green-600">80% on Your Utility Bills</span> With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">
                  under 60 seconds
                </span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label htmlFor="address-template0" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <AddressInput
                    id="address-template0"
                    ref={mainInputRef}
                    value={address}
                    onChange={handleAddressChange}
                    isGeocoding={isGeocoding}
                    addressJustUpdated={addressJustUpdated}
                    disabled={isLoading}
                    placeholder="Enter your Eircode or full address..."
                    className="h-14 sm:h-16 text-base sm:text-lg rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Eircode preferred for best results</p>
                </div>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  Get My Free Assessment →
                </Button>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <svg className="w-3 h-3 text-green-600 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>100% Private & Secure</span>
                </div>
              </form>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 mt-4 text-sm">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-500 mt-4 text-sm">
                Loading maps...
              </div>
            )}

            {isGeocoding && (
              <div className="text-center text-blue-600 mt-4 text-sm">
                🔍 Validating coordinates for accuracy...
              </div>
            )}

            <p className="text-center text-sm text-gray-600 font-medium mb-6">
              Includes a personalised solar plan + savings report (PDF)
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Image
                  src={branding.logo}
                  alt={branding.name}
                  width={24}
                  height={24}
                  className="h-6 w-auto flex-shrink-0 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900 text-xs">{branding.reviews?.rating || "5.0"}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">({branding.reviews?.count || "86"} reviews)</p>
                </div>
                <Image
                  src="/google-logo.png"
                  alt="Google"
                  width={60}
                  height={20}
                  className="h-4 w-auto flex-shrink-0 object-contain"
                />
              </div>
              <div className="flex-1 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Image
                  src="/images/seai-logo.png"
                  alt="SEAI Registered"
                  width={24}
                  height={24}
                  className="h-6 opacity-90 flex-shrink-0 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs">SEAI-Registered</p>
                  <p className="text-xs text-gray-600">Installer</p>
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

// Template 1: Clean Minimal (matches solar Template2)
export const AddressTemplate1 = ({ 
  branding, 
  address, 
  handleAddressChange, 
  handleSubmit, 
  mainInputRef, 
  isLoading, 
  isGeocoding, 
  addressJustUpdated, 
  error 
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Image
            src={branding.logo}
            alt={`${branding.name} Logo`}
            width={120}
            height={60}
            className="h-14 sm:h-18 mx-auto mb-6 object-contain"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="text-orange-600">80% on Your Utility Bills</span> With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">
                  under 60 seconds
                </span>
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label htmlFor="address-template1" className="block text-sm font-semibold text-gray-800 mb-3">
                  Enter Your Address
                </label>
                <AddressInput
                  id="address-template1"
                  ref={mainInputRef}
                  value={address}
                  onChange={handleAddressChange}
                  isGeocoding={isGeocoding}
                  addressJustUpdated={addressJustUpdated}
                  disabled={isLoading}
                  placeholder="Enter your Eircode or full address..."
                  className="h-16 text-lg rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-2">Eircode preferred for best results</p>
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                Get My Free Assessment →
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                  <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>100% Private & Secure</span>
                </div>
                <p className="text-sm text-gray-600">Includes personalised solar plan + savings report (PDF)</p>
              </div>
            </form>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 mt-4 text-sm">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-500 mt-4 text-sm">
                Loading maps...
              </div>
            )}

            {isGeocoding && (
              <div className="text-center text-blue-600 mt-4 text-sm">
                🔍 Validating address...
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Image src={branding.logo} alt={branding.name} width={20} height={20} className="h-5 w-auto object-contain" />
                  <span className="font-semibold">{branding.reviews?.rating || "5.0"} ⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-500">({branding.reviews?.count || "86"} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Image
                    src="/images/seai-logo.png"
                    alt="SEAI-Registered"
                    width={20}
                    height={20}
                    className="h-5 opacity-80 object-contain"
                  />
                  <span className="text-gray-600 font-medium">SEAI-Registered</span>
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

// Template 2: Bold Modern Dark (matches solar Template3)
export const AddressTemplate2 = ({ 
  branding, 
  address, 
  handleAddressChange, 
  handleSubmit, 
  mainInputRef, 
  isLoading, 
  isGeocoding, 
  addressJustUpdated, 
  error 
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-6">
          <Image
            src={branding.logo}
            alt={`${branding.name} Logo`}
            width={80}
            height={40}
            className="h-16 sm:h-20 mx-auto mb-4 brightness-0 invert object-contain"
          />
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Your Home Could Save{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  80%
                </span>{" "}
                on Your Utility Bills With Solar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get your personalised solar plan in{" "}
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-semibold">
                  under 60 seconds
                </span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border-2 border-emerald-200 mb-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <div>
                  <label htmlFor="address-template2" className="block text-lg font-bold text-gray-800 mb-3">
                    🏠 YOUR ADDRESS
                  </label>
                  <AddressInput
                    id="address-template2"
                    ref={mainInputRef}
                    value={address}
                    onChange={handleAddressChange}
                    isGeocoding={isGeocoding}
                    addressJustUpdated={addressJustUpdated}
                    disabled={isLoading}
                    placeholder="Enter your Eircode or full address..."
                    className="h-16 text-lg font-medium rounded-xl border-3 border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 shadow-lg bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full h-16 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold text-xl rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  GET FREE ASSESSMENT →
                </Button>

                <div className="flex items-center justify-center text-sm text-gray-600 font-medium">
                  <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>PRIVATE & SECURE • FREE PDF REPORT</span>
                </div>
              </form>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 mt-4">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-500 mt-4">
                Loading maps...
              </div>
            )}

            {isGeocoding && (
              <div className="text-center text-blue-600 mt-4">
                🔍 Processing address...
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Image src={branding.logo} alt={branding.name} width={24} height={24} className="h-6 w-auto object-contain" />
                  <span className="font-bold text-gray-900">{branding.reviews?.rating || "5.0"}</span>
                </div>
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-medium">{branding.reviews?.count || "86"} REVIEWS</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Image
                    src="/images/seai-logo.png"
                    alt="SEAI-Registered"
                    width={24}
                    height={24}
                    className="h-6 opacity-90 object-contain"
                  />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="font-bold text-gray-900 text-sm">SEAI-REGISTERED</p>
                <p className="text-xs text-gray-600 font-medium">INSTALLER</p>
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

// Template 3: Card-Based Purple (matches solar Template4)
export const AddressTemplate3 = ({ 
  branding, 
  address, 
  handleAddressChange, 
  handleSubmit, 
  mainInputRef, 
  isLoading, 
  isGeocoding, 
  addressJustUpdated, 
  error 
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-lg w-full space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center">
          <Image
            src={branding.logo}
            alt={`${branding.name} Logo`}
            width={80}
            height={40}
            className="h-14 mx-auto mb-4 object-contain"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Your Home Could Save{" "}
            <span className="text-purple-600">80% on Your Utility Bills</span> With Solar
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Get your personalised solar plan in{" "}
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold">under 60 seconds</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="address-template3" className="block text-sm font-semibold text-gray-800 mb-2">
                Property Address
              </label>
              <AddressInput
                id="address-template3"
                ref={mainInputRef}
                value={address}
                onChange={handleAddressChange}
                isGeocoding={isGeocoding}
                addressJustUpdated={addressJustUpdated}
                disabled={isLoading}
                placeholder="Enter your Eircode or full address..."
                className="h-14 text-base rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Eircode preferred for best results</p>
            </div>

            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base rounded-xl transition-all duration-200"
              disabled={isLoading}
            >
              Get My Free Assessment →
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>100% Private & Secure</span>
              </div>
              <p className="text-sm text-gray-600">Includes personalised solar plan + savings report</p>
            </div>
          </form>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 mt-4 text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500 mt-4 text-sm">
              Loading maps...
            </div>
          )}

          {isGeocoding && (
            <div className="text-center text-purple-600 mt-4 text-sm">
              🔍 Analyzing location...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Image src={branding.logo} alt={branding.name} width={20} height={20} className="h-5 w-auto object-contain" />
              <span className="font-bold text-gray-900 text-sm">{branding.reviews?.rating || "5.0"}</span>
            </div>
            <div className="flex text-yellow-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-gray-600">{branding.reviews?.count || "86"} Reviews</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Image
                src="/images/seai-logo.png"
                alt="SEAI-Registered"
                width={20}
                height={20}
                className="h-5 opacity-90 object-contain"
              />
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="font-bold text-gray-900 text-sm">SEAI-Registered</p>
            <p className="text-xs text-gray-600">Installer</p>
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

// Template 4: Centered Compact (matches solar Template5)
export const AddressTemplate4 = ({ 
  branding, 
  address, 
  handleAddressChange, 
  handleSubmit, 
  mainInputRef, 
  isLoading, 
  isGeocoding, 
  addressJustUpdated, 
  error 
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Image
            src={branding.logo}
            alt={branding.name}
            width={100}
            height={50}
            className="h-12 mx-auto mb-6 object-contain"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Your Home Could Save <span className="text-teal-600">80%</span> on Your Utility Bills
            With Solar
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Get your personalised solar plan in <span className="font-semibold text-teal-600">under 60 seconds</span>
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <AddressInput
              id="address-template4"
              ref={mainInputRef}
              value={address}
              onChange={handleAddressChange}
              isGeocoding={isGeocoding}
              addressJustUpdated={addressJustUpdated}
              disabled={isLoading}
              className="h-14 text-base rounded-lg border-2 border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
              placeholder="Enter your Eircode or full address..."
            />

            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all duration-200"
              disabled={isLoading}
            >
              Get Free Assessment
            </Button>
          </form>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500 text-sm">
              Loading maps...
            </div>
          )}

          {isGeocoding && (
            <div className="text-center text-blue-600 text-sm">
              🔍 Locating property...
            </div>
          )}

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Private & Secure • Free PDF Report</span>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Image src={branding.logo} alt={branding.name} width={16} height={16} className="h-4 w-auto object-contain" />
                <span className="font-semibold">{branding.reviews?.rating || "5.0"} ⭐</span>
                <span className="text-gray-500">({branding.reviews?.count || "86"})</span>
              </div>
              <div className="flex items-center space-x-1">
                <Image
                  src="/images/seai-logo.png"
                  alt="SEAI-Registered"
                  width={16}
                  height={16}
                  className="h-4 opacity-80 object-contain"
                />
                <span className="text-gray-600">SEAI-Registered</span>
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

// Template 5: Professional Business (additional template)
export const AddressTemplate5 = ({ 
  branding, 
  address, 
  handleAddressChange, 
  handleSubmit, 
  mainInputRef, 
  isLoading, 
  isGeocoding, 
  addressJustUpdated, 
  error 
}: AddressTemplateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src={branding.logo}
                alt={branding.name}
                width={50}
                height={50}
                className="h-12 object-contain bg-white rounded-lg p-2"
              />
              <h1 className="text-2xl font-bold">{branding.name}</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Professional Solar Solutions for Your Home
            </p>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Get Your Professional Solar Assessment
              </h2>
              <p className="text-gray-600">
                Complete solar analysis with detailed savings report
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div>
                <label htmlFor="address-template5" className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Address *
                </label>
                <AddressInput
                  id="address-template5"
                  ref={mainInputRef}
                  value={address}
                  onChange={handleAddressChange}
                  isGeocoding={isGeocoding}
                  addressJustUpdated={addressJustUpdated}
                  disabled={isLoading}
                  placeholder="Enter your Eircode or full address..."
                  className="h-13 text-base border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We recommend using your Eircode for the most accurate assessment
                </p>
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-13 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold text-base rounded-lg shadow-lg"
                disabled={isLoading}
              >
                Generate Professional Assessment
              </Button>
            </form>

            {error && (
              <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4 text-red-700 mt-4">
                <div className="font-medium">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-500 mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading mapping services...
              </div>
            )}

            {isGeocoding && (
              <div className="text-center text-blue-600 mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-pulse text-lg">🔍</div>
                  <span>Analyzing property coordinates...</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-gray-900">SEAI Certified</div>
                  <div className="text-gray-600 text-xs">Official Installer</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">€1,800 Grant</div>
                  <div className="text-gray-600 text-xs">We Handle Process</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{branding.reviews?.rating || "5.0"}★</div>
                  <div className="text-gray-600 text-xs">({branding.reviews?.count || "86"} Reviews)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-medium">Voltflo Technology</span>
          </p>
        </div>
      </div>
    </div>
  )
}