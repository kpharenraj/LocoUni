'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { addUniversitySchema } from '@/lib/validation'
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
