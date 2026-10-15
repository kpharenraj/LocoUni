'use server'

import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  createNoticeSchema,
  updateNoticeSchema,
  type NoticeCategory,
  type NoticePriority,
} from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export interface NoticeActionState {
  success?: boolean
  error?: string
  fieldErrors?: {
    title?: string[]
    body?: string[]
    category?: string[]
    priority?: string[]
    event_date?: string[]
  }
}

export async function createNoticeAction(
  _prevState: NoticeActionState | null,
  formData: FormData
): Promise<NoticeActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || '',
    category: formData.get('category')?.toString() as NoticeCategory,
    priority: formData.get('priority')?.toString() as NoticePriority,
    event_date: formData.get('event_date')?.toString() || '',
  }

  const validation = createNoticeSchema.safeParse(rawData)

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors
    const error =
      fieldErrors.title?.[0] ||
      fieldErrors.category?.[0] ||
      fieldErrors.priority?.[0] ||
      'Please correct the highlighted fields.'

    return { success: false, error, fieldErrors }
  }

  const { data } = validation
  const supabase = await createClient()

  const { error: dbError } = await supabase.from('notices').insert({
    university_id: universityId,
    title: data.title,
    body: data.body || null,
    category: data.category,
    priority: data.priority,
    event_date: data.event_date || null,
  })

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to create notice.',
    }
  }

  revalidatePath('/admin/notices')
  return { success: true }
}

export async function updateNoticeAction(
  _prevState: NoticeActionState | null,
  formData: FormData
): Promise<NoticeActionState> {
  const { universityId } = await requireAdmin()

  const rawData = {
    id: formData.get('id')?.toString() || '',
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || '',
    category: formData.get('category')?.toString() as NoticeCategory,
    priority: formData.get('priority')?.toString() as NoticePriority,
    event_date: formData.get('event_date')?.toString() || '',
  }

  const validation = updateNoticeSchema.safeParse(rawData)

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors
    const error =
      fieldErrors.title?.[0] ||
      fieldErrors.category?.[0] ||
      fieldErrors.priority?.[0] ||
      'Please correct the highlighted fields.'

    return { success: false, error, fieldErrors }
  }

  const { data } = validation
  const supabase = await createClient()

  const { error: dbError } = await supabase
    .from('notices')
    .update({
      title: data.title,
      body: data.body || null,
      category: data.category,
      priority: data.priority,
      event_date: data.event_date || null,
    })
    .eq('id', data.id)
    .eq('university_id', universityId)

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to update notice.',
    }
  }

  revalidatePath('/admin/notices')
  return { success: true }
}

export async function deleteNoticeAction(
  noticeId: string
): Promise<{ success: boolean; error?: string }> {
  const { universityId } = await requireAdmin()

  if (!noticeId) {
    return { success: false, error: 'Notice ID is required.' }
  }

  const supabase = await createClient()

  const { error: dbError } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId)
    .eq('university_id', universityId)

  if (dbError) {
    return {
      success: false,
      error: dbError.message || 'Failed to delete notice.',
    }
  }

  revalidatePath('/admin/notices')
  return { success: true }
}
