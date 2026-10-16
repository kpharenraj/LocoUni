import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campus Assistant',
}

export default function AssistantLayout({
  children,
}: LayoutProps<'/u/[universityId]/assistant'>) {
  return children
}
