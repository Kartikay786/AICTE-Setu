'use client'

import {
  CalendarCheck,
  FilePlus2,
  FileStack,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldAlert,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { logout, useSessionUser } from '@/lib/nexus/store'
import { ROLE_LABELS, type DemoUser, type NexusState, type Role } from '@/lib/nexus/types'
import { cn } from '@/lib/utils'
import { Btn, EmptyState } from './ui'
import { BrandMark } from './brand'

type Ctx = { user: DemoUser; data: NexusState }
const SessionContext = createContext<Ctx | null>(null)

export function useCurrent() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useCurrent must be used inside AppShell')
  return ctx
}

type NavItem = { href: string; label: string; icon: LucideIcon }

const NAV: Record<Role, NavItem[]> = {
  institution: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/applications', label: 'My Applications', icon: FileStack },
    { href: '/applications/new', label: 'New Application', icon: FilePlus2 },
  ],
  ro: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/applications', label: 'Review Queue', icon: FileStack },
  ],
  evc: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inspections', label: 'Inspections', icon: CalendarCheck },
    { href: '/applications', label: 'Assigned Applications', icon: FileStack },
  ],
  superadmin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/applications', label: 'All Applications', icon: FileStack },
    { href: '/inspections', label: 'Inspections', icon: CalendarCheck },
    { href: '/admin/roles', label: 'Demo Roles', icon: UsersRound },
  ],
}

function isActive(pathname: string, href: string) {
  if (href === '/applications') return pathname === '/applications' || /^\/applications\/(?!new)/.test(pathname)
  return pathname === href
}

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, user, data } = useSessionUser()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (ready && !user) router.replace('/')
  }, [ready, user, router])

  useEffect(() => setMobileOpen(false), [pathname])

  if (!ready || !user || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  const institution = data.institutions.find((i) => i.id === user.institutionId)
  const nav = NAV[user.role]

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col gap-6 p-4">
      <Link href="/dashboard" className="px-2 pt-1">
        <BrandMark />
      </Link>
      <ul className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-soft text-primary-strong'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user.name
              .replace(/^(Dr\.|Prof\.)\s*/, '')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
              {institution ? ` · ${institution.city}` : user.region ? ` · ${user.region} Region` : ''}
            </span>
          </div>
        </div>
        <Btn
          variant="secondary"
          size="sm"
          icon={LogOut}
          onClick={() => {
            logout()
            router.replace('/')
          }}
        >
          Switch role
        </Btn>
      </div>
    </nav>
  )

  return (
    <SessionContext.Provider value={{ user, data }}>
      <div className="flex min-h-dvh bg-surface">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card lg:block">{sidebar}</aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-foreground/30"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-72 max-w-[calc(100vw-2rem)] overflow-y-auto bg-card shadow-xl animate-in slide-in-from-left">{sidebar}</aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-foreground hover:bg-surface lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <span className="truncate text-sm text-muted-foreground">
                {institution ? institution.name : 'All India Council for Technical Education'}
              </span>
            </div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-medium text-primary-strong sm:inline-flex">
              {ROLE_LABELS[user.role]}
            </span>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </SessionContext.Provider>
  )
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useCurrent()
  if (!roles.includes(user.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Access restricted"
        description={`This page is not available to the ${ROLE_LABELS[user.role]} role.`}
        action={
          <Link href="/dashboard" className="text-sm font-medium text-primary-strong hover:underline">
            Back to dashboard
          </Link>
        }
      />
    )
  }
  return <>{children}</>
}
