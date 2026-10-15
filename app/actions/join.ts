'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { studentSignupSchema } from '@/lib/validation'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export interface JoinActionState {
  error?: string
  fieldErrors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
  }
}

/**
 * For new (unauthenticated) visitors: create account, insert profile,
 * sign in and redirect to the student home.
 */
export async function studentSignupAndJoinAction(
  universityId: string,
  _prevState: JoinActionState | null,
  formData: FormData
): Promise<JoinActionState> {
  const universityIdValidation = z.string().uuid().safeParse(universityId)
  if (!universityIdValidation.success) {
    return { error: 'This university is not available for joining.' }
  }

  const rawData = {
    fullName: formData.get('fullName')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    password: formData.get('password')?.toString() || '',
  }

  const validation = studentSignupSchema.safeParse(rawData)
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors
    return {
      error:
        fieldErrors.fullName?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.password?.[0] ||
        'Please correct the highlighted fields.',
      fieldErrors,
    }
  }

  const { fullName, email, password } = validation.data

  // Verify the university is still approved
  const supabase = await createClient()
  const { data: uni, error: universityError } = await supabase
    .from('universities')
    .select('id, status')
    .eq('id', universityIdValidation.data)
    .eq('status', 'approved')
    .maybeSingle()

  if (universityError) {
    return { error: 'Unable to verify this university. Please try again.' }
  }
  if (!uni) {
    return { error: 'This university is not available for joining.' }
  }

  const adminClient = createAdminClient()

  // Create auth user (email confirmed immediately)
  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError || !authData.user) {
    const msg = createError?.message || ''
    const lowerMessage = msg.toLowerCase()
    if (
      lowerMessage.includes('already registered') ||
      lowerMessage.includes('already exists') ||
      lowerMessage.includes('duplicate') ||
      lowerMessage.includes('unique constraint')
    ) {
      return {
        error: 'An account with this email already exists. Please log in instead.',
        fieldErrors: { email: ['Email is already registered.'] },
      }
    }
    return { error: msg || 'Failed to create account. Please try again.' }
  }

  const userId = authData.user.id

  // Insert profile with admin client (bypasses RLS)
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: userId,
    full_name: fullName,
    role: 'student',
    university_id: universityId,
  })

  if (profileError) {
    // Roll back the created user
    const { error: rollbackError } = await adminClient.auth.admin.deleteUser(userId)
    if (rollbackError) {
      console.error('Failed to roll back student account after profile insert failure:', rollbackError)
    }
    return { error: 'Failed to create profile. Please try again.' }
  }

  // Sign the new user in with the server client
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    return { error: 'Account created! Please log in to continue.' }
  }

  redirect(`/u/${universityId}`)
}

/**
 * For already-logged-in students: update university_id to join a new university.
 */
export async function studentJoinAction(
  universityId: string
): Promise<{ error?: string }> {
  const universityIdValidation = z.string().uuid().safeParse(universityId)
  if (!universityIdValidation.success) {
    return { error: 'This university is not available for joining.' }
  }

  const supabase = await createClient()

  // Get authenticated user from session (never from form data)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return { error: 'Unable to verify your student profile. Please try again.' }
  }
  if (profile?.role === 'admin') {
    redirect('/admin')
  }
  if (profile?.role !== 'student') {
    return { error: 'A student profile is required to join a university.' }
  }

  // Verify university is approved
  const { data: uni, error: universityError } = await supabase
    .from('universities')
    .select('id, status')
    .eq('id', universityIdValidation.data)
    .eq('status', 'approved')
    .maybeSingle()

  if (universityError) {
    return { error: 'Unable to verify this university. Please try again.' }
  }
  if (!uni) {
    return { error: 'This university is not available for joining.' }
  }

  // Use admin client to update profile (bypasses RLS restriction on profile updates)
  const adminClient = createAdminClient()
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ university_id: universityIdValidation.data })
    .eq('id', user.id)
    .eq('role', 'student') // only update if the user is a student

  if (updateError) {
    return { error: updateError.message || 'Failed to join university.' }
  }

  redirect(`/u/${universityId}`)
}
