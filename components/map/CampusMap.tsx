'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { setupLeafletIcons, createLocationIcon } from './LeafletIcons'
import LocationPhoto from '@/components/student/LocationPhoto'

export interface MapLocation {
  id: string
  name: string
  type: string
  description?: string | null
  photo_url?: string | null
  lat: number
  lng: number
  faculty?: { id: string; name: string; cabin_number: string | null }[]
}

interface CampusMapProps {
  locations: MapLocation[]
  universityCenter?: { lat: number; lng: number } | null
  focusedLocationId?: string | null
  height?: string
  onPinClick?: (id: string) => void
}

function MapViewController({
  focusedLocation,
  markerRefs,
}: {
  focusedLocation?: MapLocation | null
  markerRefs: React.MutableRefObject<Record<string, L.Marker | null>>
}) {
  const map = useMap()

  useEffect(() => {
    if (focusedLocation) {
      map.flyTo([focusedLocation.lat, focusedLocation.lng], 17, {
        duration: 0.8,
      })
      const marker = markerRefs.current[focusedLocation.id]
      if (marker) {
        marker.openPopup()
      }
    }
  }, [focusedLocation, map, markerRefs])

  return null
}

export default function CampusMap({
  locations,
  universityCenter,
  focusedLocationId,
  height = '460px',
  onPinClick,
}: CampusMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({})

  useEffect(() => {
    setupLeafletIcons()
  }, [])

  // Determine initial center
  let centerLat = 20.5937
  let centerLng = 78.9629
  let zoom = 5

  if (universityCenter?.lat && universityCenter?.lng) {
    centerLat = universityCenter.lat
    centerLng = universityCenter.lng
    zoom = 15
  } else if (locations.length > 0) {
    const avgLat = locations.reduce((sum, l) => sum + l.lat, 0) / locations.length
    const avgLng = locations.reduce((sum, l) => sum + l.lng, 0) / locations.length
    centerLat = avgLat
    centerLng = avgLng
    zoom = 15
  }

  const focusedLocation = locations.find((l) => l.id === focusedLocationId)

  return (
    <div
      style={{ height, minHeight: height, width: '100%' }}
      className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm z-10"
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController
          focusedLocation={focusedLocation}
          markerRefs={markerRefs}
        />

        {locations.map((loc) => {
          const isFocused = loc.id === focusedLocationId
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createLocationIcon(loc.type, isFocused)}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[loc.id] = ref
                }
              }}
              eventHandlers={{
                click: () => {
                  onPinClick?.(loc.id)
                },
              }}
            >
              <Popup className="campus-map-popup">
                <div className="p-1 min-w-[180px] max-w-[240px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-zinc-900 leading-tight">
                      {loc.name}
                    </span>
                    <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {loc.type}
                    </span>
                  </div>

                  {loc.photo_url && (
                    <div className="mb-2">
                      <LocationPhoto
                        src={loc.photo_url}
                        alt={`${loc.name} location`}
                        className="aspect-[4/3]"
                      />
                    </div>
                  )}

                  {loc.description && (
                    <p className="text-xs text-zinc-600 mb-2 leading-relaxed">
                      {loc.description}
                    </p>
                  )}

                  {loc.faculty && loc.faculty.length > 0 && (
                    <div className="mb-2 border-t border-zinc-100 pt-2">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                        Faculty here
                      </p>
                      <ul className="space-y-1">
                        {loc.faculty.map((member) => (
                          <li key={member.id} className="text-xs text-zinc-700">
                            {member.name}
                            {member.cabin_number && (
                              <span className="text-zinc-500">
                                {' '}
                                · Cabin {member.cabin_number}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    Get directions
                  </a>

                  <div className="text-[10px] font-mono text-zinc-400 border-t border-zinc-100 pt-1 mt-1">
                    {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
