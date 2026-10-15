'use server'

import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createFacultySchema,
  updateFacultySchema,
} from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export interface FacultyActionState {
  success?: boolean
  error?: string
  fieldErrors?: {
    name?: string[]
    role?: string[]
    department?: string[]
    cabin_number?: string[]
    location_id?: string[]
    email?: string[]
    phone?: string[]
    photo?: string[]
  }
}

function getPhotoExtension(filename: string, mimeType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

function validatePhotoFile(photo: File | null): { valid: boolean; error?: string } {
  if (!photo || photo.size === 0) return { valid: true }
  const maxSizeBytes = 2 * 1024 * 1024 // 2 MB
  if (photo.size > maxSizeBytes) {
    return { valid: false, error: 'Photo size must not exceed 2 MB.' }
  }
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const lowerName = photo.name.toLowerCase()
  const validExts = ['.jpg', '.jpeg', '.png', '.webp']
  const hasValidExt = validExts.some((ext) => lowerName.endsWith(ext))

  if (!validTypes.includes(photo.type) && !hasValidExt) {
    return { valid: false, error: 'Photo must be a JPG, PNG, or WebP image.' }
  }
  return { valid: true }
}

export async function createFacultyAction(
  _prevState: FacultyActionState | null,
  formData: FormData
): Promise<FacultyActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    name: formData.get('name')?.toString() || '',
    role: formData.get('role')?.toString() || '',
    department: formData.get('department')?.toString() || '',
    cabin_number: formData.get('cabin_number')?.toString() || '',
    location_id: formData.get('location_id')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
  }

  const validation = createFacultySchema.safeParse(rawData)
  const photoFile = formData.get('photo') as File | null

  const fieldErrors: FacultyActionState['fieldErrors'] = {}

  if (!validation.success) {
    const zodErrors = validation.error.flatten().fieldErrors
    Object.assign(fieldErrors, zodErrors)
  }

  const photoCheck = validatePhotoFile(photoFile)
  if (!photoCheck.valid) {
    fieldErrors.photo = [photoCheck.error!]
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstErrorMessage =
      fieldErrors.name?.[0] ||
      fieldErrors.email?.[0] ||
      fieldErrors.photo?.[0] ||
      fieldErrors.location_id?.[0] ||
      'Please correct the highlighted fields.'

    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    }
  }

  const validated = validation.data!
  const supabase = await createClient()

  // Verify chosen location_id belongs to this university
  if (validated.location_id) {
    const { data: loc } = await supabase
      .from('locations')
      .select('id')
      .eq('id', validated.location_id)
      .eq('university_id', universityId)
      .maybeSingle()

    if (!loc) {
      return {
        success: false,
        error: 'The selected campus location does not belong to your university.',
        fieldErrors: {
          location_id: ['Invalid campus location selected.'],
        },
      }
    }
  }

  const facultyId = crypto.randomUUID()
  let photoUrl: string | null = null

  if (photoFile && photoFile.size > 0) {
    const ext = getPhotoExtension(photoFile.name, photoFile.type)
    const filePath = `${universityId}/${facultyId}.${ext}`
    const buffer = Buffer.from(await photoFile.arrayBuffer())

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('faculty-photos')
      .upload(filePath, buffer, {
        contentType: photoFile.type || `image/${ext}`,
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Photo upload failed: ${uploadError.message}`,
      }
    }

    const { data: urlData } = adminClient.storage
      .from('faculty-photos')
      .getPublicUrl(filePath)

    photoUrl = urlData.publicUrl
  }

  const { error: dbError } = await supabase.from('faculty').insert({
    id: facultyId,
    university_id: universityId,
    name: validated.name,
    role: validated.role || null,
    department: validated.department || null,
    cabin_number: validated.cabin_number || null,
    location_id: validated.location_id || null,
    photo_url: photoUrl,
    email: validated.email || null,
    phone: validated.phone || null,
  })

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to create faculty member.',
    }
  }

  revalidatePath('/admin/faculty')
  return { success: true }
}

export async function updateFacultyAction(
  _prevState: FacultyActionState | null,
  formData: FormData
): Promise<FacultyActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    id: formData.get('id')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    role: formData.get('role')?.toString() || '',
    department: formData.get('department')?.toString() || '',
    cabin_number: formData.get('cabin_number')?.toString() || '',
    location_id: formData.get('location_id')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phone: formData.get('phone')?.toString() || '',
  }

  const validation = updateFacultySchema.safeParse(rawData)
  const photoFile = formData.get('photo') as File | null
  const removePhoto = formData.get('remove_photo')?.toString() === 'true'

  const fieldErrors: FacultyActionState['fieldErrors'] = {}

  if (!validation.success) {
    const zodErrors = validation.error.flatten().fieldErrors
    Object.assign(fieldErrors, zodErrors)
  }

  const photoCheck = validatePhotoFile(photoFile)
  if (!photoCheck.valid) {
    fieldErrors.photo = [photoCheck.error!]
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstErrorMessage =
      fieldErrors.name?.[0] ||
      fieldErrors.email?.[0] ||
      fieldErrors.photo?.[0] ||
      fieldErrors.location_id?.[0] ||
      'Please correct the highlighted fields.'

    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    }
  }

  const validated = validation.data!
  const supabase = await createClient()

  // Verify chosen location_id belongs to this university
  if (validated.location_id) {
    const { data: loc } = await supabase
      .from('locations')
      .select('id')
      .eq('id', validated.location_id)
      .eq('university_id', universityId)
      .maybeSingle()

    if (!loc) {
      return {
        success: false,
        error: 'The selected campus location does not belong to your university.',
        fieldErrors: {
          location_id: ['Invalid campus location selected.'],
        },
      }
    }
  }

  // Fetch existing record to check photo
  const { data: existing, error: fetchError } = await supabase
    .from('faculty')
    .select('id, photo_url')
    .eq('id', validated.id)
    .eq('university_id', universityId)
    .maybeSingle()

  if (fetchError || !existing) {
    return {
      success: false,
      error: 'Faculty member not found or access denied.',
    }
  }

  let finalPhotoUrl = existing.photo_url

  if (photoFile && photoFile.size > 0) {
    const ext = getPhotoExtension(photoFile.name, photoFile.type)
    const filePath = `${universityId}/${validated.id}.${ext}`
    const buffer = Buffer.from(await photoFile.arrayBuffer())

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('faculty-photos')
      .upload(filePath, buffer, {
        contentType: photoFile.type || `image/${ext}`,
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Photo upload failed: ${uploadError.message}`,
      }
    }

    const { data: urlData } = adminClient.storage
      .from('faculty-photos')
      .getPublicUrl(filePath)

    // Append version query parameter to prevent browser cache stale display
    finalPhotoUrl = `${urlData.publicUrl}?v=${Date.now()}`
  } else if (removePhoto) {
    finalPhotoUrl = null
    const adminClient = createAdminClient()
    await adminClient.storage.from('faculty-photos').remove([
      `${universityId}/${validated.id}.jpg`,
      `${universityId}/${validated.id}.jpeg`,
      `${universityId}/${validated.id}.png`,
      `${universityId}/${validated.id}.webp`,
    ])
  }

  const { error: updateError } = await supabase
    .from('faculty')
    .update({
      name: validated.name,
      role: validated.role || null,
      department: validated.department || null,
      cabin_number: validated.cabin_number || null,
      location_id: validated.location_id || null,
      photo_url: finalPhotoUrl,
      email: validated.email || null,
      phone: validated.phone || null,
    })
    .eq('id', validated.id)
    .eq('university_id', universityId)

  if (updateError) {
    return {
      success: false,
      error: updateError.message || 'Failed to update faculty member.',
    }
  }

  revalidatePath('/admin/faculty')
  return { success: true }
}

export async function deleteFacultyAction(facultyId: string): Promise<{ success: boolean; error?: string }> {
  const { universityId } = await requireAdmin()

  if (!facultyId) {
    return { success: false, error: 'Faculty member ID is required.' }
  }

  const supabase = await createClient()

  // Check if faculty exists and has photo
  const { data: existing } = await supabase
    .from('faculty')
    .select('id, photo_url')
    .eq('id', facultyId)
    .eq('university_id', universityId)
    .maybeSingle()

  const { error: deleteError } = await supabase
    .from('faculty')
    .delete()
    .eq('id', facultyId)
    .eq('university_id', universityId)

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message || 'Failed to delete faculty member.',
    }
  }

  // Delete photo from storage if existed
  if (existing?.photo_url) {
    try {
      const adminClient = createAdminClient()
      await adminClient.storage.from('faculty-photos').remove([
        `${universityId}/${facultyId}.jpg`,
        `${universityId}/${facultyId}.jpeg`,
        `${universityId}/${facultyId}.png`,
        `${universityId}/${facultyId}.webp`,
      ])
    } catch (e) {
      console.error('Failed to remove faculty photo from storage:', e)
    }
  }

  revalidatePath('/admin/faculty')
  return { success: true }
}
