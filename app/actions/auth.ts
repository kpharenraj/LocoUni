'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation'
import { redirect } from 'next/navigation'

export interface LoginActionState {
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}

export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get('email')
  const password = formData.get('password')

  const result = loginSchema.safeParse({ email, password })

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return {
      error: fieldErrors.email?.[0] || fieldErrors.password?.[0] || 'Invalid input details.',
      fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error || !data.user) {
    return {
      error: error?.message || 'Invalid email or password. Please try again.',
    }
  }

  // Fetch the user's profile to decide where to redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, university_id')
    .eq('id', data.user.id)
    .maybeSingle()

  let destination = '/join'

  if (profile?.role === 'admin') {
    destination = '/admin'
  } else if (profile?.role === 'student' && profile?.university_id) {
    destination = `/u/${profile.university_id}`
  } else {
    destination = '/join'
  }

  redirect(destination)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
