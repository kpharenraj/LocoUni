import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find your University',
  description: 'Search approved universities and join your campus on LocoUni.',
}

export default function JoinLayout({ children }: LayoutProps<'/join'>) {
  return children
}
