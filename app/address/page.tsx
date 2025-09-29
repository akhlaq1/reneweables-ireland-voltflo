"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Building, Home, HomeIcon as House, HelpCircle, CheckCircle, Car, ThermometerSnowflake, Droplets, Info, X,  TrendingUp, Settings, Clipboard  } from "lucide-react"
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

const ProgressStep = ({ icon: Icon, label, isActive = false }: { icon: any; label: string; isActive?: boolean }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mb-1 ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
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

// Take the Test Modal Component for Mobile
interface TakeTestModalProps {
  isOpen: boolean
  onClose: () => void
  onEstimate: (estimate: string) => void
}

function TakeTestModal({ isOpen, onClose, onEstimate }: TakeTestModalProps) {
  const [homeType, setHomeType] = useState<string>("")
  const [bedrooms, setBedrooms] = useState<string>("")
  const [hasEV, setHasEV] = useState<boolean>(false)
  const [hasHeatPump, setHasHeatPump] = useState<boolean>(false)
  const [hasElectricShower, setHasElectricShower] = useState<boolean>(false)
  const [estimatedUsage, setEstimatedUsage] = useState<string>("")

  useEffect(() => {
    if (homeType && bedrooms) {
      let baseValue = 0
      
      // Base value based on home type and bedroom count
      if (homeType === 'apartment' || homeType === 'terraced') {
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
          case '5+':
            baseValue = 140 // Use 3-bed price as default for higher bedrooms
            break
          default:
            baseValue = 140 // Default to 3-bed price
        }
      } else if (homeType === 'semi-detached') {
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
          case '5+':
            baseValue = 190
            break
          default:
            baseValue = 150 // Default to 3-bed price
        }
      } else if (homeType === 'detached') {
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

      if (hasEV) baseValue += 60
      if (hasHeatPump) baseValue += 80
      if (hasElectricShower) baseValue += 15

      let usageCategory = ""
      let monthlyCost = ""

      if (baseValue < 140) {
        usageCategory = "Low"
        monthlyCost = `~€${baseValue}/month`
      } else if (baseValue >= 140 && baseValue <= 200) {
        usageCategory = "Average"
        monthlyCost = `~€${baseValue}/month`
      } else {
        usageCategory = "High"
        monthlyCost = `~€${baseValue}/month`
      }
      setEstimatedUsage(`${usageCategory} (${monthlyCost})`)
    } else {
      setEstimatedUsage("")
    }
  }, [homeType, bedrooms, hasEV, hasHeatPump, hasElectricShower])

  const handleUseEstimate = () => {
    onEstimate(estimatedUsage)
    onClose()
  }

  const handleCancel = () => {
    setHomeType("")
    setBedrooms("")
    setHasEV(false)
    setHasHeatPump(false)
    setHasElectricShower(false)
    setEstimatedUsage("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm mx-auto rounded-lg p-0 gap-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-bold text-white">Quick Estimator</DialogTitle>
            <DialogDescription className="text-orange-100 text-sm mt-1">
              Answer 3 quick questions
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="home-type" className="text-sm font-semibold text-gray-900">
              What type of home?
            </Label>
            <Select value={homeType} onValueChange={setHomeType}>
              <SelectTrigger id="home-type" className="h-10 text-sm rounded-lg">
                <SelectValue placeholder="Select home type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">🏢 Apartment</SelectItem>
                <SelectItem value="terraced">🏘️ Terraced</SelectItem>
                <SelectItem value="semi-detached">🏡 Semi-detached</SelectItem>
                <SelectItem value="detached">🏠 Detached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm font-semibold text-gray-900">
              How many bedrooms?
            </Label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger id="bedrooms" className="h-10 text-sm rounded-lg">
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 bedroom</SelectItem>
                <SelectItem value="2">2 bedrooms</SelectItem>
                <SelectItem value="3">3 bedrooms</SelectItem>
                <SelectItem value="4">4 bedrooms</SelectItem>
                <SelectItem value="5+">5+ bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Any of these?</Label>
            <div className="space-y-2">
              <Button
                variant={hasEV ? "default" : "outline"}
                onClick={() => setHasEV(!hasEV)}
                className={cn(
                  "w-full h-10 justify-start text-sm rounded-lg",
                  hasEV ? "bg-orange-400 hover:bg-orange-500" : "hover:border-orange-300"
                )}
              >
                <Car className="h-4 w-4 mr-2" />
                Electric Vehicle
              </Button>
              <Button
                variant={hasHeatPump ? "default" : "outline"}
                onClick={() => setHasHeatPump(!hasHeatPump)}
                className={cn(
                  "w-full h-10 justify-start text-sm rounded-lg",
                  hasHeatPump ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-300"
                )}
              >
                <ThermometerSnowflake className="h-4 w-4 mr-2" />
                Heat Pump
              </Button>
              <Button
                variant={hasElectricShower ? "default" : "outline"}
                onClick={() => setHasElectricShower(!hasElectricShower)}
                className={cn(
                  "w-full h-10 justify-start text-sm rounded-lg",
                  hasElectricShower ? "bg-blue-500 hover:bg-blue-600" : "hover:border-blue-300"
                )}
              >
                <Droplets className="h-4 w-4 mr-2" />
                Electric Shower
              </Button>
            </div>
          </div>

          {estimatedUsage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <div className="text-xs text-green-600 font-medium mb-1">Estimated usage:</div>
              <div className="text-sm font-bold text-green-700">{estimatedUsage}</div>
            </div>
          )}
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
            onClick={handleUseEstimate} 
            disabled={!estimatedUsage}
            className="flex-1 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm"
          >
            ✅ Use Estimate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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

  const handleSubmit = () => {
    if (amount) {
      onSubmit(amount)
      setAmount("")
      onClose()
    }
  }

  const handleCancel = () => {
    setAmount("")
    onClose()
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
              id="amount"
              type="number"
              placeholder="150"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 text-sm rounded-lg text-center font-semibold"
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
            disabled={!amount}
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
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPlace, setPendingPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const [showLocationConfirm, setShowLocationConfirm] = useState(false)
  const [showBillSelection, setShowBillSelection] = useState(false)
  const [selectedBillAmount, setSelectedBillAmount] = useState<number | null>(null)
  const [showEstimator, setShowEstimator] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualAmount, setManualAmount] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)
  const [hasUsedEstimator, setHasUsedEstimator] = useState(false)
  const [estimatorData, setEstimatorData] = useState({
    homeType: 'Terraced',
    bedrooms: '2',
    hasEV: false,
    hasHeatPump: false,
    hasElectricShower: false
  })
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [showLocationTooltip, setShowLocationTooltip] = useState(false)

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
      }
    }
  }, [])

  useEffect(() => {
    if (!isMapVisible || !pendingPlace?.geometry?.location) return

    const mapElement = document.getElementById("map")
    
    if (!mapElement) {
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
            console.log('🎯 Map dragged to new coordinates:', {
              lat: newCenter.lat(),
              lng: newCenter.lng()
            })
            
            // Reverse geocode to get address for new location
            const newAddress = await reverseGeocode(newCenter)
            if (newAddress) {
              setAddress(newAddress)
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
      mapRef.current.setCenter(pendingPlace.geometry.location)
    }
  }, [isMapVisible, pendingPlace])

  const initializeGoogleMaps = () => {
    try {
      if (!inputRef.current || !window.google) return

      // Initialize Places Autocomplete with improved configuration for better accuracy
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ie" }, // Restrict to Ireland
        fields: ["address_components", "formatted_address", "geometry", "name", "place_id", "types"],
        types: ["geocode"] // Change from "address" to "geocode" for better precision
      })

      // Handle place selection
      autocompleteRef.current.addListener("place_changed", async () => {
        const place = autocompleteRef.current?.getPlace()
        if (!place?.geometry?.location) {
          console.warn("Place selected but no geometry found:", place)
          return
        }

        // Log detailed information for debugging
        const location = place.geometry.location
        console.log("Selected place details:", {
          formatted_address: place.formatted_address,
          location: {
            lat: location.lat(),
            lng: location.lng()
          },
          has_address_components: !!place.address_components,
          address_components_length: place.address_components?.length || 0
        })

        // Use the enhanced Eircode validation for better accuracy
        console.log("🔍 Using Eircode-enhanced validation...")
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
        setPendingPlace({...place, geometry: {...place.geometry, location: finalLocation}})
        setIsMapVisible(true)

        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          if (finalLocation) {
            console.log("Final coordinates being used:", {
              lat: finalLocation.lat(),
              lng: finalLocation.lng()
            })
          }
        }, 100)
      })
    } catch (err) {
      console.error("Error initializing Google Maps:", err)
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
        localStorage.setItem("personalise_answers", JSON.stringify(personaliseAnswers))
        
        // Navigate to loading page
        await router.push("/loading")
      } catch (error) {
        console.error("Navigation error:", error)
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
            console.log("🎯 Got precise coordinates using Eircode:", eircode)
            console.log("📍 Eircode coordinates:", {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
              source: "Eircode Geocoding"
            })
            resolve(results[0].geometry.location)
          } else {
            console.log("❌ Eircode geocoding failed, trying with full address")
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
      setIsGeocoding(true)
      const geocoder = new (window.google.maps as any).Geocoder()

      return new Promise<string | null>((resolve) => {
        geocoder.geocode(
          {
            location: location,
            componentRestrictions: { country: "ie" }
          },
          (results: any[], status: string) => {
            setIsGeocoding(false)
            
            if (status === "OK" && results?.length > 0) {
              console.log("🔍 Found", results.length, "reverse geocoding results")
              
              // Log all results for debugging
              results.forEach((result: any, index: number) => {
                console.log(`Result ${index}:`, {
                  address: result.formatted_address,
                  types: result.types,
                  hasEircode: result.address_components?.some((c: any) => c.types.includes("postal_code"))
                })
              })
              
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
                'administrative_area_level_1'
              ]
              
              // Filter out country-level results immediately
              const filteredResults = results.filter((result: any) => 
                !result.types.includes('country') && 
                result.formatted_address !== "Ireland" &&
                result.formatted_address.toLowerCase() !== "ireland"
              )
              
              console.log("📋 After filtering out country results:", filteredResults.length, "results remain")
              
              if (filteredResults.length === 0) {
                console.log("❌ All results were too generic")
                // Return coordinates as fallback
                const coordString = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
                resolve(coordString)
                return
              }
              
              // First, try to find a result with an Eircode (most accurate)
              let bestResult = filteredResults.find((result: any) => {
                const hasEircode = result.address_components?.some(
                  (component: any) => component.types.includes("postal_code")
                )
                const isSpecific = preferredTypes.slice(0, 7).some(type => 
                  result.types.includes(type)
                )
                return hasEircode && isSpecific
              })
              
              // If no result with Eircode, find the most specific result
              if (!bestResult) {
                for (const preferredType of preferredTypes) {
                  bestResult = filteredResults.find((result: any) => 
                    result.types.includes(preferredType)
                  )
                  if (bestResult) {
                    console.log(`✅ Found result with type: ${preferredType}`)
                    break
                  }
                }
              }
              
              // Fallback to first filtered result
              if (!bestResult) {
                bestResult = filteredResults[0]
                console.log("⚠️ Using first available result as fallback")
              }

              const foundEircode = bestResult.address_components?.find(
                (component: any) => component.types.includes("postal_code")
              )?.long_name

              // Format address with Eircode if available
              let formattedAddress = foundEircode 
                ? `${bestResult.formatted_address} (${foundEircode})`
                : bestResult.formatted_address

              // Final check - if still too generic, show coordinates
              if (formattedAddress === "Ireland" || 
                  formattedAddress.toLowerCase() === "ireland" ||
                  bestResult.types.includes('country')) {
                console.log("❌ Final result still too generic, using coordinates")
                formattedAddress = `📍 ${location.lat().toFixed(6)}, ${location.lng().toFixed(6)}`
              }

              console.log("🔄 Final reverse geocoded address:", formattedAddress)
              console.log("📍 Result types:", bestResult.types)
              console.log("📍 From coordinates:", {
                lat: location.lat(),
                lng: location.lng()
              })

              resolve(formattedAddress)
            } else {
              console.log("❌ Reverse geocoding failed")
              resolve(null)
            }
          }
        )
      })
    } catch (error) {
      console.error("Error in reverse geocoding:", error)
      setIsGeocoding(false)
      return null
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
        console.log("🔍 No Eircode found, searching for one...")
        
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
                  console.log("✅ Found Eircode:", foundEircode)
                  // Step 2: Now use the Eircode for precise coordinate lookup
                  const preciseLocation = await geocodeWithEircode(foundEircode, place.formatted_address || '')
                  
                  // Update the address with Eircode for display
                  const formattedAddressWithEircode = `${place.formatted_address} (${foundEircode})`
                  setAddress(formattedAddressWithEircode)
                  
                  setIsGeocoding(false)
                  resolve(preciseLocation || geocodedResult.geometry.location)
                } else {
                  console.log("❌ No Eircode found in geocoding results")
                  setIsGeocoding(false)
                  resolve(geocodedResult.geometry.location)
                }
              } else {
                console.log("❌ Geocoding failed for Eircode lookup")
                setIsGeocoding(false)
                resolve(place.geometry!.location)
              }
            }
          )
        })
      } else if (existingEircode && typeof existingEircode === 'string') {
        // Step 2: Already has Eircode, use it for precise lookup
        console.log("✅ Using existing Eircode:", existingEircode)
        const preciseLocation = await geocodeWithEircode(existingEircode, place.formatted_address)
        setIsGeocoding(false)
        return preciseLocation || place.geometry.location
      } else {
        // Fallback if no valid Eircode
        setIsGeocoding(false)
        return place.geometry.location
      }
    } catch (error) {
      console.error("Error in Eircode validation:", error)
      setIsGeocoding(false)
      return place.geometry?.location || null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Estimator Modal */}
      {showEstimator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Estimator</h2>
                <p className="text-gray-500">Answer 3 quick questions to get a tailored estimate.</p>
              </div>

              <div className="space-y-4">
                {/* Home Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    What type of home?
                  </label>
                  <select
                    value={estimatorData.homeType.toLowerCase().replace('-', '-')}
                    onChange={(e) => {
                      const value = e.target.value
                      let homeTypeValue = ''
                      switch (value) {
                        case 'apartment':
                          homeTypeValue = 'Apartment'
                          break
                        case 'terraced':
                          homeTypeValue = 'Terraced'
                          break
                        case 'semi-detached':
                          homeTypeValue = 'Semi-detached'
                          break
                        case 'detached':
                          homeTypeValue = 'Detached'
                          break
                        default:
                          homeTypeValue = 'Terraced'
                      }
                      setEstimatorData({...estimatorData, homeType: homeTypeValue})
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  >
                    <option value="">Select home type</option>
                    <option value="apartment">Apartment</option>
                    <option value="terraced">Terraced</option>
                    <option value="semi-detached">Semi-detached</option>
                    <option value="detached">Detached</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    How many bedrooms?
                  </label>
                  <select
                    value={estimatorData.bedrooms}
                    onChange={(e) => setEstimatorData({...estimatorData, bedrooms: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  >
                    <option value="">Select number of bedrooms</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Special Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Any of these?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setEstimatorData({...estimatorData, hasEV: !estimatorData.hasEV})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        estimatorData.hasEV 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white text-gray-900 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      🚗 EV
                    </button>
                    <button
                      onClick={() => setEstimatorData({...estimatorData, hasHeatPump: !estimatorData.hasHeatPump})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        estimatorData.hasHeatPump 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white text-gray-900 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      🔥 Heat pump
                    </button>
                    <button
                      onClick={() => setEstimatorData({...estimatorData, hasElectricShower: !estimatorData.hasElectricShower})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                        estimatorData.hasElectricShower 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white text-gray-900 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      💧 Electric shower
                    </button>
                  </div>
                </div>

                {/* Estimated Result */}
                {estimatedUsage.category && estimatorData.homeType && estimatorData.bedrooms && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-lg font-semibold text-green-800">
                      Estimated usage: <span className="text-green-600">{estimatedUsage.category} (~€{estimatedUsage.amount}/month)</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEstimatorData({
                      homeType: '',
                      bedrooms: '',
                      hasEV: false,
                      hasHeatPump: false,
                      hasElectricShower: false
                    })
                    setHasUsedEstimator(false)
                    setShowEstimator(false)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUseEstimate}
                  disabled={isNavigating || !estimatorData.homeType || !estimatorData.bedrooms}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isNavigating ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "✅ Use this Estimate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                   <div className="bg-white border-b border-gray-200 py-2 md:py-3">
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
                  </div>

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

                  {/* Question 1: Home Type */}
                  <div className="space-y-4 mb-6">
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-900">
                        What type of home?
                      </label>
                      <select
                        value={estimatorData.homeType.toLowerCase().replace('-', '-')}
                        onChange={(e) => {
                          const value = e.target.value
                          let homeTypeValue = ''
                          switch (value) {
                            case 'apartment':
                              homeTypeValue = 'Apartment'
                              break
                            case 'terraced':
                              homeTypeValue = 'Terraced'
                              break
                            case 'semi-detached':
                              homeTypeValue = 'Semi-detached'
                              break
                            case 'detached':
                              homeTypeValue = 'Detached'
                              break
                            default:
                              homeTypeValue = ''
                          }
                          setEstimatorData({ ...estimatorData, homeType: homeTypeValue })
                        }}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg"
                      >
                        <option value="">Select home type</option>
                        <option value="apartment">🏢 Apartment</option>
                        <option value="terraced">🏘️ Terraced</option>
                        <option value="semi-detached">🏡 Semi-detached</option>
                        <option value="detached">🏠 Detached</option>
                      </select>
                    </div>

                    {/* Question 2: Bedrooms */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-900">
                        How many bedrooms?
                      </label>
                      <select
                        value={estimatorData.bedrooms}
                        onChange={(e) => setEstimatorData({ ...estimatorData, bedrooms: e.target.value })}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg"
                      >
                        <option value="">Select number of bedrooms</option>
                        <option value="1">1 bedroom</option>
                        <option value="2">2 bedrooms</option>
                        <option value="3">3 bedrooms</option>
                        <option value="4">4 bedrooms</option>
                        <option value="5+">5+ bedrooms</option>
                      </select>
                    </div>

                    {/* Question 3: Features */}
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-900">
                        Any of these?
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasEV: !estimatorData.hasEV })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-lg font-medium ${estimatorData.hasEV
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          🚗 EV
                        </button>
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasHeatPump: !estimatorData.hasHeatPump })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-lg font-medium ${estimatorData.hasHeatPump
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          🔥 Heat pump
                        </button>
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasElectricShower: !estimatorData.hasElectricShower })}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-lg font-medium ${estimatorData.hasElectricShower
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          💧 Electric shower
                        </button>
                      </div>
                    </div>

                    {/* Estimated Usage Indicator */}
                    {estimatedUsage.category && estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 text-center mt-6">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-700">
                            Your estimated electricity usage:
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {estimatedUsage.category} usage
                          </p>
                          <p className="text-xl font-semibold text-blue-600">
                            ~€{estimatedUsage.amount}/month
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Based on your home type, size, and features
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="mt-6">
                        <Button
                          onClick={() => handleBillSelection(estimatedUsage.amount)}
                          disabled={isNavigating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isNavigating ? (
                            <div className="flex items-center gap-3 justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing your estimate...
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

                  {/* Question 1: Home Type */}
                  <div className="space-y-6 mb-8">
                    <div className="space-y-4">
                      <label className="block text-xl font-semibold text-gray-900">
                        What type of home?
                      </label>
                      <select
                        value={estimatorData.homeType.toLowerCase().replace('-', '-')}
                        onChange={(e) => {
                          const value = e.target.value
                          let homeTypeValue = ''
                          switch (value) {
                            case 'apartment':
                              homeTypeValue = 'Apartment'
                              break
                            case 'terraced':
                              homeTypeValue = 'Terraced'
                              break
                            case 'semi-detached':
                              homeTypeValue = 'Semi-detached'
                              break
                            case 'detached':
                              homeTypeValue = 'Detached'
                              break
                            default:
                              homeTypeValue = ''
                          }
                          setEstimatorData({ ...estimatorData, homeType: homeTypeValue })
                        }}
                        className="w-full p-5 border-2 border-gray-300 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-xl"
                      >
                        <option value="">Select home type</option>
                        <option value="apartment">🏢 Apartment</option>
                        <option value="terraced">🏘️ Terraced</option>
                        <option value="semi-detached">🏡 Semi-detached</option>
                        <option value="detached">🏠 Detached</option>
                      </select>
                    </div>

                    {/* Question 2: Bedrooms */}
                    <div className="space-y-4">
                      <label className="block text-xl font-semibold text-gray-900">
                        How many bedrooms?
                      </label>
                      <select
                        value={estimatorData.bedrooms}
                        onChange={(e) => setEstimatorData({ ...estimatorData, bedrooms: e.target.value })}
                        className="w-full p-5 border-2 border-gray-300 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-xl"
                      >
                        <option value="">Select number of bedrooms</option>
                        <option value="1">1 bedroom</option>
                        <option value="2">2 bedrooms</option>
                        <option value="3">3 bedrooms</option>
                        <option value="4">4 bedrooms</option>
                        <option value="5+">5+ bedrooms</option>
                      </select>
                    </div>

                    {/* Question 3: Features */}
                    <div className="space-y-4">
                      <label className="block text-xl font-semibold text-gray-900">
                        Any of these?
                      </label>
                      <div className="flex gap-4 flex-wrap">
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasEV: !estimatorData.hasEV })}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-xl font-medium ${estimatorData.hasEV
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          🚗 EV
                        </button>
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasHeatPump: !estimatorData.hasHeatPump })}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-xl font-medium ${estimatorData.hasHeatPump
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          🔥 Heat pump
                        </button>
                        <button
                          onClick={() => setEstimatorData({ ...estimatorData, hasElectricShower: !estimatorData.hasElectricShower })}
                          className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-xl font-medium ${estimatorData.hasElectricShower
                              ? 'bg-green-600 text-white border-green-600 shadow-lg'
                              : 'bg-white text-gray-900 border-gray-300 hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          💧 Electric shower
                        </button>
                      </div>
                    </div>

                    {/* Estimated Usage Indicator */}
                    {estimatedUsage.category && estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8 text-center mt-8">
                        <div className="space-y-3">
                          <p className="text-xl font-semibold text-gray-700">
                            Your estimated electricity usage:
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {estimatedUsage.category} usage
                          </p>
                          <p className="text-2xl font-semibold text-blue-600">
                            ~€{estimatedUsage.amount}/month
                          </p>
                          <p className="text-base text-gray-600 mt-3">
                            Based on your home type, size, and features
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Continue Button */}
                    {estimatorData.homeType && estimatorData.bedrooms && (
                      <div className="mt-8">
                        <Button
                          onClick={() => handleBillSelection(estimatedUsage.amount)}
                          disabled={isNavigating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isNavigating ? (
                            <div className="flex items-center gap-4 justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing your estimate...
                            </div>
                          ) : (
                            <>Continue with €{estimatedUsage.amount}/month</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

              {/* Manual Entry Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline decoration-dotted underline-offset-4"
                >
                  Know your exact bill? We can help you enter it manually →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
        </>
      ) : isMapVisible ? (
        // Map View UI
        <main className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center py-4 sm:py-4">
          <div className="container mx-auto max-w-4xl px-4 max-h-[95vh] overflow-y-auto w-full">
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-100/50 p-4 md:p-6 max-w-2xl mx-auto backdrop-blur-sm mt-4 sm:mt-0">
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
                      className="h-12 md:h-14 text-base md:text-lg pl-4 md:pl-6 pr-12 md:pr-16 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500 md:w-4 md:h-4">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
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
                  <div className="text-center text-blue-600">
                    🔍 Validating coordinates for accuracy...
                  </div>
                )}

                {!error && !isLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-100">
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
                    </div>

                    <div className="relative overflow-hidden rounded-lg border">
                      <div id="map" className="h-[250px] md:h-[350px] w-full"></div>
                      
                      {/* Address overlay box in top left corner */}
                      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white rounded-lg p-3 max-w-[280px] shadow-lg">
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
                      </div>
                      
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
                                    <li>• Drag the map to position the pin over your property</li>
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
                                  <li>• Drag the map to position the pin over your property</li>
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
      ) : (
        // New Solar Assessment UI
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-start sm:items-center justify-center p-4 sm:p-4">
          <div className="max-w-5xl w-full max-h-[95vh] overflow-y-auto mt-4 sm:mt-0">
            {/* Main content card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-gray-600/5 border border-gray-300/50 backdrop-blur-sm">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left side - Form and main CTA */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                  <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Your Home Could Save <span className="text-green-600">€1,200 a Year</span> With Solar
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">Get your personalised solar plan in under 60 seconds</p>
                  </div>

                  {/* Address form */}
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <Input
                          id="address"
                          ref={inputRef}
                          type="text"
                          placeholder="Enter your Eircode or full address..."
                          value={address}
                          onChange={handleAddressChange}
                          className="pl-8 h-10 sm:h-12 text-sm rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                          required
                        />
                        <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>Eircode preferred for best results</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      onClick={() => {
                        // This will trigger the Google Maps autocomplete when user has selected an address
                        if (selectedLocation) {
                          setIsMapVisible(true)
                        }
                      }}
                      className="w-full h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 shadow-lg"
                      disabled={isLoading}
                    >
                      Get My Free Assessment →
                    </Button>
                  </form>

                  {/* Include PDF info */}
                  <div className="text-center mt-2">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Includes a personalised solar plan + savings report (PDF)
                    </p>
                  </div>

                  {/* Loading and error states */}
                  {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-200/50 p-3 text-red-600 mt-3 shadow-sm">
                      {error}
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center text-gray-500 mt-2">
                      Loading maps...
                    </div>
                  )}

                  {isGeocoding && (
                    <div className="text-center text-blue-600 mt-2">
                      🔍 Validating coordinates for accuracy...
                    </div>
                  )}

                  {/* Privacy note */}
                  <div className="flex items-center justify-center text-xs text-gray-600 mt-2">
                    <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>100% Private & Secure</span>
                  </div>

                  {/* Google Reviews */}
                  <div className="mt-4 mb-3">
                    {/* Google Reviews - Only show if reviews data exists */}
                    {branding.reviews && (
                      <div 
                        onClick={() => branding.reviews?.url && window.open(branding.reviews.url, "_blank")}
                        className={`flex items-center justify-start space-x-3 bg-white border border-gray-100/50 rounded-2xl p-4 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm ${branding.reviews.url ? 'cursor-pointer' : ''}`}
                      >
                        <Image
                          src={branding.logo}
                          alt={branding.name}
                          width={60}
                          height={30}
                          className="h-8 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{branding.reviews.rating}</span>
                            <div className="flex text-yellow-400 text-xs">
                              {"★★★★★".split("").map((star, i) => (
                                <span key={i}>{star}</span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">({branding.reviews.count} reviews)</span>
                          </div>
                          {branding.reviews.warranty && (
                            <div className="text-xs text-gray-600">{branding.reviews.warranty}</div>
                          )}
                        </div>
                        <Image
                          src="/google-logo.png"
                          alt="Google"
                          width={80}
                          height={26}
                          className="h-8 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* SEAI Trust Badge */}
                  <div className="mb-4">
                    <div className="flex items-center justify-start space-x-3 bg-white border border-gray-100/50 rounded-2xl p-4 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">
                      <Image
                        src="/images/seai-logo.png"
                        alt="SEAI Registered - Sustainable Energy Authority of Ireland"
                        width={60}
                        height={40}
                        className="h-10 object-contain"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">SEAI-Registered Installer</div>
                        <div className="text-xs text-gray-600 mt-0.5">Handles the entire grant process</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - House image and benefits */}
                <div className="hidden lg:flex bg-gradient-to-br from-blue-100 to-green-100 p-4 lg:p-6 flex-col justify-center">
                  {/* House illustration */}
                  <div className="mb-6 relative">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-green-500/20 border border-white/30 hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-1">
                      <Image
                        src="/images/modern-solar-house.png"
                        alt="Modern house with solar panels showing energy savings"
                        width={300}
                        height={200}
                        className="w-full h-auto"
                      />
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-green-400/30">
                        €1,200/year saved
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-green-500/10 border border-white/20 hover:shadow-xl hover:shadow-green-500/15 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">Lower Your Bills</h3>
                        <p className="text-xs text-gray-600">Save up to 70% on electricity</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-blue-500/10 border border-white/20 hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">Carbon Footprint Drop</h3>
                        <p className="text-xs text-gray-600">Cut emissions with clean energy</p>
                      </div>
                    </div>

                    <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-purple-500/10 border border-white/20 hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">Higher Home Value</h3>
                        <p className="text-xs text-gray-600">Solar boosts resale potential</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 text-center mt-3 font-medium">
                    No upfront costs. No hidden fees. Just smart energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
      <AvatarAssistant step={1} pageType="address" />
    </div>
  )
}
