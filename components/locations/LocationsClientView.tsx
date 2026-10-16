'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import AdminBackLink from '@/components/admin/AdminBackLink'
import {
  createLocationAction,
  updateLocationAction,
  deleteLocationAction,
} from '@/app/actions/locations'
import type { LocationType } from '@/lib/validation'
import { useToast } from '@/components/ui/ToastProvider'
import {
  MapPin,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Navigation,
  X,
  Loader2,
  AlertCircle,
  Building,
  Coffee,
  BookOpen,
  Home,
  Flag,
  Car,
  Layers,
  Search,
} from 'lucide-react'

// Dynamically load Leaflet components with ssr: false
const CampusMap = dynamic(() => import('@/components/map/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse flex items-center justify-center text-sm text-zinc-400">
      Loading campus map...
    </div>
  ),
})

const PinPicker = dynamic(() => import('@/components/map/PinPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse flex items-center justify-center text-sm text-zinc-400">
      Loading pin picker...
    </div>
  ),
})

export interface LocationItem {
  id: string
  name: string
  type: string
  description?: string | null
  photo_url?: string | null
  lat: number
  lng: number
  created_at?: string
}

interface LocationsClientViewProps {
  locations: LocationItem[]
  universityCenter?: { lat: number; lng: number } | null
  universityName?: string
}

async function compressLocationPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Unable to prepare the photo in this browser.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('Unable to compress the photo.')),
      'image/jpeg',
      0.8
    )
  })
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

const LOCATION_TYPES: { value: LocationType; label: string; icon: typeof Building; color: string }[] = [
  { value: 'block', label: 'Academic / Admin Block', icon: Building, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300' },
  { value: 'library', label: 'Library', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' },
  { value: 'canteen', label: 'Canteen / Cafeteria', icon: Coffee, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300' },
  { value: 'hostel', label: 'Hostel / Residence', icon: Home, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300' },
  { value: 'ground', label: 'Sports Ground / Arena', icon: Flag, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { value: 'gate', label: 'Campus Gate / Entrance', icon: Navigation, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300' },
  { value: 'parking', label: 'Parking Area', icon: Car, color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300' },
  { value: 'other', label: 'Other Facility', icon: Layers, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300' },
]

export default function LocationsClientView({
  locations,
  universityCenter,
  universityName,
}: LocationsClientViewProps) {
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeLocation, setActiveLocation] = useState<LocationItem | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<LocationItem | null>(null)

  // Form field states
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<LocationType>('block')
  const [formDescription, setFormDescription] = useState('')
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [formPhoto, setFormPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const photoPreviewUrl = useMemo(
    () => (formPhoto ? URL.createObjectURL(formPhoto) : activeLocation?.photo_url ?? null),
    [activeLocation?.photo_url, formPhoto]
  )

  useEffect(() => {
    if (formPhoto) return () => URL.revokeObjectURL(photoPreviewUrl ?? '')
  }, [formPhoto, photoPreviewUrl])

  const resetPhotoForm = () => {
    setFormPhoto(null)
    setRemovePhoto(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const openCreateModal = () => {
    setModalMode('create')
    setActiveLocation(null)
    setFormName('')
    setFormType('block')
    setFormDescription('')
    resetPhotoForm()
    setFormCoords(
      universityCenter?.lat != null && universityCenter?.lng != null
        ? { lat: universityCenter.lat, lng: universityCenter.lng }
        : locations.length > 0
        ? { lat: locations[0].lat, lng: locations[0].lng }
        : null
    )
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (loc: LocationItem) => {
    setModalMode('edit')
    setActiveLocation(loc)
    setFormName(loc.name)
    setFormType((loc.type as LocationType) || 'other')
    setFormDescription(loc.description || '')
    resetPhotoForm()
    setFormCoords({ lat: loc.lat, lng: loc.lng })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handlePhotoSelection = async (file: File | undefined) => {
    if (!file) {
      setFormPhoto(null)
      setRemovePhoto(false)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setFormError('Photo must be a JPG, PNG, or WebP image.')
      if (photoInputRef.current) photoInputRef.current.value = ''
      return
    }

    setFormError(null)
    setIsCompressingPhoto(true)
    try {
      const compressed = file.size <= 2 * 1024 * 1024 ? file : await compressLocationPhoto(file)
      if (compressed.size > 2 * 1024 * 1024) {
        setFormError('Photo must be 2 MB or smaller. Choose a smaller image.')
        if (photoInputRef.current) photoInputRef.current.value = ''
        return
      }
      setFormPhoto(compressed)
      setRemovePhoto(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to prepare the photo.')
      if (photoInputRef.current) photoInputRef.current.value = ''
    } finally {
      setIsCompressingPhoto(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (isCompressingPhoto) {
      setFormError('Please wait for the photo to finish preparing.')
      return
    }

    if (!formName.trim()) {
      setFormError('Location name is required.')
      return
    }

    if (!formCoords) {
      setFormError('Please drop a pin on the map to set the coordinates.')
      return
    }

    const formData = new FormData()
    formData.append('name', formName.trim())
    formData.append('type', formType)
    formData.append('description', formDescription.trim())
    formData.append('lat', formCoords.lat.toString())
    formData.append('lng', formCoords.lng.toString())
    if (formPhoto) formData.append('photo', formPhoto)
    if (modalMode === 'edit' && removePhoto) formData.append('removePhoto', 'true')

    startTransition(async () => {
      if (modalMode === 'create') {
        const res = await createLocationAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to create location.')
        } else {
          setIsModalOpen(false)
          showToast(res.warning ?? 'Location created.', res.warning ? 'error' : 'success')
        }
      } else if (modalMode === 'edit' && activeLocation) {
        formData.append('id', activeLocation.id)
        const res = await updateLocationAction(null, formData)
        if (!res.success) {
          setFormError(res.error || 'Failed to update location.')
        } else {
          setIsModalOpen(false)
          showToast(res.warning ?? 'Location updated.', res.warning ? 'error' : 'success')
        }
      }
    })
  }

  const handleDelete = () => {
    if (!deleteCandidate) return

    startTransition(async () => {
      const res = await deleteLocationAction(deleteCandidate.id)
      if (res.success) {
        if (focusedLocationId === deleteCandidate.id) {
          setFocusedLocationId(null)
        }
        setDeleteCandidate(null)
        showToast(res.warning ?? 'Location deleted.', res.warning ? 'error' : 'success')
      } else {
        showToast(res.error || 'Failed to delete location.', 'error')
      }
    })
  }

  // Filtered locations
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedTypeFilter === 'all' || loc.type === selectedTypeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AdminBackLink />
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-xs text-zinc-400">Campus Locations</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Locations Management
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {universityName ? `${universityName} — ` : ''}Drop map pins for buildings, facilities, and campus landmarks
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Main Map Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>Interactive Campus Map</span>
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">
                ({locations.length} {locations.length === 1 ? 'place' : 'places'} mapped)
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Click a pin to view details or click a location in the list below to zoom in
            </p>
          </div>

          {focusedLocationId && (
            <button
              onClick={() => setFocusedLocationId(null)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Reset focus view</span>
            </button>
          )}
        </div>

        {locations.length > 0 ? (
          <CampusMap
            locations={locations}
            universityCenter={universityCenter}
            focusedLocationId={focusedLocationId}
            onPinClick={(id) => setFocusedLocationId(id)}
            height="460px"
          />
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-10 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
            <MapPin className="h-9 w-9 text-zinc-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Your campus map is ready for its first pin
            </p>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Add a building or facility to start mapping your campus.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add first location
            </button>
          </div>
        )}
      </div>

      {/* Locations List / Table Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              aria-label="Search locations by name or description"
              placeholder="Search location by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              aria-label="Filter locations by type"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types ({locations.length})</option>
              {LOCATION_TYPES.map((t) => {
                const count = locations.filter((l) => l.type === t.value).length
                return (
                  <option key={t.value} value={t.value}>
                    {t.label} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Locations List */}
        {filteredLocations.length === 0 ? (
          <div className="text-center py-14 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <MapPin className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              {locations.length === 0
                ? 'No locations added yet'
                : 'No locations matching your search'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {locations.length === 0
                ? 'Add your first building, cafeteria, or library so students can navigate the campus.'
                : 'Try adjusting your search query or filter to see campus places.'}
            </p>
            {locations.length === 0 && (
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Location</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <th className="pb-3 pl-2">Name &amp; Type</th>
                  <th className="pb-3 hidden md:table-cell">Description</th>
                  <th className="pb-3">Coordinates</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredLocations.map((loc) => {
                  const isFocused = loc.id === focusedLocationId
                  const typeObj = LOCATION_TYPES.find((t) => t.value === loc.type)

                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setFocusedLocationId(loc.id)}
                      className={`group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                        isFocused
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          {loc.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={loc.photo_url}
                              alt=""
                              loading="lazy"
                              className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                            />
                          ) : (
                            <span
                              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                                typeObj ? typeObj.color : 'text-zinc-600 bg-zinc-100'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {loc.name}
                            </div>
                            <span className="inline-block mt-0.5 text-[11px] capitalize font-medium text-zinc-500 dark:text-zinc-400">
                              {typeObj?.label || loc.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400 hidden md:table-cell max-w-xs truncate text-xs">
                        {loc.description || '—'}
                      </td>

                      <td className="py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            title="Focus on Map"
                            aria-label={`Focus map on ${loc.name}`}
                            onClick={() => setFocusedLocationId(loc.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isFocused
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Edit Location"
                            aria-label={`Edit ${loc.name}`}
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Delete Location"
                            aria-label={`Delete ${loc.name}`}
                            onClick={() => setDeleteCandidate(loc)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:bg-red-50 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Location Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl shrink-0 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {modalMode === 'create' ? 'Add Campus Location' : 'Edit Campus Location'}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close location dialog"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Location Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  aria-label="Location name"
                  required
                  placeholder="e.g. Central Library, Science Block A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Location type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as LocationType)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {LOCATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  aria-label="Location description"
                  rows={2}
                  placeholder="Brief details such as floor info, opening hours, or landmarks..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-y"
                />
              </div>

              {/* Optional Location Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Photo (Optional)
                </label>
                {photoPreviewUrl && !removePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreviewUrl}
                    alt="Location photo preview"
                    className="aspect-[4/3] w-full max-w-sm rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">
                    <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-zinc-300 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    Choose photo
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      disabled={isCompressingPhoto || isPending}
                      onChange={(event) => void handlePhotoSelection(event.target.files?.[0])}
                    />
                  </label>
                  {(activeLocation?.photo_url || formPhoto) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormPhoto(null)
                        if (photoInputRef.current) photoInputRef.current.value = ''
                        if (activeLocation?.photo_url) {
                          setRemovePhoto((current) => !current)
                        } else {
                          setRemovePhoto(false)
                        }
                      }}
                      className="inline-flex min-h-10 items-center rounded-xl border border-zinc-300 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {removePhoto ? 'Keep current photo' : 'Remove photo'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  JPG, PNG, or WebP. Maximum 2 MB. Larger photos are resized and compressed before upload.
                </p>
                {isCompressingPhoto && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Preparing photo…</p>
                )}
              </div>

              {/* PinPicker Map */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pin Location on Map <span className="text-red-500">*</span>
                </label>
                <PinPicker
                  initialLat={formCoords?.lat}
                  initialLng={formCoords?.lng}
                  universityCenter={universityCenter}
                  onChange={(coords) => setFormCoords(coords)}
                  height="260px"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending || isCompressingPhoto}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Create Location' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md shrink-0 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
              <span className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Delete Location?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteCandidate.name}</span>? Any faculty members linked to this place will have their location unlinked.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPending || isCompressingPhoto}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {(isPending || isCompressingPhoto) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
