import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface ProfileRow {
  id: string
  full_name: string | null
  role: 'student' | 'admin'
  university_id: string | null
}

export interface CurrentUserWithProfile {
  user: User
  profile: ProfileRow | null
}

/**
 * Server-side helper that returns the logged-in user and their profile row
 * (role, university_id), or null if the user is not authenticated.
 */
export async function getCurrentUserWithProfile(): Promise<CurrentUserWithProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, university_id')
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    profile: profile as ProfileRow | null,
  }
}
