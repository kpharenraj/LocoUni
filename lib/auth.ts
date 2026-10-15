import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

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

export interface AdminContext {
  user: User
  profile: ProfileRow
  universityId: string
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

/**
 * Server-side guard that returns user, profile, and universityId for authenticated admins,
 * or redirects to /login if unauthenticated, not an admin, or missing university_id.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const userWithProfile = await getCurrentUserWithProfile()

  if (
    !userWithProfile?.user ||
    userWithProfile.profile?.role !== 'admin' ||
    !userWithProfile.profile.university_id
  ) {
    redirect('/login')
  }

  return {
    user: userWithProfile.user,
    profile: userWithProfile.profile,
    universityId: userWithProfile.profile.university_id,
  }
}
