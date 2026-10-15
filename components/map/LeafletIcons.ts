import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function setupLeafletIcons() {
  if (typeof window === 'undefined') return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

export function createLocationIcon(type: string, isFocused = false) {
  const colors: Record<string, string> = {
    library: '#2563eb', // blue
    canteen: '#ea580c', // orange
    block: '#4f46e5',   // indigo
    hostel: '#9333ea',  // purple
    ground: '#059669',  // emerald
    gate: '#334155',    // slate
    parking: '#0891b2', // cyan
    other: '#e11d48',   // rose
  }

  const color = colors[type] || '#4f46e5'
  const size = isFocused ? 38 : 30
  const glow = isFocused
    ? `filter: drop-shadow(0 0 10px ${color}); transform: scale(1.15);`
    : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));'

  const html = `
    <div style="display:flex;align-items:center;justify-content:center;cursor:pointer;${glow};transition:all 0.2s ease;">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
        <circle cx="12" cy="9" r="2.5" fill="#ffffff"></circle>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-campus-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export function createPickerIcon() {
  const html = `
    <div style="display:flex;align-items:center;justify-content:center;cursor:grab;filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1.8">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
        <circle cx="12" cy="9" r="2.8" fill="#ffffff"></circle>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-picker-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}
