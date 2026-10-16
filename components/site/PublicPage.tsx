import type { ReactNode } from 'react'
import Footer from '@/components/site/Footer'
import PublicHeader from '@/components/site/PublicHeader'

export default function PublicPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
      <Footer />
    </div>
  )
}
