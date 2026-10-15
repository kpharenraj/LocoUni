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
