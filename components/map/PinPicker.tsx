'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { setupLeafletIcons, createPickerIcon } from './LeafletIcons'
import { MapPin, Navigation } from 'lucide-react'

interface PinPickerProps {
  initialLat?: number | null
  initialLng?: number | null
  onChange: (coords: { lat: number; lng: number }) => void
  universityCenter?: { lat: number; lng: number } | null
  height?: string
}

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function PinPicker({
  initialLat,
  initialLng,
  onChange,
  universityCenter,
  height = '320px',
}: PinPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const [prevInitial, setPrevInitial] = useState({ lat: initialLat, lng: initialLng })

  if (prevInitial.lat !== initialLat || prevInitial.lng !== initialLng) {
    setPrevInitial({ lat: initialLat, lng: initialLng })
    setPosition(initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null)
  }

  useEffect(() => {
    setupLeafletIcons()
  }, [])

  const pickerIcon = useMemo(() => createPickerIcon(), [])

  // Determine initial center
  let centerLat = 20.5937
  let centerLng = 78.9629
  let zoom = 5

  if (position) {
    centerLat = position.lat
    centerLng = position.lng
    zoom = 16
  } else if (universityCenter?.lat && universityCenter?.lng) {
    centerLat = universityCenter.lat
    centerLng = universityCenter.lng
    zoom = 16
  }

  const handlePositionChange = (lat: number, lng: number) => {
    const coords = { lat, lng }
    setPosition(coords)
    onChange(coords)
  }

  return (
    <div className="w-full space-y-2">
      <div
        style={{ height, minHeight: height, width: '100%' }}
        className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xs z-10"
      >
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-10 cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onMapClick={handlePositionChange} />

          {position && (
            <Marker
              position={[position.lat, position.lng]}
              icon={pickerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker
                  const latLng = marker.getLatLng()
                  handlePositionChange(latLng.lat, latLng.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinate status readout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs px-1 text-zinc-500 dark:text-zinc-400 gap-1">
        {position ? (
          <div className="flex items-center gap-1.5 font-mono text-zinc-800 dark:text-zinc-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Navigation className="w-3.5 h-3.5" />
            <span>Click on the map to drop a pin</span>
          </div>
        )}

        <span className="text-[11px] text-zinc-400">
          Click map to place or drag pin to adjust
        </span>
      </div>
    </div>
  )
}
