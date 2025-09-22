import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
  }

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&key=${apiKey}`
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=600x400&maptype=satellite&key=${apiKey}`

  try {
    // Try Street View first
    const response = await fetch(streetViewUrl)
    const imageBuffer = await response.arrayBuffer()
    // If image is very small, it's likely the 'no imagery' placeholder
    if (imageBuffer.byteLength < 12000) { // 12KB threshold
      // Fallback to satellite image
      const mapResponse = await fetch(staticMapUrl)
      const mapBuffer = await mapResponse.arrayBuffer()
      return new NextResponse(mapBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'no-store',
        },
      })
    }
    // Otherwise, return the Street View image
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching street view or satellite image:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
} 