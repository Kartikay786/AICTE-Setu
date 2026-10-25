'use client'

import { CalendarClock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { visibleApplications } from '@/lib/nexus/store'
import type { Application, NexusState } from '@/lib/nexus/types'
import { formatDate } from '@/lib/nexus/validation'
import { useCurrent } from './app-shell'
import { Card, CardHeader, EmptyState, PageHeader, StatusBadge } from './ui'

function Group({ title, description, apps, data }: { title: string; description: string; apps: Application[]; data: NexusState }) {
  return (
    <Card>
      <CardHeader title={`${title} (${apps.length})`} description={description} />
      {apps.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-border">
          {apps.map((app) => {
            const inst = data.institutions.find((i) => i.id === app.institutionId)
            const member = data.users.find((u) => u.id === app.evc?.assignedTo)
            return (
              <li key={app.id}>
                <Link href={`/applications/${app.id}?tab=inspection`} className="flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-surface sm:flex-nowrap sm:gap-4 sm:px-5">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-border py-1.5">
                    {app.evc?.visitDate ? (
                      <>
                        <span className="text-[11px] uppercase text-muted-foreground">
                          {new Date(app.evc.visitDate).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="text-lg font-semibold leading-none text-foreground">{new Date(app.evc.visitDate).getDate()}</span>
                      </>
                    ) : (
                      <CalendarClock className="my-1.5 size-5 text-muted-foreground" aria-label="Not scheduled" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 basis-[calc(100%-4.5rem)] flex-col gap-0.5 sm:basis-auto">
                    <span className="truncate text-sm font-medium text-foreground">{inst?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {app.refNo} · {inst?.city} · {member?.name}
                      {app.evc?.visitTime && ` · ${app.evc.visitTime}`}
                      {app.evc?.completedAt && ` · completed ${formatDate(app.evc.completedAt)}`}
                    </span>
                  </div>
                  <StatusBadge status={app.status} />
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function InspectionsView() {
  const { user, data } = useCurrent()
  const apps = visibleApplications(data, user).filter((a) => a.evc)
  const toSchedule = apps.filter((a) => a.status === 'Forwarded to EVC')
  const scheduled = apps
    .filter((a) => a.status === 'EVC Scheduled')
    .sort((a, b) => (a.evc!.visitDate ?? '').localeCompare(b.evc!.visitDate ?? ''))
  const completed = apps.filter((a) => a.status === 'EVC Completed')

  return (
    <>
      <PageHeader
        title="Inspections"
        description={user.role === 'evc' ? 'Expert visits assigned to you.' : 'Expert visits across all regions.'}
      />
      {apps.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarClock} title="No inspections yet" description="Applications appear here once a Regional Officer advances them to the EVC." />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Group title="Awaiting scheduling" description="Pick a visit date and committee." apps={toSchedule} data={data} />
          <Group title="Scheduled" description="Upcoming visits, soonest first." apps={scheduled} data={data} />
          <Group title="Completed" description="Recommendation submitted." apps={completed} data={data} />
        </div>
      )}
    </>
  )
}
