'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Bot, House, Map, Users } from 'lucide-react'

const NAV_ITEMS = [
  { segment: '', label: 'Home', icon: House },
  { segment: '/assistant', label: 'Assistant', icon: Bot },
  { segment: '/faculty', label: 'Faculty', icon: Users },
  { segment: '/map', label: 'Map', icon: Map },
  { segment: '/notices', label: 'Notices', icon: Bell },
]

interface StudentNavigationProps {
  universityId: string
  placement: 'desktop' | 'mobile'
}

export default function StudentNavigation({
  universityId,
  placement,
}: StudentNavigationProps) {
  const pathname = usePathname()
  const basePath = `/u/${universityId}`
  const navClass =
    placement === 'desktop'
      ? 'hidden border-t border-border dark:border-border md:block'
      : 'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-border dark:bg-background/95 md:hidden'

  return (
    <nav aria-label="Campus navigation" className={navClass}>
      <div
        className={`mx-auto flex max-w-7xl ${
          placement === 'desktop'
            ? 'h-12 items-stretch gap-1 px-6'
            : 'h-16 items-stretch justify-around px-1'
        }`}
      >
        {NAV_ITEMS.map(({ segment, label, icon: Icon }) => {
          const href = `${basePath}${segment}`
          const isActive =
            segment === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-w-0 items-center justify-center gap-2 transition-colors ${
                placement === 'desktop'
                  ? `border-b-2 px-4 text-xs font-semibold ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground'
                    }`
                  : `flex-1 flex-col gap-1 px-1 text-[10px] font-medium ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-muted-foreground dark:text-muted-foreground'
                    }`
              }`}
            >
              <Icon
                className={`shrink-0 ${
                  placement === 'desktop' ? 'h-4 w-4' : 'h-5 w-5'
                } ${isActive ? 'stroke-[2.5]' : ''}`}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
