import { createPageMetadata, site } from '@/lib/site'

export const metadata = createPageMetadata(
  'Register a University',
  `Register your university with ${site.name} to share campus locations, faculty and notices with students.`,
  '/add-university'
)

export default function AddUniversityLayout({
  children,
}: LayoutProps<'/add-university'>) {
  return children
}
