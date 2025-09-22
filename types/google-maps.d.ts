declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions)
      setCenter(latLng: LatLng | LatLngLiteral): void
      getCenter(): LatLng
      addListener(eventName: string, handler: Function): void
    }

    class Marker {
      constructor(opts?: MarkerOptions)
      setPosition(latLng: LatLng | LatLngLiteral): void
      getPosition(): LatLng
      addListener(eventName: string, handler: Function): void
    }

    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): void
    }

    class StreetViewPanorama {
      constructor(container: Element, opts?: StreetViewPanoramaOptions)
      setPosition(latLng: LatLng | LatLngLiteral): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }

    class Geocoder {
      constructor()
      geocode(request: any, callback: (results: any[], status: string) => void): void
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      mapTypeId?: string
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      draggable?: boolean
    }

    interface StreetViewPanoramaOptions {
      position?: LatLng | LatLngLiteral
      pov?: {
        heading: number
        pitch: number
      }
      zoom?: number
    }

    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, opts?: AutocompleteOptions)
        getPlace(): PlaceResult
        addListener(eventName: string, handler: Function): void
      }

      interface AutocompleteOptions {
        componentRestrictions?: {
          country: string | string[]
        }
        fields?: string[]
        types?: string[]
      }

      interface PlaceResult {
        address_components?: AddressComponent[]
        formatted_address?: string
        geometry?: {
          location: LatLng
        }
      }

      interface AddressComponent {
        long_name: string
        short_name: string
        types: string[]
      }
    }
  }
} 