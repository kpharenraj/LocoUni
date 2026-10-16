import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const addUniversitySchema = z.object({
  name: z.string().trim().min(1, 'University name is required'),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          const urlToTest = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`
          new URL(urlToTest)
          return true
        } catch {
          return false
        }
      },
      { message: 'Please enter a valid website URL' }
    ),
  description: z.string().trim().optional(),
  lat: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? Number(val) : null))
    .refine((val) => val === null || (!isNaN(val) && val >= -90 && val <= 90), {
      message: 'Latitude must be a valid number between -90 and 90',
    }),
  lng: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? Number(val) : null))
    .refine((val) => val === null || (!isNaN(val) && val >= -180 && val <= 180), {
      message: 'Longitude must be a valid number between -180 and 180',
    }),
  adminName: z.string().trim().min(1, 'Admin full name is required'),
  adminEmail: z
    .string()
    .trim()
    .min(1, 'Admin email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export type AddUniversityInput = z.infer<typeof addUniversitySchema>

export const updateUniversitySchema = z
  .object({
    name: z.string().trim().min(1, 'University name is required').max(200),
    city: z.string().trim().max(120).optional(),
    country: z.string().trim().max(120).optional(),
    website: z
      .string()
      .trim()
      .max(500)
      .optional()
      .refine(
        (value) => {
          if (!value) return true
          try {
            const url = new URL(value)
            return url.protocol === 'http:' || url.protocol === 'https:'
          } catch {
            return false
          }
        },
        { message: 'Please enter a valid http or https URL.' }
      ),
    description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').optional(),
    lat: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : null))
      .refine((value) => value === null || (Number.isFinite(value) && value >= -90 && value <= 90), {
        message: 'Latitude must be between -90 and 90.',
      }),
    lng: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : null))
      .refine((value) => value === null || (Number.isFinite(value) && value >= -180 && value <= 180), {
        message: 'Longitude must be between -180 and 180.',
      }),
    removeLogo: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if ((value.lat === null) !== (value.lng === null)) {
      context.addIssue({
        code: 'custom',
        message: 'Provide both campus coordinates or leave both empty.',
        path: value.lat === null ? ['lat'] : ['lng'],
      })
    }
  })

export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>

export const locationTypeEnum = z.enum([
  'block',
  'canteen',
  'library',
  'hostel',
  'ground',
  'gate',
  'parking',
  'other',
])

export type LocationType = z.infer<typeof locationTypeEnum>

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, 'Location name is required'),
  type: locationTypeEnum,
  description: z.string().trim().optional(),
  lat: z.coerce
    .number({ message: 'Valid latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number({ message: 'Valid longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
})

export type CreateLocationInput = z.infer<typeof createLocationSchema>

export const updateLocationSchema = createLocationSchema.extend({
  id: z.string().uuid('Invalid location ID'),
})

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

export const createFacultySchema = z.object({
  name: z.string().trim().min(1, 'Faculty member name is required'),
  role: z.string().trim().optional(),
  department: z.string().trim().optional(),
  cabin_number: z.string().trim().optional(),
  location_id: z.string().trim().optional().or(z.literal('')),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address',
    }),
  phone: z.string().trim().optional(),
})

export type CreateFacultyInput = z.infer<typeof createFacultySchema>

export const updateFacultySchema = createFacultySchema.extend({
  id: z.string().uuid('Invalid faculty member ID'),
})

export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>

export const noticeCategoryEnum = z.enum([
  'academic',
  'exams',
  'placements',
  'emergency',
  'events',
  'hostel',
])

export const noticePriorityEnum = z.enum(['urgent', 'high', 'normal'])

export type NoticeCategory = z.infer<typeof noticeCategoryEnum>
export type NoticePriority = z.infer<typeof noticePriorityEnum>

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Notice title is required').max(200, 'Title must be under 200 characters'),
  body: z.string().trim().optional(),
  category: noticeCategoryEnum,
  priority: noticePriorityEnum,
  event_date: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
})

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>

export const updateNoticeSchema = createNoticeSchema.extend({
  id: z.string().uuid('Invalid notice ID'),
})

export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>

export const studentSignupSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type StudentSignupInput = z.infer<typeof studentSignupSchema>
