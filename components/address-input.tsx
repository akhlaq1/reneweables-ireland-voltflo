import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"
import { forwardRef } from "react"

interface AddressInputProps {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  isGeocoding?: boolean
  addressJustUpdated?: boolean
  className?: string
}

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  ({ 
    id, 
    value, 
    onChange, 
    placeholder = "Enter your Eircode or full address...", 
    disabled = false,
    isGeocoding = false,
    addressJustUpdated = false,
    className = ""
  }, ref) => {
    const defaultClassName = `pl-8 h-10 sm:h-12 text-sm rounded-2xl border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:shadow-md transition-all duration-200 ${
      isGeocoding
        ? 'border-blue-300 bg-blue-50'
        : addressJustUpdated
          ? 'border-green-300 bg-green-50 ring-2 ring-green-200'
          : 'border-gray-200'
    }`

    return (
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${defaultClassName} ${className}`}
          disabled={disabled}
          required
        />
        {isGeocoding ? (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </div>
    )
  }
)

AddressInput.displayName = "AddressInput"