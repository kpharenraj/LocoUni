import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Sign in',
  description: `Sign in to your ${site.name} campus account.`,
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return children
}
