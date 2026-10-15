'use server'

import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  createLocationSchema,
  updateLocationSchema,
  type LocationType,
} from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export interface LocationActionState {
  success?: boolean
  error?: string
  fieldErrors?: {
    name?: string[]
    type?: string[]
    description?: string[]
    lat?: string[]
    lng?: string[]
  }
}

export async function createLocationAction(
  _prevState: LocationActionState | null,
  formData: FormData
): Promise<LocationActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    name: formData.get('name')?.toString() || '',
    type: formData.get('type')?.toString() as LocationType,
    description: formData.get('description')?.toString() || '',
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  }

  const result = createLocationSchema.safeParse(rawData)

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const error =
      fieldErrors.name?.[0] ||
      fieldErrors.lat?.[0] ||
      fieldErrors.lng?.[0] ||
      fieldErrors.type?.[0] ||
      'Invalid location details'

    return {
      success: false,
      error,
      fieldErrors,
    }
  }

  const supabase = await createClient()

  const { error: dbError } = await supabase.from('locations').insert({
    university_id: universityId,
    name: result.data.name,
    type: result.data.type,
    description: result.data.description || null,
    lat: result.data.lat,
    lng: result.data.lng,
  })

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to create campus location.',
    }
  }

  revalidatePath('/admin/locations')
  return { success: true }
}

export async function updateLocationAction(
  _prevState: LocationActionState | null,
  formData: FormData
): Promise<LocationActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    id: formData.get('id')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    type: formData.get('type')?.toString() as LocationType,
    description: formData.get('description')?.toString() || '',
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  }

  const result = updateLocationSchema.safeParse(rawData)

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    const error =
      fieldErrors.name?.[0] ||
      fieldErrors.lat?.[0] ||
      fieldErrors.lng?.[0] ||
      fieldErrors.type?.[0] ||
      'Invalid location details'

    return {
      success: false,
      error,
      fieldErrors,
    }
  }

  const supabase = await createClient()

  const { error: dbError } = await supabase
    .from('locations')
    .update({
      name: result.data.name,
      type: result.data.type,
      description: result.data.description || null,
      lat: result.data.lat,
      lng: result.data.lng,
    })
    .eq('id', result.data.id)
    .eq('university_id', universityId)

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to update campus location.',
    }
  }

  revalidatePath('/admin/locations')
  return { success: true }
}

export async function deleteLocationAction(locationId: string): Promise<{ success: boolean; error?: string }> {
  const { universityId } = await requireAdmin()

  if (!locationId) {
    return { success: false, error: 'Location ID is required.' }
  }

  const supabase = await createClient()

  const { error: dbError } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId)
    .eq('university_id', universityId)

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to delete location.',
    }
  }

  revalidatePath('/admin/locations')
  return { success: true }
}
