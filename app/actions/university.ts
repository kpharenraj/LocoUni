'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { addUniversitySchema, updateUniversitySchema } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface AddUniversityActionState {
  error?: string
  fieldErrors?: {
    name?: string[]
    city?: string[]
    country?: string[]
    website?: string[]
    description?: string[]
    lat?: string[]
    lng?: string[]
    logo?: string[]
    adminName?: string[]
    adminEmail?: string[]
    password?: string[]
  }
}

export interface UpdateUniversityActionState {
  success?: boolean
  updatedAt?: string
  error?: string
  warning?: string
  fieldErrors?: {
    name?: string[]
    city?: string[]
    country?: string[]
    website?: string[]
    description?: string[]
    lat?: string[]
    lng?: string[]
    logo?: string[]
  }
}

function getLogoStoragePath(logoUrl: string | null, universityId: string): string | null {
  if (!logoUrl) return null

  try {
    const pathname = new URL(logoUrl).pathname
    const marker = '/logos/'
    const markerIndex = pathname.lastIndexOf(marker)
    if (markerIndex < 0) return null

    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length))
    return path.startsWith(`${universityId}/`) ? path : null
  } catch {
    return null
  }
}

function getLogoExtension(file: File): 'jpg' | 'png' | 'webp' | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  if (!extension || !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return null
  if (mimeToExtension[file.type] !== (extension === 'jpeg' ? 'jpg' : extension)) return null
  return extension === 'jpeg' ? 'jpg' : extension as 'jpg' | 'png' | 'webp'
}

async function isValidLogoContent(file: File, extension: 'jpg' | 'png' | 'webp'): Promise<boolean> {
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

export async function updateUniversityAction(
  _prevState: UpdateUniversityActionState | null,
  formData: FormData
): Promise<UpdateUniversityActionState> {
  const { universityId } = await requireAdmin()
  const validation = updateUniversitySchema.safeParse({
    name: formData.get('name')?.toString() ?? '',
    city: formData.get('city')?.toString() ?? '',
    country: formData.get('country')?.toString() ?? '',
    website: formData.get('website')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    lat: formData.get('lat')?.toString() ?? '',
    lng: formData.get('lng')?.toString() ?? '',
    removeLogo: formData.get('removeLogo') === 'true',
  })

  const logoValue = formData.get('logo')
  const logoFile = logoValue instanceof File && logoValue.size > 0 ? logoValue : null
  const fieldErrors: NonNullable<UpdateUniversityActionState['fieldErrors']> = {}
  if (!validation.success) Object.assign(fieldErrors, validation.error.flatten().fieldErrors)

  let logoExtension: 'jpg' | 'png' | 'webp' | null = null
  if (logoFile) {
    if (logoFile.size > 2 * 1024 * 1024) {
      fieldErrors.logo = ['Logo image must be 2 MB or smaller.']
    } else {
      logoExtension = getLogoExtension(logoFile)
      if (!logoExtension || !(await isValidLogoContent(logoFile, logoExtension))) {
        fieldErrors.logo = ['Logo must be a valid JPG, PNG, or WebP image.']
      }
    }
  }

  if (logoFile && validation.success && validation.data.removeLogo === true) {
    fieldErrors.logo = ['Choose a logo to upload or remove the current logo, not both.']
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: Object.values(fieldErrors).flat()[0] || 'Please correct the highlighted fields.',
      fieldErrors,
    }
  }
  if (!validation.success) return { error: 'Please correct the highlighted fields.' }

  const supabase = await createClient()
  const { data: currentUniversity, error: currentError } = await supabase
    .from('universities')
    .select('logo_url')
    .eq('id', universityId)
    .maybeSingle()

  if (currentError || !currentUniversity) {
    console.error('Failed to load university before update:', currentError?.message ?? 'University not found')
    return { error: 'Unable to load your university settings. Please try again.' }
  }

  const oldLogoPath = getLogoStoragePath(currentUniversity.logo_url, universityId)
  let newLogoPath: string | null = null
  let logoUrl = currentUniversity.logo_url
  let storageClient: ReturnType<typeof createAdminClient> | null = null

  if (logoFile && logoExtension) {
    newLogoPath = `${universityId}/logo.${logoExtension}`
    try {
      storageClient = createAdminClient()
      const { error: uploadError } = await storageClient.storage
        .from('logos')
        .upload(newLogoPath, Buffer.from(await logoFile.arrayBuffer()), {
          contentType: logoFile.type,
          upsert: true,
        })

      if (uploadError) {
        console.error('Failed to upload university logo:', uploadError.message)
        return { error: 'Unable to upload the logo. Please try again.' }
      }
      const { data } = storageClient.storage.from('logos').getPublicUrl(newLogoPath)
      const versionedUrl = new URL(data.publicUrl)
      versionedUrl.searchParams.set('v', Date.now().toString())
      logoUrl = versionedUrl.toString()
    } catch (error) {
      console.error('Failed to upload university logo:', error instanceof Error ? error.message : 'Unknown error')
      return { error: 'Unable to upload the logo. Please try again.' }
    }
  } else if (validation.data.removeLogo === true) {
    logoUrl = null
  }

  const { data: updatedUniversity, error: updateError } = await supabase
    .from('universities')
    .update({
      name: validation.data.name,
      city: validation.data.city || null,
      country: validation.data.country || null,
      website: validation.data.website || null,
      description: validation.data.description || null,
      logo_url: logoUrl,
      lat: validation.data.lat,
      lng: validation.data.lng,
    })
    .eq('id', universityId)
    .select('id')
    .maybeSingle()

  if (updateError || !updatedUniversity) {
    console.error('Failed to update university settings:', updateError?.message ?? 'No university row was updated')
    if (newLogoPath && newLogoPath !== oldLogoPath && storageClient) {
      const { error: cleanupError } = await storageClient.storage.from('logos').remove([newLogoPath])
      if (cleanupError) console.error('Failed to clean up uploaded university logo:', cleanupError.message)
    }
    return { error: 'Unable to save your university settings. Please try again.' }
  }

  const requestedRemoval = validation.data.removeLogo === true
  const pathToRemove = requestedRemoval
    ? oldLogoPath
    : newLogoPath && newLogoPath !== oldLogoPath
      ? oldLogoPath
      : null
  let warning: string | undefined

  if (pathToRemove) {
    try {
      storageClient ??= createAdminClient()
      const { error: removeError } = await storageClient.storage.from('logos').remove([pathToRemove])
      if (removeError) {
        console.error('Failed to remove old university logo:', removeError.message)
        warning = 'Settings were saved, but the previous logo file could not be removed.'
      }
    } catch (error) {
      console.error('Failed to remove old university logo:', error instanceof Error ? error.message : 'Unknown error')
      warning = 'Settings were saved, but the previous logo file could not be removed.'
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/settings')
  revalidatePath(`/u/${universityId}`)
  return { success: true, updatedAt: new Date().toISOString(), warning }
}

function getFileExtension(filename: string, mimeType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext
  }
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'png'
}

export async function addUniversityAction(
  _prevState: AddUniversityActionState | null,
  formData: FormData
): Promise<AddUniversityActionState> {
  // a. Validate all input with Zod
  const rawData = {
    name: formData.get('name')?.toString() || '',
    city: formData.get('city')?.toString() || '',
    country: formData.get('country')?.toString() || '',
    website: formData.get('website')?.toString() || '',
    description: formData.get('description')?.toString() || '',
    lat: formData.get('lat')?.toString() || '',
    lng: formData.get('lng')?.toString() || '',
    adminName: formData.get('adminName')?.toString() || '',
    adminEmail: formData.get('adminEmail')?.toString() || '',
    password: formData.get('password')?.toString() || '',
  }

  const validation = addUniversitySchema.safeParse(rawData)
  const logoFile = formData.get('logo') as File | null

  const fieldErrors: AddUniversityActionState['fieldErrors'] = {}

  if (!validation.success) {
    const zodErrors = validation.error.flatten().fieldErrors
    Object.assign(fieldErrors, zodErrors)
  }

  // Validate logo file if provided
  if (logoFile && logoFile.size > 0) {
    const maxSizeBytes = 2 * 1024 * 1024 // 2 MB
    if (logoFile.size > maxSizeBytes) {
      fieldErrors.logo = ['Logo image must be less than 2 MB']
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      const lowerName = logoFile.name.toLowerCase()
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
      const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext))

      if (!validTypes.includes(logoFile.type) && !hasValidExt) {
        fieldErrors.logo = ['Logo must be a JPG, PNG, or WebP image']
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstErrorMessage =
      fieldErrors.name?.[0] ||
      fieldErrors.adminName?.[0] ||
      fieldErrors.adminEmail?.[0] ||
      fieldErrors.password?.[0] ||
      fieldErrors.logo?.[0] ||
      fieldErrors.lat?.[0] ||
      fieldErrors.lng?.[0] ||
      fieldErrors.website?.[0] ||
      'Please correct the highlighted fields.'

    return {
      error: firstErrorMessage,
      fieldErrors,
    }
  }

  const validated = validation.data!
  const adminClient = createAdminClient()

  let createdUserId: string | null = null
  let createdUniversityId: string | null = null

  try {
    // b. Create the auth user with the admin client (auth.admin.createUser, email_confirm true)
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email: validated.adminEmail,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.adminName,
      },
    })

    if (userError || !userData?.user) {
      const msg = userError?.message || 'Failed to create user account'
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        return {
          error: 'An account with this email address already exists. Please log in instead.',
          fieldErrors: {
            adminEmail: ['This email is already registered. Please log in instead.'],
          },
        }
      }
      return {
        error: msg,
      }
    }

    createdUserId = userData.user.id

    // c. Insert the university row with status 'pending' and created_by = new user id
    const { data: uniData, error: uniError } = await adminClient
      .from('universities')
      .insert({
        name: validated.name,
        city: validated.city || null,
        country: validated.country || null,
        website: validated.website || null,
        description: validated.description || null,
        lat: validated.lat,
        lng: validated.lng,
        status: 'pending',
        created_by: createdUserId,
      })
      .select('id')
      .single()

    if (uniError || !uniData?.id) {
      throw new Error(uniError?.message || 'Failed to create university record.')
    }

    createdUniversityId = uniData.id

    // d. Insert the profiles row with role 'admin' and university_id set
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: createdUserId,
        full_name: validated.adminName,
        role: 'admin',
        university_id: createdUniversityId,
      })

    if (profileError) {
      throw new Error(profileError.message || 'Failed to create admin profile.')
    }

    // e. If a logo was provided, upload it to the 'logos' storage bucket under {universityId}/logo.{ext}
    if (logoFile && logoFile.size > 0) {
      const ext = getFileExtension(logoFile.name, logoFile.type)
      const filePath = `${createdUniversityId}/logo.${ext}`
      const fileBuffer = Buffer.from(await logoFile.arrayBuffer())

      const { error: uploadError } = await adminClient.storage
        .from('logos')
        .upload(filePath, fileBuffer, {
          contentType: logoFile.type || `image/${ext}`,
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Failed to upload university logo: ${uploadError.message}`)
      }

      const { data: publicUrlData } = adminClient.storage
        .from('logos')
        .getPublicUrl(filePath)

      const logoUrl = publicUrlData.publicUrl

      const { error: updateLogoError } = await adminClient
        .from('universities')
        .update({ logo_url: logoUrl })
        .eq('id', createdUniversityId)

      if (updateLogoError) {
        throw new Error(`Failed to save university logo URL: ${updateLogoError.message}`)
      }
    }

    // f. Sign the user in with the server Supabase client so the session cookie is set
    const serverSupabase = await createClient()
    const { error: signInError } = await serverSupabase.auth.signInWithPassword({
      email: validated.adminEmail,
      password: validated.password,
    })

    if (signInError) {
      throw new Error(`Account created, but automatic sign-in failed: ${signInError.message}`)
    }
  } catch (err: unknown) {
    // Rollback what was already created
    try {
      if (createdUniversityId) {
        await adminClient.from('profiles').delete().eq('university_id', createdUniversityId)
        await adminClient.from('universities').delete().eq('id', createdUniversityId)
      }
      if (createdUserId) {
        await adminClient.from('profiles').delete().eq('id', createdUserId)
        await adminClient.auth.admin.deleteUser(createdUserId)
      }
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError)
    }

    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Registration could not be completed. All created resources have been safely rolled back.'

    return {
      error: errorMessage,
    }
  }

  // g. Redirect to /admin
  redirect('/admin')
}
