'use server'

import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  createLocationSchema,
  updateLocationSchema,
  type LocationType,
} from '@/lib/validation'
import { revalidatePath } from 'next/cache'

const PHOTO_BUCKET = 'location-photos'
const MAX_PHOTO_SIZE = 2 * 1024 * 1024
type PhotoExtension = 'jpg' | 'png' | 'webp'

export interface LocationActionState {
  success?: boolean
  error?: string
  warning?: string
  fieldErrors?: {
    name?: string[]
    type?: string[]
    description?: string[]
    lat?: string[]
    lng?: string[]
    photo?: string[]
  }
}

function getPhotoExtension(file: File): PhotoExtension | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (file.type === 'image/jpeg' && (extension === 'jpg' || extension === 'jpeg')) return 'jpg'
  if (file.type === 'image/png' && extension === 'png') return 'png'
  if (file.type === 'image/webp' && extension === 'webp') return 'webp'
  return null
}

async function hasValidPhotoSignature(file: File, extension: PhotoExtension): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (extension === 'jpg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (extension === 'png') {
    return bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  }
  return bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
}

async function validateLocationPhoto(value: FormDataEntryValue | null) {
  const file = value instanceof File && value.size > 0 ? value : null
  if (!file) return { file: null, extension: null, error: null }
  if (file.size > MAX_PHOTO_SIZE) {
    return { file, extension: null, error: 'Photo must be 2 MB or smaller after compression.' }
  }

  const extension = getPhotoExtension(file)
  if (!extension || !(await hasValidPhotoSignature(file, extension))) {
    return { file, extension: null, error: 'Photo must be a valid JPG, PNG, or WebP image.' }
  }
  return { file, extension, error: null }
}

function getLocationPhotoPath(photoUrl: string | null, universityId: string): string | null {
  if (!photoUrl) return null
  try {
    const pathname = new URL(photoUrl).pathname
    const marker = `/storage/v1/object/public/${PHOTO_BUCKET}/`
    const markerIndex = pathname.indexOf(marker)
    if (markerIndex < 0) return null
    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length))
    return path.startsWith(`${universityId}/`) ? path : null
  } catch {
    return null
  }
}

async function uploadLocationPhoto(
  universityId: string,
  locationId: string,
  file: File,
  extension: PhotoExtension
) {
  const path = `${universityId}/${locationId}.${extension}`
  const adminClient = createAdminClient()
  const { error } = await adminClient.storage.from(PHOTO_BUCKET).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: file.type, upsert: true }
  )
  if (error) throw new Error(error.message)

  const { data } = adminClient.storage.from(PHOTO_BUCKET).getPublicUrl(path)
  const url = new URL(data.publicUrl)
  url.searchParams.set('v', Date.now().toString())
  return { path, url: url.toString(), adminClient }
}

function getValidationError(fieldErrors: LocationActionState['fieldErrors']) {
  return fieldErrors?.name?.[0] ||
    fieldErrors?.lat?.[0] ||
    fieldErrors?.lng?.[0] ||
    fieldErrors?.type?.[0] ||
    fieldErrors?.photo?.[0] ||
    'Invalid location details'
}

async function cleanupPhoto(uploaded: Awaited<ReturnType<typeof uploadLocationPhoto>>) {
  try {
    const { error } = await uploaded.adminClient.storage.from(PHOTO_BUCKET).remove([uploaded.path])
    if (error) console.error('Failed to clean up campus location photo:', error.message)
  } catch (error) {
    console.error('Failed to clean up campus location photo:', error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function createLocationAction(
  _prevState: LocationActionState | null,
  formData: FormData
): Promise<LocationActionState> {
  const { universityId } = await requireAdmin()
  const result = createLocationSchema.safeParse({
    name: formData.get('name')?.toString() || '',
    type: formData.get('type')?.toString() as LocationType,
    description: formData.get('description')?.toString() || '',
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })
  const photo = await validateLocationPhoto(formData.get('photo'))
  const fieldErrors: LocationActionState['fieldErrors'] = result.success
    ? {}
    : result.error.flatten().fieldErrors
  if (photo.error) fieldErrors.photo = [photo.error]
  if (!result.success || photo.error) {
    return { success: false, error: getValidationError(fieldErrors), fieldErrors }
  }

  const supabase = await createClient()
  const { data: location, error: insertError } = await supabase
    .from('locations')
    .insert({
      university_id: universityId,
      name: result.data.name,
      type: result.data.type,
      description: result.data.description || null,
      lat: result.data.lat,
      lng: result.data.lng,
    })
    .select('id')
    .single()

  if (insertError || !location) {
    return { success: false, error: insertError?.message || 'Failed to create campus location.' }
  }

  if (photo.file && photo.extension) {
    let uploaded: Awaited<ReturnType<typeof uploadLocationPhoto>> | null = null
    try {
      uploaded = await uploadLocationPhoto(universityId, location.id, photo.file, photo.extension)
      const { data: updated, error: photoUpdateError } = await supabase
        .from('locations')
        .update({ photo_url: uploaded.url })
        .eq('id', location.id)
        .eq('university_id', universityId)
        .select('id')
        .maybeSingle()

      if (photoUpdateError || !updated) {
        console.error('Failed to save campus location photo:', photoUpdateError?.message ?? 'No location row was updated')
        await cleanupPhoto(uploaded)
        const { error: rollbackError } = await supabase
          .from('locations')
          .delete()
          .eq('id', location.id)
          .eq('university_id', universityId)
        if (rollbackError) console.error('Failed to roll back campus location creation:', rollbackError.message)
        return { success: false, error: 'Unable to save the location photo. Please try again.' }
      }
    } catch (error) {
      console.error('Failed to create campus location photo:', error instanceof Error ? error.message : 'Unknown error')
      if (uploaded) await cleanupPhoto(uploaded)
      const { error: rollbackError } = await supabase
        .from('locations')
        .delete()
        .eq('id', location.id)
        .eq('university_id', universityId)
      if (rollbackError) console.error('Failed to roll back campus location creation:', rollbackError.message)
      return { success: false, error: 'Unable to upload the location photo. Please try again.' }
    }
  }

  revalidatePath('/admin/locations')
  revalidatePath(`/u/${universityId}/map`)
  return { success: true }
}

export async function updateLocationAction(
  _prevState: LocationActionState | null,
  formData: FormData
): Promise<LocationActionState> {
  const { universityId } = await requireAdmin()
  const removePhoto = formData.get('removePhoto') === 'true'
  const result = updateLocationSchema.safeParse({
    id: formData.get('id')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    type: formData.get('type')?.toString() as LocationType,
    description: formData.get('description')?.toString() || '',
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })
  const photo = await validateLocationPhoto(formData.get('photo'))
  const fieldErrors: LocationActionState['fieldErrors'] = result.success
    ? {}
    : result.error.flatten().fieldErrors
  if (photo.error) fieldErrors.photo = [photo.error]
  if (photo.file && removePhoto) {
    fieldErrors.photo = ['Choose a photo to upload or remove the current photo, not both.']
  }
  if (!result.success || photo.error || (photo.file && removePhoto)) {
    return { success: false, error: getValidationError(fieldErrors), fieldErrors }
  }

  const supabase = await createClient()
  const { data: currentLocation, error: currentError } = await supabase
    .from('locations')
    .select('photo_url')
    .eq('id', result.data.id)
    .eq('university_id', universityId)
    .maybeSingle()

  if (currentError || !currentLocation) {
    return { success: false, error: 'Location not found for this university.' }
  }

  const oldPhotoPath = getLocationPhotoPath(currentLocation.photo_url, universityId)
  let uploaded: Awaited<ReturnType<typeof uploadLocationPhoto>> | null = null
  if (photo.file && photo.extension) {
    try {
      uploaded = await uploadLocationPhoto(universityId, result.data.id, photo.file, photo.extension)
    } catch (error) {
      console.error('Failed to upload campus location photo:', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: 'Unable to upload the location photo. Please try again.' }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('locations')
    .update({
      name: result.data.name,
      type: result.data.type,
      description: result.data.description || null,
      lat: result.data.lat,
      lng: result.data.lng,
      ...(uploaded ? { photo_url: uploaded.url } : removePhoto ? { photo_url: null } : {}),
    })
    .eq('id', result.data.id)
    .eq('university_id', universityId)
    .select('id')
    .maybeSingle()

  if (updateError || !updated) {
    if (uploaded) await cleanupPhoto(uploaded)
    return { success: false, error: updateError?.message || 'Failed to update campus location.' }
  }

  const pathToRemove = removePhoto
    ? oldPhotoPath
    : uploaded && uploaded.path !== oldPhotoPath
      ? oldPhotoPath
      : null
  let warning: string | undefined
  if (pathToRemove) {
    try {
      const adminClient = uploaded?.adminClient ?? createAdminClient()
      const { error: removeError } = await adminClient.storage.from(PHOTO_BUCKET).remove([pathToRemove])
      if (removeError) {
        console.error('Failed to remove old campus location photo:', removeError.message)
        warning = 'Location saved, but the previous photo could not be removed.'
      }
    } catch (error) {
      console.error('Failed to remove old campus location photo:', error instanceof Error ? error.message : 'Unknown error')
      warning = 'Location saved, but the previous photo could not be removed.'
    }
  }

  revalidatePath('/admin/locations')
  revalidatePath(`/u/${universityId}/map`)
  return { success: true, warning }
}

export async function deleteLocationAction(
  locationId: string
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const { universityId } = await requireAdmin()
  if (!locationId) return { success: false, error: 'Location ID is required.' }

  const supabase = await createClient()
  const { data: location, error: loadError } = await supabase
    .from('locations')
    .select('photo_url')
    .eq('id', locationId)
    .eq('university_id', universityId)
    .maybeSingle()
  if (loadError || !location) return { success: false, error: 'Location not found for this university.' }

  const { data: deleted, error: deleteError } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId)
    .eq('university_id', universityId)
    .select('id')
    .maybeSingle()
  if (deleteError || !deleted) {
    return { success: false, error: deleteError?.message || 'Failed to delete campus location.' }
  }

  let warning: string | undefined
  const photoPath = getLocationPhotoPath(location.photo_url, universityId)
  if (photoPath) {
    try {
      const { error: removeError } = await createAdminClient().storage.from(PHOTO_BUCKET).remove([photoPath])
      if (removeError) {
        console.error('Failed to remove deleted campus location photo:', removeError.message)
        warning = 'Location deleted, but its photo could not be removed.'
      }
    } catch (error) {
      console.error('Failed to remove deleted campus location photo:', error instanceof Error ? error.message : 'Unknown error')
      warning = 'Location deleted, but its photo could not be removed.'
    }
  }

  revalidatePath('/admin/locations')
  revalidatePath(`/u/${universityId}/map`)
  return { success: true, warning }
}
