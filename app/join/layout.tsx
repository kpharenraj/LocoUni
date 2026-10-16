import { createPageMetadata, site } from '@/lib/site'

export const metadata = createPageMetadata(
  'Find your university',
  `Search approved universities and join a campus on ${site.name} to find maps, faculty and notices.`,
  '/join'
)

export default function JoinLayout({ children }: LayoutProps<'/join'>) {
  return children
}
