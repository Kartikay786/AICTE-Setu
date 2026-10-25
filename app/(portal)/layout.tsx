import { AppShell } from '@/components/nexus/app-shell'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
