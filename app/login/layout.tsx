import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your LocoUni campus account.',
}

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return children
}
