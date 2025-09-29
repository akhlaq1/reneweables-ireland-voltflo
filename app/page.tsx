"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Building, Home, HomeIcon as House, HelpCircle, CheckCircle, Car, ThermometerSnowflake, Droplets, Info, X, TrendingUp, Settings, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getBranding } from "@/lib/branding"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { AppHeader } from "@/components/app-header"
import { setAppNavigation } from "@/lib/navigation-tracker"
import { ProgressBars } from "@/components/progress-bars"
import { 
  AddressTemplate0, 
  AddressTemplate1, 
  AddressTemplate2, 
  AddressTemplate3, 
  AddressTemplate4, 
  AddressTemplate5 
} from "@/components/address-templates"

const ProgressStep = ({ icon: Icon, label, isActive = false }: { icon: any; label: string; isActive?: boolean }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mb-1 ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
        }`}
    >
      {isActive ? <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />}
    </div>
    <span className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>{label}</span>
  </div>
)

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

// Reusable Card Component for Mobile
interface UsageCardProps {
  id: string
  value: string
  title: string
  icon: React.ReactNode
  description: string
  monthlyEstimate: string
  isSelected: boolean
  onSelect: (value: string) => void
  disabled?: boolean
  onClick?: () => void
  hoverHelp?: string
}

function UsageCard({
  id,
  value,
  title,
  icon,
  description,
  monthlyEstimate,
  isSelected,
  disabled,
  onClick,
  hoverHelp,
}: UsageCardProps) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "relative flex flex-col items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-3 cursor-pointer transition-all duration-300 ease-out",
        "hover:border-blue-300 hover:shadow-md active:scale-[0.98]",
        "min-h-[110px] text-left",
        isSelected && "border-blue-500 ring-2 ring-blue-100 shadow-lg bg-blue-50/50",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onClick={onClick}
    >
      <RadioGroupItem value={value} id={id} className="peer sr-only" disabled={disabled} />

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
          <CheckCircle className="h-3 w-3 text-white" />
        </div>
      )}

      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-lg">{icon}</div>
      </div>

      <div className="flex-1 w-full">
        <CardTitle className="text-xs font-bold mb-1 text-gray-900 leading-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-600 mb-2 leading-tight">
          {description}
        </CardDescription>
        {monthlyEstimate && (
          <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
            {monthlyEstimate}
          </div>
        )}
      </div>
    </Label>
  )
}



// Manual Entry Modal Component for Mobile
interface ManualEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: string) => void
}

function ManualEntryModal({ isOpen, onClose, onSubmit }: ManualEntryModalProps) {
  const [amount, setAmount] = useState<string>("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Reset state when modal opens
      setAmount("")
      setIsFocused(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (amount && amount.trim()) {
      onSubmit(amount.trim())
      setAmount("")
      setIsFocused(false)
      onClose()
    }
  }

  const handleCancel = () => {
    setAmount("")
    setIsFocused(false)
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and prevent negative values
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setAmount(value)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter key
    if (e.key === 'Enter' && amount && amount.trim()) {
      handleSubmit()
    }
    // Close on Escape key
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm mx-auto rounded-lg p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            {/* <X className="h-4 w-4" /> */}
          </button>
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-bold text-white">Enter Your Bill</DialogTitle>
            <DialogDescription className="text-blue-100 text-sm mt-1">
              Enter your monthly cost
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold text-gray-900">
              Monthly cost (€)
            </Label>
            <Input
              ref={inputRef}
              id="amount"
              type="number"
              placeholder={!isFocused && !amount ? "eg. 150" : ""}
              value={amount}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-10 text-sm rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-3 pt-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-10 rounded-lg text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || !amount.trim()}
            className="flex-1 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm"
          >
            Use Amount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AddressPage() {
  const branding = getBranding()
  const router = useRouter()
  const [address, setAddress] = useState("")

  // Set navigation marker for this app session
  useEffect(() => {
    setAppNavigation()
  }, [])
  
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPlace, setPendingPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const [showLocationConfirm, setShowLocationConfirm] = useState(false)
  const [showBillSelection, setShowBillSelection] = useState(false)
  const [selectedBillAmount, setSelectedBillAmount] = useState<number | null>(null)

  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualAmount, setManualAmount] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)
  const [hasUsedEstimator, setHasUsedEstimator] = useState(false)
  const [estimatorData, setEstimatorData] = useState({
    homeType: '',
    bedrooms: '',
    hasEV: false,
    hasHeatPump: false,
    hasElectricShower: false
  })
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null) // For map view input
  const mainAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null) // For main landing page input
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const inputRef = useRef<HTMLInputElement>(null) // For map view input
  const mainInputRef = useRef<HTMLInputElement>(null) // For main landing page input
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [showLocationTooltip, setShowLocationTooltip] = useState(false)
  const [addressJustUpdated, setAddressJustUpdated] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Mobile-specific state for electricity usage
  const [showManualModal, setShowManualModal] = useState<boolean>(false)
  const [customEstimate, setCustomEstimate] = useState<string>("")

  // Bill range options with their median values
  const billOptions = [
    { label: "€100 – €200", value: 150 },
    { label: "€200 – €300", value: 250 },
    { label: "€300 – €400", value: 350 },
    { label: "€400 – €500", value: 450 },
    { label: "€500 – €600", value: 550 },
    { label: "Over €600", value: 700 }
  ]

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoading(false)
      initializeGoogleMaps()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    if (existingScript) {

      // Wait for existing script to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps)
          setIsLoading(false)
          initializeGoogleMaps()
        }
      }, 100)

      // Cleanup interval if component unmounts
      return () => {
        clearInterval(checkGoogleMaps)
      }
    }

    // Define the callback function
    window.initMap = () => {
      setIsLoading(false)
      initializeGoogleMaps()
    }

    // Load Google Maps JavaScript API
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true
    script.onerror = (error) => {
      setError("Failed to load Google Maps. Please check your internet connection.")
      setIsLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      // More robust cleanup
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
        delete (window as any).initMap
      } catch (e) {
        // Script cleanup error (this is usually fine)
      }
    }
  }, [])

  // Re-initialize autocomplete when Google Maps is loaded and inputs become available
  useEffect(() => {
    if (window.google && window.google.maps && !isLoading) {
      // Small delay to ensure DOM elements are ready
      const timeoutId = setTimeout(() => {
        initializeGoogleMaps()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, isMapVisible, showBillSelection])

  useEffect(() => {
    console.log('Map useEffect triggered:', { 
      isMapVisible, 
      hasPendingPlace: !!pendingPlace?.geometry?.location,
      pendingPlaceCoords: pendingPlace?.geometry?.location ? {
        lat: pendingPlace.geometry.location.lat(),
        lng: pendingPlace.geometry.location.lng()
      } : null
    })
    
    if (!isMapVisible || !pendingPlace?.geometry?.location) return

    const mapElement = document.getElementById("map")

    if (!mapElement) {
      console.log('Map element not found in DOM')
      return
    }

    // Initialize or update map
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapElement, {
        center: pendingPlace.geometry.location,
        zoom: 19,
        mapTypeId: "satellite",
        tilt: 0,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      } as any)

      // Add center marker with custom green pin icon
      const customPinIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3"/>
              </filter>
            </defs>
            <!-- Outer white circle with shadow (w-8 h-8 = 32px) -->
            <circle cx="16" cy="16" r="16" fill="#ffffff" filter="url(#shadow)"/>
            <!-- Inner green circle (w-6 h-6 = 24px) -->
            <circle cx="16" cy="16" r="12" fill="#16a34a"/>
            <!-- White center dot (w-2.5 h-2.5 = 10px) -->
            <circle cx="16" cy="16" r="5" fill="#ffffff"/>
            <!-- Vertical stem (w-0.5 h-4 = 4px wide, 16px tall) -->
            <rect x="15" y="32" width="3" height="16" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new (window.google.maps as any).Size(32, 48),
        anchor: new (window.google.maps as any).Point(16, 48)
      }

      markerRef.current = new window.google.maps.Marker({
        position: (mapRef.current as any).getCenter(),
        map: mapRef.current,
        draggable: false,
        icon: customPinIcon
      } as any)

      // Smooth marker updates during map movement
      let animationFrameId: number | null = null

      if (mapRef.current) {
        // Use google.maps.event.addListener instead of direct method call
        window.google.maps.event.addListener(mapRef.current, "center_changed", () => {
          // Cancel previous animation frame to prevent stacking
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }

          // Use requestAnimationFrame for smooth 60fps updates
          animationFrameId = requestAnimationFrame(() => {
            const newCenter = (mapRef.current as any)?.getCenter()
            if (newCenter && markerRef.current) {
              markerRef.current.setPosition(newCenter)
            }
          })
        })

        // Update state and reverse geocode when dragging stops for better performance
        window.google.maps.event.addListener(mapRef.current, "dragend", async () => {
          const newCenter = (mapRef.current as any)?.getCenter()
          if (newCenter) {
            setSelectedLocation(newCenter)

            // Show loading state while reverse geocoding
            setIsGeocoding(true)

            try {
              // Reverse geocode to get address for new location
              setDebugInfo("Trying primary geocoding...")
              const newAddress = await reverseGeocode(newCenter)
              if (newAddress && !newAddress.startsWith('📍')) {
                // We got a real address
                setAddress(newAddress)
                setAddressJustUpdated(true)
                setDebugInfo("✅ Primary geocoding successful")
                setTimeout(() => {
                  setAddressJustUpdated(false)
                  setDebugInfo("")
                }, 2000)
              } else {
                // Try alternative geocoding method
                setDebugInfo("Primary failed, trying alternative...")
                console.log('Primary geocoding returned coordinates, trying alternative method...')
                const alternativeAddress = await alternativeReverseGeocode(newCenter)
                if (alternativeAddress && !alternativeAddress.startsWith('📍')) {
                  setAddress(alternativeAddress)
                  setAddressJustUpdated(true)
                  setDebugInfo("✅ Alternative geocoding successful")
                  setTimeout(() => {
                    setAddressJustUpdated(false)
                    setDebugInfo("")
                  }, 2000)
                } else {
                  // Try one more time to get at least a general location
                  setDebugInfo("Alternative failed, trying general location...")
                  console.log('Alternative geocoding failed, trying general location...')
                  const generalLocation = await getGeneralLocation(newCenter)
                  setAddress(generalLocation)
                  setAddressJustUpdated(true)
                  setDebugInfo("ℹ️ Using general location")
                  setTimeout(() => {
                    setAddressJustUpdated(false)
                    setDebugInfo("")
                  }, 3000)
                }
              }
            } catch (error) {
              console.warn('Reverse geocoding failed:', error)
              // Fallback to coordinates
              const coordString = `📍 ${newCenter.lat().toFixed(6)}, ${newCenter.lng().toFixed(6)}`
              setAddress(coordString)
            } finally {
              setIsGeocoding(false)
            }
          }
        })

        // Hide tooltip when user starts interacting with map
        window.google.maps.event.addListener(mapRef.current, "dragstart", () => {
          if (showLocationTooltip) {
            setShowLocationTooltip(false)
          }
        })

        // Also update on zoom end
        window.google.maps.event.addListener(mapRef.current, "zoom_changed", () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }

          animationFrameId = requestAnimationFrame(() => {
            const newCenter = (mapRef.current as any)?.getCenter()
            if (newCenter && markerRef.current) {
              markerRef.current.setPosition(newCenter)
              setSelectedLocation(newCenter)
              // Note: We don't reverse geocode on zoom as it would be too frequent
              // Only on dragend when user intentionally moves the pin
            }
          })
        })
      }
    } else {
      console.log('Updating existing map with new location:', {
        lat: pendingPlace.geometry.location.lat(),
        lng: pendingPlace.geometry.location.lng()
      })
      
      // Update map center for new address
      mapRef.current.setCenter(pendingPlace.geometry.location)
      
      // Update marker position to match new center
      if (markerRef.current) {
        markerRef.current.setPosition(pendingPlace.geometry.location)
        console.log('Marker position updated')
      } else {
        console.log('No marker ref available')
      }
      
      // Update selected location state
      setSelectedLocation(pendingPlace.geometry.location)
      console.log('Selected location state updated')
    }
  }, [isMapVisible, pendingPlace?.geometry?.location?.lat(), pendingPlace?.geometry?.location?.lng()])

  const initializeGoogleMaps = () => {
    try {
      if (!window.google) return

      // Initialize autocomplete for map view input (if it exists)
      if (inputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "ie" }, // Restrict to Ireland
          fields: ["address_components", "formatted_address", "geometry", "name", "place_id", "types"],
          types: ["geocode"] // Change from "address" to "geocode" for better precision
        })

        // Handle place selection for map view input
        autocompleteRef.current.addListener("place_changed", async () => {
          const place = autocompleteRef.current?.getPlace()
          if (!place?.geometry?.location) {
            return
          }

          // Use the enhanced Eircode validation for better accuracy
          const validatedLocation = await findEircodeAndValidateCoordinates(place)

          const finalLocation = validatedLocation || place.geometry.location

          // Find the postal code (Eircode) from address components
          const postalCode = place.address_components?.find(
            component => component.types.includes("postal_code")
          )?.long_name

          // Format the address with Eircode if available
          const formattedAddress = postalCode
            ? `${place.formatted_address} (${postalCode})`
            : place.formatted_address

          setSelectedLocation(finalLocation)
          setAddress(formattedAddress || "")
          setAddressJustUpdated(true)
          setPendingPlace({ ...place, geometry: { ...place.geometry, location: finalLocation } })
          setIsMapVisible(true)
          
          // Clear the "just updated" state after a brief moment
          setTimeout(() => setAddressJustUpdated(false), 2000)
        })
      }

      // Initialize autocomplete for main landing page input (if it exists)
      if (mainInputRef.current && !mainAutocompleteRef.current) {
        mainAutocompleteRef.current = new window.google.maps.places.Autocomplete(mainInputRef.current, {
          componentRestrictions: { country: "ie" }, // Restrict to Ireland
          fields: ["address_components", "formatted_address", "geometry", "name", "place_id", "types"],
          types: ["geocode"] // Change from "address" to "geocode" for better precision
        })

        // Handle place selection for main input
        mainAutocompleteRef.current.addListener("place_changed", async () => {
          const place = mainAutocompleteRef.current?.getPlace()
          if (!place?.geometry?.location) {
            return
          }

          // Use the enhanced Eircode validation for better accuracy
          const validatedLocation = await findEircodeAndValidateCoordinates(place)

          const finalLocation = validatedLocation || place.geometry.location

          // Find the postal code (Eircode) from address components
          const postalCode = place.address_components?.find(
            component => component.types.includes("postal_code")
          )?.long_name

          // Format the address with Eircode if available
          const formattedAddress = postalCode
            ? `${place.formatted_address} (${postalCode})`
            : place.formatted_address

          setSelectedLocation(finalLocation)
          setAddress(formattedAddress || "")
          setAddressJustUpdated(true)
          setPendingPlace({ ...place, geometry: { ...place.geometry, location: finalLocation } })
          setIsMapVisible(true)
          
          // Clear the "just updated" state after a brief moment
          setTimeout(() => setAddressJustUpdated(false), 2000)
        })
      }
    } catch (err) {
      setError("Failed to initialize Google Maps. Please try refreshing the page.")
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
    // Hide tooltip when user starts editing address
    if (showLocationTooltip) {
      setShowLocationTooltip(false)
    }
  }

  const handleContinue = () => {
    if (selectedLocation) {
      // Clean up any existing street view data
      localStorage.removeItem("streetViewUrl")

      // Store the selected location in localStorage
      localStorage.setItem("selectedLocation", JSON.stringify({
        lat: selectedLocation.lat(),
        lng: selectedLocation.lng(),
        address: address
      }))

      // Show bill selection instead of navigating to loading
      setShowBillSelection(true)
    }
  }

  const handleBillSelection = async (billValue: number) => {
    // Immediate visual feedback
    setIsNavigating(true)
    setSelectedBillAmount(billValue)

    // Use requestAnimationFrame to ensure visual feedback renders immediately
    requestAnimationFrame(async () => {
      try {
        // Optimize localStorage operations
        const existingData = localStorage.getItem("personalise_answers")
        const personaliseAnswers = existingData ? JSON.parse(existingData) : {}
        personaliseAnswers.billAmount = billValue
        
        // Store all estimator data if available
        if (estimatorData.homeType) {
          personaliseAnswers.homeType = estimatorData.homeType
        }
        if (estimatorData.bedrooms) {
          personaliseAnswers.bedrooms = estimatorData.bedrooms
        }
        if (estimatorData.hasEV !== undefined) {
          personaliseAnswers.hasEV = estimatorData.hasEV
        }
        if (estimatorData.hasHeatPump !== undefined) {
          personaliseAnswers.hasHeatPump = estimatorData.hasHeatPump
        }
        if (estimatorData.hasElectricShower !== undefined) {
          personaliseAnswers.hasElectricShower = estimatorData.hasElectricShower
        }
        
        localStorage.setItem("personalise_answers", JSON.stringify(personaliseAnswers))

        // Navigate to loading page
        await router.push("/loading")
      } catch (error) {
        setIsNavigating(false)
      }
    })
  }



  const estimatedUsage = useMemo(() => {
    // Only calculate if we have the required fields
    if (!estimatorData.homeType || !estimatorData.bedrooms) {
      return { category: '', amount: 0 }
    }

    let baseValue = 0

    // Base value based on home type and bedroom count
    const homeTypeLower = estimatorData.homeType.toLowerCase()
    const bedrooms = estimatorData.bedrooms

    if (homeTypeLower === 'apartment' || homeTypeLower === 'terraced') {
      // Terraced / Apartment pricing
      switch (bedrooms) {
        case '1':
          baseValue = 105
          break
        case '2':
          baseValue = 125
          break
        case '3':
          baseValue = 140
          break
        case '4':
          baseValue = 140 // Use 3-bed price as default for higher bedrooms
          break
        case '5':
        case '5+':
          baseValue = 140 // Use 3-bed price as default for higher bedrooms
          break
        default:
          baseValue = 140 // Default to 3-bed price
      }
    } else if (homeTypeLower === 'semi-detached') {
      // Semi-detached pricing
      switch (bedrooms) {
        case '1':
          baseValue = 150 // Use 3-bed price for lower bedrooms
          break
        case '2':
          baseValue = 150 // Use 3-bed price for lower bedrooms
          break
        case '3':
          baseValue = 150
          break
        case '4':
          baseValue = 170
          break
        case '5':
        case '5+':
          baseValue = 190
          break
        default:
          baseValue = 150 // Default to 3-bed price
      }
    } else if (homeTypeLower === 'detached') {
      // Detached pricing
      switch (bedrooms) {
        case '1':
          baseValue = 160 // Use 3-bed price for lower bedrooms
          break
        case '2':
          baseValue = 160 // Use 3-bed price for lower bedrooms
          break
        case '3':
          baseValue = 160
          break
        case '4':
          baseValue = 180
          break
        case '5':
        case '5+':
          baseValue = 200
          break
        default:
          baseValue = 160 // Default to 3-bed price
      }
    } else {
      // Default fallback
      baseValue = 140
    }

    // Add for special features
    if (estimatorData.hasEV) baseValue += 60
    if (estimatorData.hasHeatPump) baseValue += 80
    if (estimatorData.hasElectricShower) baseValue += 15

    // Categorize usage
    let category = ''
    if (baseValue < 140) {
      category = 'Low'
    } else if (baseValue >= 140 && baseValue <= 200) {
      category = 'Average'
    } else {
      category = 'High'
    }

    return { category, amount: baseValue }
  }, [estimatorData])

  const handleUseEstimate = () => {
    setHasUsedEstimator(true)
    handleBillSelection(estimatedUsage.amount)
  }

  const handleManualEntry = (amount: string) => {
    const billValue = parseInt(amount)
    if (billValue && billValue > 0) {
      handleBillSelection(billValue)
    }
  }

  const handleManualEntryMobile = (amount: string) => {
    setCustomEstimate(`€${amount}/month`)
    const billValue = parseInt(amount)
    if (billValue && billValue > 0) {
      handleBillSelection(billValue)
    }
  }

  // Helper function to geocode using Eircode for maximum precision
  const geocodeWithEircode = async (eircode: string, fallbackAddress: string): Promise<google.maps.LatLng | null> => {
    const geocoder = new (window.google.maps as any).Geocoder()

    return new Promise<google.maps.LatLng | null>((resolve) => {
      // Try geocoding with Eircode first
      geocoder.geocode(
        {
          address: eircode,
          componentRestrictions: { country: "ie" }
        },
        (results: any[], status: string) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            resolve(results[0].geometry.location)
          } else {
            // Fallback to full address geocoding
            geocoder.geocode(
              {
                address: fallbackAddress,
                componentRestrictions: { country: "ie" }
              },
              (fallbackResults: any[], fallbackStatus: string) => {
                if (fallbackStatus === "OK" && fallbackResults?.[0]?.geometry?.location) {
                  resolve(fallbackResults[0].geometry.location)
                } else {
                  resolve(null)
                }
              }
            )
          }
        }
      )
    })
  }

  // Enhanced reverse geocoding function to get specific address from coordinates
  const reverseGeocode = async (location: google.maps.LatLng) => {
    if (!window.google || !location) {
      return null
    }

    try {
      const geocoder = new (window.google.maps as any).Geocoder()

      return new Promise<string | null>((resolve) => {
        geocoder.geocode(
          {
            location: location,
            componentRestrictions: { country: "ie" }
          },
          (results: any[], status: string) => {
            console.log('Reverse geocoding status:', status)
            console.log('Reverse geocoding results:', results)

            if (status === "OK" && results?.length > 0) {

              // Priority order for result types (most specific first)
              const preferredTypes = [
                'street_address',
                'premise',
                'subpremise',
                'route',
                'intersection',
                'plus_code',
                'neighborhood',
                'sublocality_level_1',
                'sublocality',
                'locality',
                'administrative_area_level_2',
                'administrative_area_level_1',
                'political' // Add political as it's common in Ireland
              ]

              // More lenient filtering - only filter out pure country results
              const filteredResults = results.filter((result: any) => {
                const isCountryOnly = result.types.includes('country') && result.types.length <= 2
                const isIrelandOnly = result.formatted_address === "Ireland" ||
                  result.formatted_address.toLowerCase() === "ireland"
                // Also filter out very generic results
                const isTooGeneric = result.formatted_address?.length < 10 &&
                  !result.types.includes('street_address') &&
                  !result.types.includes('premise')
                return !isCountryOnly && !isIrelandOnly && !isTooGeneric
              })

              console.log('Filtered results:', filteredResults)

              if (filteredResults.length === 0) {
                // Return coordinates as fallback
                const coordString = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
                console.log('No valid results, returning coordinates:', coordString)
                resolve(coordString)
                return
              }

              // First, try to find a result with an Eircode (most accurate)
              let bestResult = filteredResults.find((result: any) => {
                const hasEircode = result.address_components?.some(
                  (component: any) => component.types.includes("postal_code")
                )
                return hasEircode
              })

              // If no result with Eircode, find the most specific result
              if (!bestResult) {
                for (const preferredType of preferredTypes) {
                  bestResult = filteredResults.find((result: any) =>
                    result.types.includes(preferredType)
                  )
                  if (bestResult) {
                    break
                  }
                }
              }

              // Fallback to first filtered result (more lenient)
              if (!bestResult) {
                bestResult = filteredResults[0]
              }

              console.log('Best result selected:', bestResult)

              const foundEircode = bestResult.address_components?.find(
                (component: any) => component.types.includes("postal_code")
              )?.long_name

              // Format address with Eircode if available
              let formattedAddress = foundEircode
                ? `${bestResult.formatted_address}`
                : bestResult.formatted_address

              // Only fallback to coordinates if we really have nothing useful
              if (!formattedAddress ||
                formattedAddress === "Ireland" ||
                formattedAddress.toLowerCase() === "ireland") {
                formattedAddress = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
              }

              console.log('Final formatted address:', formattedAddress)
              resolve(formattedAddress)
            } else {
              console.log('Geocoding failed with status:', status)
              // Return coordinates as fallback if geocoding fails
              const coordString = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
              resolve(coordString)
            }
          }
        )
      })
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Return coordinates as fallback on error
      const coordString = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
      return coordString
    }
  }

  // Alternative reverse geocoding method with different parameters
  const alternativeReverseGeocode = async (location: google.maps.LatLng) => {
    if (!window.google || !location) {
      return null
    }

    try {
      const geocoder = new (window.google.maps as any).Geocoder()

      return new Promise<string | null>((resolve) => {
        // Try with broader search (remove country restriction)
        geocoder.geocode(
          {
            location: location
            // No component restrictions to get broader results
          },
          (results: any[], status: string) => {
            console.log('Alternative reverse geocoding status:', status)
            console.log('Alternative reverse geocoding results:', results)

            if (status === "OK" && results?.length > 0) {
              // Look for any result that contains Ireland or Irish addresses
              const irishResults = results.filter((result: any) => {
                const address = result.formatted_address?.toLowerCase() || ''
                return address.includes('ireland') ||
                  address.includes('eire') ||
                  result.address_components?.some((comp: any) =>
                    comp.types.includes('country') && comp.short_name === 'IE'
                  )
              })

              console.log('Irish results:', irishResults)

              if (irishResults.length > 0) {
                // Find the most specific Irish result
                let bestResult = irishResults.find((result: any) =>
                  result.types.includes('street_address') ||
                  result.types.includes('premise') ||
                  result.types.includes('route')
                )

                if (!bestResult) {
                  bestResult = irishResults.find((result: any) =>
                    result.types.includes('locality') ||
                    result.types.includes('sublocality')
                  )
                }

                if (!bestResult) {
                  bestResult = irishResults[0]
                }

                console.log('Alternative best result:', bestResult)

                if (bestResult && bestResult.formatted_address) {
                  resolve(bestResult.formatted_address)
                  return
                }
              }
            }

            // If still no good result, return null to fallback to coordinates
            resolve(null)
          }
        )
      })
    } catch (error) {
      console.error('Alternative reverse geocoding error:', error)
      return null
    }
  }

  // Get general location (city/county) as final fallback
  const getGeneralLocation = async (location: google.maps.LatLng) => {
    if (!window.google || !location) {
      return `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
    }

    try {
      const geocoder = new (window.google.maps as any).Geocoder()

      return new Promise<string>((resolve) => {
        geocoder.geocode(
          {
            location: location,
            componentRestrictions: { country: "ie" }
          },
          (results: any[], status: string) => {
            console.log('General location geocoding status:', status)

            if (status === "OK" && results?.length > 0) {
              // Look for locality, administrative areas, or any descriptive location
              const generalResult = results.find((result: any) =>
                result.types.includes('locality') ||
                result.types.includes('administrative_area_level_1') ||
                result.types.includes('administrative_area_level_2') ||
                result.types.includes('sublocality')
              )

              if (generalResult && generalResult.formatted_address) {
                console.log('General location found:', generalResult.formatted_address)
                resolve(`Near ${generalResult.formatted_address}`)
                return
              }

              // If we have any result at all, use it
              if (results[0] && results[0].formatted_address &&
                results[0].formatted_address !== "Ireland") {
                console.log('Using first available result:', results[0].formatted_address)
                resolve(`Near ${results[0].formatted_address}`)
                return
              }
            }

            // Final fallback to coordinates
            const coordString = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
            console.log('No general location found, using coordinates:', coordString)
            resolve(coordString)
          }
        )
      })
    } catch (error) {
      console.error('General location geocoding error:', error)
      return `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
    }
  }

  // Enhanced Eircode validation for better coordinate accuracy
  const findEircodeAndValidateCoordinates = async (place: google.maps.places.PlaceResult) => {
    if (!window.google || !place.formatted_address || !place.geometry?.location) {
      return place.geometry?.location || null
    }

    try {
      setIsGeocoding(true)

      // Check if place already has Eircode
      const existingEircode = place.address_components?.find(
        component => component.types.includes("postal_code")
      )?.long_name

      const geocoder = new (window.google.maps as any).Geocoder()

      // Step 1: If no Eircode, try to find one by geocoding the address
      if (!existingEircode) {

        return new Promise<google.maps.LatLng | null>((resolve) => {
          geocoder.geocode(
            {
              address: place.formatted_address,
              componentRestrictions: { country: "ie" }
            },
            async (results: any[], status: string) => {
              if (status === "OK" && results?.[0]) {
                const geocodedResult = results[0]
                const foundEircode = geocodedResult.address_components?.find(
                  (component: any) => component.types.includes("postal_code")
                )?.long_name

                if (foundEircode && typeof foundEircode === 'string') {
                  // Step 2: Now use the Eircode for precise coordinate lookup
                  const preciseLocation = await geocodeWithEircode(foundEircode, place.formatted_address || '')

                  // Update the address with Eircode for display
                  const formattedAddressWithEircode = `${place.formatted_address} (${foundEircode})`
                  setAddress(formattedAddressWithEircode)

                  setIsGeocoding(false)
                  resolve(preciseLocation || geocodedResult.geometry.location)
                } else {
                  setIsGeocoding(false)
                  resolve(geocodedResult.geometry.location)
                }
              } else {
                setIsGeocoding(false)
                resolve(place.geometry!.location)
              }
            }
          )
        })
      } else if (existingEircode && typeof existingEircode === 'string') {
        // Step 2: Already has Eircode, use it for precise lookup
        const preciseLocation = await geocodeWithEircode(existingEircode, place.formatted_address)
        setIsGeocoding(false)
        return preciseLocation || place.geometry.location
      } else {
        // Fallback if no valid Eircode
        setIsGeocoding(false)
        return place.geometry.location
      }
    } catch (error) {
      setIsGeocoding(false)
      return place.geometry?.location || null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">


      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Electricity Bill</h2>
                <p className="text-gray-500">Enter your average monthly electricity cost.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Average monthly electricity cost (€)
                  </label>
                  <input
                    type="number"
                    placeholder="150"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setManualAmount("")
                    setShowManualEntry(false)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (manualAmount && parseInt(manualAmount) > 0) {
                      handleManualEntry(manualAmount)
                      setManualAmount("")
                      setShowManualEntry(false)
                    }
                  }}
                  disabled={!manualAmount || parseInt(manualAmount) <= 0 || isNavigating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isNavigating ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Use this amount"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBillSelection ? (
        <>
          {/* Mobile Bill Selection UI */}
          <div className="block sm:hidden">
            <TooltipProvider>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                <AppHeader />
                {/* Progress Bar */}
                {/* <div className="bg-white border-b border-gray-200 py-2 md:py-3">
                    <div className="w-full px-2 md:px-4">
                      <div className="flex justify-between items-center max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
                        <ProgressStep icon={CheckCircle} label="Address" isActive />
                        <div className="flex-1 h-px bg-blue-600 mx-1 md:mx-2" />
                        <ProgressStep icon={TrendingUp} label="Potential" />
                        <div className="flex-1 h-px bg-gray-200 mx-1 md:mx-2" />
                        <ProgressStep icon={Settings} label="Personalise" />
                        <div className="flex-1 h-px bg-gray-200 mx-1 md:mx-2" />
                        <ProgressStep icon={Clipboard} label="Plan" />
                      </div>
                    </div>
                  </div> */}
                <ProgressBars
                  addressActive={true}
                  potentialActive={false}
                  personaliseActive={false}
                  planActive={false}
                  maxWidth="max-w-4xl"
                />

                <main className="max-w-4xl mx-auto px-3 py-3 mt-4">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h1 className="text-lg font-bold tracking-tight text-gray-900 mb-2 leading-tight">
                      How much electricity does your home use?
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <Info className="h-4 w-4 text-gray-500" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Most people don't know their exact usage, this just helps us get close.</span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-green-50/80 border border-green-200/60 text-green-800 p-2 rounded-lg flex items-start gap-2 mb-4">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                    <div className="text-xs">
                      <span className="font-semibold">Why we ask:</span> We use this to size your solar system properly.
                    </div>
                  </div>

                  {/* Progressive Questions Layout - Mobile */}
                  <div className="space-y-6 mb-4">
                    {/* Question 1: Home Type */}
                    <div className="space-y-3" id="question-1">
                      <label className="block text-lg font-semibold text-gray-900">
                        What type of home?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Terraced', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.homeType === 'Terraced'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 ${estimatorData.homeType === 'Terraced' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Terraced' && <div className="w-1 h-1 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏘️ Terraced
                        </button>
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Semi-detached', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.homeType === 'Semi-detached'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 ${estimatorData.homeType === 'Semi-detached' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Semi-detached' && <div className="w-1 h-1 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏡 Semi-detached
                        </button>
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Detached', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium col-span-2 ${estimatorData.homeType === 'Detached'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 ${estimatorData.homeType === 'Detached' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Detached' && <div className="w-1 h-1 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏠 Detached
                        </button>
                      </div>
                    </div>

                    {/* Question 2: Bedrooms - Only show after home type is selected */}
                    {estimatorData.homeType && (
                      <div className="space-y-3" id="question-2">
                        <label className="block text-lg font-semibold text-gray-900">
                          How many bedrooms?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {estimatorData.homeType === 'Terraced' && ['1', '2', '3'].map((bedroom) => (
                            <button
                              key={bedroom}
                              onClick={() => {
                                setEstimatorData({ ...estimatorData, bedrooms: bedroom })
                                setTimeout(() => {
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                                }, 100)
                              }}
                              className={`flex items-center gap-2 px-2 py-2 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.bedrooms === bedroom
                                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                  : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <div className={`w-3 h-3 rounded-full border-2 ${estimatorData.bedrooms === bedroom ? 'border-white bg-white' : 'border-gray-400'}`}>
                                {estimatorData.bedrooms === bedroom && <div className="w-1 h-1 bg-green-600 rounded-full m-0.5"></div>}
                              </div>
                              {bedroom} bed{bedroom !== '1' ? 's' : ''}
                            </button>
                          ))}
                          {(estimatorData.homeType === 'Semi-detached' || estimatorData.homeType === 'Detached') && ['3', '4', '5+'].map((bedroom) => (
                            <button
                              key={bedroom}
                              onClick={() => {
                                setEstimatorData({ ...estimatorData, bedrooms: bedroom })
                                setTimeout(() => {
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                                }, 100)
                              }}
                              className={`flex items-center gap-2 px-2 py-2 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.bedrooms === bedroom
                                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                  : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <div className={`w-3 h-3 rounded-full border-2 ${estimatorData.bedrooms === bedroom ? 'border-white bg-white' : 'border-gray-400'}`}>
                                {estimatorData.bedrooms === bedroom && <div className="w-1 h-1 bg-green-600 rounded-full m-0.5"></div>}
                              </div>
                              {bedroom} bed{bedroom !== '1' ? 's' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Question 3: Features - Only show after bedrooms is selected */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="space-y-3" id="question-3">
                        <label className="block text-lg font-semibold text-gray-900">
                          Any of these?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasEV: !estimatorData.hasEV })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.hasEV
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-3 h-3 rounded-sm border-2 ${estimatorData.hasEV ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasEV && <div className="w-1.5 h-1.5 bg-green-600 rounded-sm"></div>}
                            </div>
                            🚗 EV
                          </button>
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasHeatPump: !estimatorData.hasHeatPump })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${estimatorData.hasHeatPump
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-3 h-3 rounded-sm border-2 ${estimatorData.hasHeatPump ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasHeatPump && <div className="w-1.5 h-1.5 bg-green-600 rounded-sm"></div>}
                            </div>
                            🔥 Heat pump
                          </button>
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasElectricShower: !estimatorData.hasElectricShower })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium col-span-2 ${estimatorData.hasElectricShower
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-3 h-3 rounded-sm border-2 ${estimatorData.hasElectricShower ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasElectricShower && <div className="w-1.5 h-1.5 bg-green-600 rounded-sm"></div>}
                            </div>
                            💧 Electric shower
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Estimated Usage Indicator - Matching the image design */}
                    {estimatedUsage.category && estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">
                            Your estimated electricity usage:
                          </p>
                          <div className="flex items-baseline justify-center gap-2">
                            <p className="text-xl font-semibold text-green-600">
                              {estimatedUsage.category} usage
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              ~€{estimatedUsage.amount}/month
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="mt-4">
                        <Button
                          onClick={() => handleBillSelection(estimatedUsage.amount)}
                          disabled={isNavigating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isNavigating ? (
                            <div className="flex items-center gap-3 justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            <>Continue with €{estimatedUsage.amount}/month</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Manual Entry Prominent Option */}
                  <div className="bg-white border-2 border-blue-200/50 rounded-lg p-3 mb-4 shadow-sm hover:border-blue-300/60 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100/50 rounded-full p-1.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Most Accurate Option</div>
                        <div className="text-xs text-gray-600">Get the most precise solar sizing</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowManualModal(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                    >
                      📄 Know your bill? Enter it manually
                    </Button>
                  </div>

                  {/* Modals */}
                  <ManualEntryModal
                    isOpen={showManualModal}
                    onClose={() => setShowManualModal(false)}
                    onSubmit={handleManualEntryMobile}
                  />
                </main>
              </div>
            </TooltipProvider>
          </div>

          {/* Desktop Bill Selection UI */}
          <div className="hidden sm:block">
            {/* Bill Selection UI */}
            <main className="min-h-screen bg-gray-50 flex items-start justify-center py-4">
              <div className="container mx-auto max-w-4xl px-4 w-full">
                <div className="space-y-6 max-w-4xl mx-auto mt-4 sm:mt-8">
                  <div className="space-y-3 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      Your Home's Electricity Usage
                    </h1>
                   
                  </div>

                  {/* Why we ask this */}
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2 mb-8">
                    <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <span className="font-semibold">Why we ask this:</span> We use your electricity usage to size your solar
                      system.
                    </div>
                  </div>

                  {/* Progressive Questions Layout - Desktop */}
                  <div className="space-y-8 mb-6">
                    {/* Question 1: Home Type */}
                    <div className="space-y-4" id="desktop-question-1">
                      <label className="block text-xl font-semibold text-gray-900">
                        What type of home?
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Terraced', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('desktop-question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.homeType === 'Terraced'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 ${estimatorData.homeType === 'Terraced' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Terraced' && <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏘️ Terraced
                        </button>
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Semi-detached', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('desktop-question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.homeType === 'Semi-detached'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 ${estimatorData.homeType === 'Semi-detached' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Semi-detached' && <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏡 Semi-detached
                        </button>
                        <button
                          onClick={() => {
                            setEstimatorData({ ...estimatorData, homeType: 'Detached', bedrooms: '' })
                            setTimeout(() => {
                              document.getElementById('desktop-question-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 100)
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.homeType === 'Detached'
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 ${estimatorData.homeType === 'Detached' ? 'border-white bg-white' : 'border-gray-400'}`}>
                            {estimatorData.homeType === 'Detached' && <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-0.5"></div>}
                          </div>
                          🏠 Detached
                        </button>
                      </div>
                    </div>

                    {/* Question 2: Bedrooms - Only show after home type is selected */}
                    {estimatorData.homeType && (
                      <div className="space-y-4" id="desktop-question-2">
                        <label className="block text-xl font-semibold text-gray-900">
                          How many bedrooms?
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                          {estimatorData.homeType === 'Terraced' && ['1', '2', '3'].map((bedroom) => (
                            <button
                              key={bedroom}
                              onClick={() => {
                                setEstimatorData({ ...estimatorData, bedrooms: bedroom })
                                setTimeout(() => {
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                                }, 100)
                              }}
                              className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.bedrooms === bedroom
                                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                  : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 ${estimatorData.bedrooms === bedroom ? 'border-white bg-white' : 'border-gray-400'}`}>
                                {estimatorData.bedrooms === bedroom && <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-0.5"></div>}
                              </div>
                              {bedroom} bed{bedroom !== '1' ? 's' : ''}
                            </button>
                          ))}
                          {(estimatorData.homeType === 'Semi-detached' || estimatorData.homeType === 'Detached') && ['3', '4', '5+'].map((bedroom) => (
                            <button
                              key={bedroom}
                              onClick={() => {
                                setEstimatorData({ ...estimatorData, bedrooms: bedroom })
                                setTimeout(() => {
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                                }, 100)
                              }}
                              className={`flex items-center gap-2 px-3 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.bedrooms === bedroom
                                  ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                  : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 ${estimatorData.bedrooms === bedroom ? 'border-white bg-white' : 'border-gray-400'}`}>
                                {estimatorData.bedrooms === bedroom && <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-0.5"></div>}
                              </div>
                              {bedroom} bed{bedroom !== '1' ? 's' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Question 3: Features - Only show after bedrooms is selected */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="space-y-4" id="desktop-question-3">
                        <label className="block text-xl font-semibold text-gray-900">
                          Any of these?
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasEV: !estimatorData.hasEV })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.hasEV
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-sm border-2 ${estimatorData.hasEV ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasEV && <div className="w-2 h-2 bg-green-600 rounded-sm"></div>}
                            </div>
                            🚗 EV
                          </button>
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasHeatPump: !estimatorData.hasHeatPump })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.hasHeatPump
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-sm border-2 ${estimatorData.hasHeatPump ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasHeatPump && <div className="w-2 h-2 bg-green-600 rounded-sm"></div>}
                            </div>
                            🔥 Heat pump
                          </button>
                          <button
                            onClick={() => setEstimatorData({ ...estimatorData, hasElectricShower: !estimatorData.hasElectricShower })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-base font-medium ${estimatorData.hasElectricShower
                                ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-sm border-2 ${estimatorData.hasElectricShower ? 'border-white bg-white' : 'border-gray-400'} flex items-center justify-center`}>
                              {estimatorData.hasElectricShower && <div className="w-2 h-2 bg-green-600 rounded-sm"></div>}
                            </div>
                            💧 Electric shower
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Estimated Usage Indicator - Matching the image design */}
                    {estimatedUsage.category && estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                        <div className="space-y-3">
                          <p className="text-base font-medium text-gray-600">
                            Your estimated electricity usage:
                          </p>
                          <div className="flex items-baseline justify-center gap-3">
                            <p className="text-2xl font-semibold text-green-600">
                              {estimatedUsage.category} usage
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                              ~€{estimatedUsage.amount}/month
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="mt-6">
                        <Button
                          onClick={() => handleBillSelection(estimatedUsage.amount)}
                          disabled={isNavigating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isNavigating ? (
                            <div className="flex items-center gap-4 justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            <>Continue with €{estimatedUsage.amount}/month</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Manual Entry Button */}
                  <div className="bg-white border-2 border-blue-200/50 rounded-lg p-3 mb-4 shadow-sm hover:border-blue-300/60 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <div className="bg-blue-100/50 rounded-full p-1.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Most Accurate Option</div>
                        <div className="text-xs text-gray-600">Get the most precise solar sizing</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowManualModal(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                    >
                      📄 Know your bill? Enter it manually
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : isMapVisible ? (
        // Map View UI
        <>

          <AppHeader showBackButton={true} maxWidth="max-w-4xl" />

          {/* Progress Bar */}

          <ProgressBars
            addressActive={true}
            potentialActive={false}
            personaliseActive={false}
            planActive={false}
            maxWidth="max-w-4xl"
          />


          <main className="min-h-screen bg-gray-50 flex items-start justify-center">
            <div className="container mx-auto max-w-4xl px-4 max-h-[95vh] overflow-y-auto w-full">
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-100/50 p-4 md:p-6 max-w-4xl mx-auto backdrop-blur-sm mt-6 sm:mt-8">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address" className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3 block">
                      Property Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="address"
                        ref={inputRef}
                        placeholder="Enter your Eircode or full address..."
                        value={address}
                        onChange={handleAddressChange}
                        className={`h-12 md:h-14 text-base md:text-lg pl-4 md:pl-6 pr-12 md:pr-16 border-2 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${isGeocoding
                            ? 'border-blue-300 bg-blue-50'
                            : addressJustUpdated
                              ? 'border-green-300 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200'
                          }`}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                        {isGeocoding ? (
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <div className="w-3 h-3 md:w-4 md:h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500 md:w-4 md:h-4">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none" />
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" />
                              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-600">
                      {error}
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center text-gray-500">
                      Loading maps...
                    </div>
                  )}

                  {isGeocoding && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>📍 Getting address for new location...</span>
                    </div>
                  )}

                  {debugInfo && (
                    <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-200 text-sm">
                      <span>{debugInfo}</span>
                    </div>
                  )}

                  {!error && !isLoading && (
                    <div className="space-y-3 mt-4">



                      {/* <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Powered by Google Maps</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 rounded-full px-2 py-1">
                        <MapPin className="w-3 h-3" />
                        <span>Tap to adjust if needed</span>
                      </div>
                    </div> */}

                      <div className="relative overflow-hidden rounded-lg border">
                        <div id="map" className="h-[250px] md:h-[350px] w-full"></div>

                        {/* Address overlay box in top left corner */}
                        {/* <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white rounded-lg p-3 max-w-[280px] shadow-lg">
                        <div className="flex items-start gap-2">
                          {isGeocoding ? (
                            <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-h-0">
                            <p className="text-xs font-medium mb-1">
                              {isGeocoding ? "Finding address..." : "Current Location:"}
                            </p>
                            <p className="text-xs leading-relaxed break-words">
                              {isGeocoding ? "Updating location..." : (address || "Loading address...")}
                            </p>
                          </div>
                        </div>
                      </div> */}

                        {/* Overlay dialog for sm and up */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] max-w-md hidden sm:block">
                          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-green-500/20 p-4 space-y-3 w-full border border-white/50 hover:shadow-green-500/30 transition-all duration-300">
                            {/* Helpful tooltip when user clicks "No" */}
                            {showLocationTooltip && (
                              <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <div className="space-y-1 flex-1">
                                    <p className="text-xs text-blue-800 font-medium">
                                      How to adjust your location:
                                    </p>
                                    <ul className="text-xs text-blue-700 space-y-0.5 ml-1">
                                      <li>• Edit the address above if it's incorrect</li>
                                      <li>• Drag the map to move the pin - address will update automatically</li>
                                      <li>• Zoom in for more precise positioning</li>
                                    </ul>
                                  </div>
                                  <Button
                                    onClick={() => setShowLocationTooltip(false)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-blue-600 hover:text-blue-800"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              </div>
                            )}
                            <p className="text-center font-medium">Is this your location?</p>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleContinue()}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                Yes
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowLocationTooltip(true)
                                  // Auto-hide tooltip after 5 seconds
                                  setTimeout(() => setShowLocationTooltip(false), 5000)
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Dialog below map for small screens */}
                      <div className="block sm:hidden mt-3">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-green-500/20 p-4 space-y-3 w-full border border-white/50">
                          {/* Helpful tooltip when user clicks "No" */}
                          {showLocationTooltip && (
                            <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 shadow-lg">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="space-y-1 flex-1">
                                  <p className="text-sm text-blue-800 font-medium">
                                    How to adjust your location:
                                  </p>
                                  <ul className="text-sm text-blue-700 space-y-0.5 ml-1">
                                    <li>• Edit the address above if it's incorrect</li>
                                    <li>• Drag the map to move the pin - address will update automatically</li>
                                    <li>• Zoom in for more precise positioning</li>
                                  </ul>
                                </div>
                                <Button
                                  onClick={() => setShowLocationTooltip(false)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-1 text-blue-600 hover:text-blue-800"
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          )}
                          <p className="text-center font-medium">Is this your location?</p>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleContinue()}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Yes
                            </Button>
                            <Button
                              onClick={() => {
                                setShowLocationTooltip(true)
                                // Auto-hide tooltip after 5 seconds
                                setTimeout(() => setShowLocationTooltip(false), 5000)
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">
                          Move the map to position the marker at your exact location. We'll use this location for our solar analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <>
          {/* Template Switching Logic */}
          {(() => {
            const templateId = branding.address_template || 0
            const templateProps = {
              branding,
              address,
              handleAddressChange,
              handleSubmit: () => {
                // This will trigger the Google Maps autocomplete when user has selected an address
                if (selectedLocation) {
                  setIsMapVisible(true)
                }
              },
              mainInputRef,
              isLoading,
              isGeocoding,
              addressJustUpdated,
              selectedLocation,
              error
            }

            switch (templateId) {
              case 1:
                return <AddressTemplate1 {...templateProps} />
              case 2:
                return <AddressTemplate2 {...templateProps} />
              case 3:
                return <AddressTemplate3 {...templateProps} />
              case 4:
                return <AddressTemplate4 {...templateProps} />
              case 5:
                return <AddressTemplate5 {...templateProps} />
              case 0:
              default:
                return <AddressTemplate0 {...templateProps} />
            }
          })()}
        </>
      )}
      <AvatarAssistant step={1} pageType="address" />
    </div>
  )
}
