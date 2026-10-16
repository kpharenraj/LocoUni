'use client'

import dynamic from 'next/dynamic'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import {
  updateUniversityAction,
  type UpdateUniversityActionState,
} from '@/app/actions/university'
import { useToast } from '@/components/ui/ToastProvider'

const PinPicker = dynamic(() => import('@/components/map/PinPicker'), { ssr: false })

type UniversitySettingsValues = {
  name: string
  city: string
  country: string
  website: string
  description: string
  logoUrl: string | null
  lat: number | null
  lng: number | null
}

type FieldName = 'name' | 'city' | 'country' | 'website' | 'description' | 'lat' | 'lng' | 'logo'

const initialActionState: UpdateUniversityActionState = {}

export default function UniversitySettingsForm({
  initialValues,
}: {
  initialValues: UniversitySettingsValues
}) {
  const [state, formAction, pending] = useActionState(updateUniversityAction, initialActionState)
  const [coordinates, setCoordinates] = useState({
    lat: initialValues.lat?.toString() ?? '',
    lng: initialValues.lng?.toString() ?? '',
  })
  const [removeLogo, setRemoveLogo] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : initialValues.logoUrl),
    [initialValues.logoUrl, selectedFile]
  )
  const logoVisible = Boolean(previewUrl) && !removeLogo

  useEffect(() => {
    if (selectedFile) return () => URL.revokeObjectURL(previewUrl ?? '')
  }, [previewUrl, selectedFile])

  useEffect(() => {
    if (state.success) {
      showToast(
        state.warning ? `University settings saved. ${state.warning}` : 'University settings saved.',
        state.warning ? 'error' : 'success'
      )
    }
  }, [showToast, state.success, state.updatedAt, state.warning])

  const fieldError = (name: FieldName) => state.fieldErrors?.[name]?.[0]

  return (
    <form action={formAction} className="space-y-7">
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>University name <span className="text-red-600">*</span></span>
          <input
            name="name"
            required
            defaultValue={initialValues.name}
            aria-invalid={Boolean(fieldError('name'))}
            className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <FieldError message={fieldError('name')} />
        </label>

        <TextField label="City" name="city" defaultValue={initialValues.city} error={fieldError('city')} />
        <TextField label="Country" name="country" defaultValue={initialValues.country} error={fieldError('country')} />
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>Website</span>
          <input
            name="website"
            type="url"
            inputMode="url"
            placeholder="https://example.edu"
            defaultValue={initialValues.website}
            aria-invalid={Boolean(fieldError('website'))}
            className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <FieldError message={fieldError('website')} />
        </label>
        <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            maxLength={1000}
            defaultValue={initialValues.description}
            aria-invalid={Boolean(fieldError('description'))}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <FieldError message={fieldError('description')} />
        </label>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Campus location</legend>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Click the map to set the campus center, or enter coordinates.</p>
        <PinPicker
          initialLat={coordinates.lat.trim() ? Number(coordinates.lat) : null}
          initialLng={coordinates.lng.trim() ? Number(coordinates.lng) : null}
          onChange={({ lat, lng }) => setCoordinates({ lat: lat.toString(), lng: lng.toString() })}
          height="280px"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span>Latitude</span>
            <input
              name="lat"
              type="number"
              step="any"
              min="-90"
              max="90"
              value={coordinates.lat}
              onChange={(event) => setCoordinates((current) => ({ ...current, lat: event.target.value }))}
              aria-invalid={Boolean(fieldError('lat'))}
              className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <FieldError message={fieldError('lat')} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span>Longitude</span>
            <input
              name="lng"
              type="number"
              step="any"
              min="-180"
              max="180"
              value={coordinates.lng}
              onChange={(event) => setCoordinates((current) => ({ ...current, lng: event.target.value }))}
              aria-invalid={Boolean(fieldError('lng'))}
              className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <FieldError message={fieldError('lng')} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">University logo</legend>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950">
            {logoVisible ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl ?? ''} alt="University logo preview" className="h-full w-full object-contain" />
            ) : (
              <span className="px-2 text-center text-xs text-zinc-500">No logo</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-indigo-600 dark:border-zinc-700 dark:hover:bg-zinc-800">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose logo
              <input
                type="file"
                name="logo"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                ref={logoInputRef}
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null)
                  setRemoveLogo(false)
                }}
              />
            </label>
            {(initialValues.logoUrl || selectedFile) && (
              <button
                type="button"
                onClick={() => {
                  setRemoveLogo((current) => !current && Boolean(initialValues.logoUrl))
                  setSelectedFile(null)
                  if (logoInputRef.current) logoInputRef.current.value = ''
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {removeLogo ? <Upload className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {removeLogo ? 'Keep logo' : 'Remove logo'}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500">JPG, PNG, or WebP. Maximum file size: 2 MB.</p>
        <FieldError message={fieldError('logo')} />
        {removeLogo && <input type="hidden" name="removeLogo" value="true" />}
      </fieldset>

      <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function TextField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string
  name: string
  defaultValue: string
  error?: string
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <FieldError message={error} />
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="block text-xs font-normal text-red-600 dark:text-red-400">{message}</span>
}
