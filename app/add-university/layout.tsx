import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register a University',
  description: 'Register your university and bring campus information to LocoUni.',
}

export default function AddUniversityLayout({
  children,
}: LayoutProps<'/add-university'>) {
  return children
}
