'use client'

import {
  AlertOctagon,
  ArrowRight,
  CalendarClock,
  CalendarCheck,
  CheckCircle2,
  FilePlus2,
  FileStack,
  Hourglass,
  Inbox,
  Send,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { visibleApplications } from '@/lib/nexus/store'
import { ALL_STATUSES, ROLE_LABELS } from '@/lib/nexus/types'
import { formatDate, validateApplication } from '@/lib/nexus/validation'
import { useCurrent } from './app-shell'
import { ApplicationsTable } from './applications-table'
import { Btn, Card, CardHeader, EmptyState, PageHeader, StatCard, StatusBadge } from './ui'

function greeting(name: string) {
  return `Welcome, ${name.split(' ').slice(0, 2).join(' ')}`
}

function ViewAll({ href, label = 'View all' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary-strong hover:underline">
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  )
}

function InstitutionDashboard() {
  const { user, data } = useCurrent()
  const router = useRouter()
  const apps = visibleApplications(data, user)
  const returned = apps.filter((a) => a.status === 'Returned')
  const inst = data.institutions.find((i) => i.id === user.institutionId)!

  return (
    <>
      <PageHeader
        title={greeting(user.name)}
        description={`${inst.name} · AISHE ${inst.aisheCode}`}
        action={
          <Btn icon={FilePlus2} onClick={() => router.push('/applications/new')}>
            New application
          </Btn>
        }
      />

      {returned.map((app) => (
        <div
          key={app.id}
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <Undo2 className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                <span className="font-mono">{app.refNo}</span> was returned for correction
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{app.returnReason}</p>
            </div>
          </div>
          <Btn variant="danger" size="sm" onClick={() => router.push(`/applications/${app.id}?tab=documents`)}>
            Correct now
          </Btn>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={apps.length} icon={FileStack} />
        <StatCard label="Action required" value={returned.length} icon={AlertOctagon} tone="danger" />
        <StatCard
          label="Under process"
          value={apps.filter((a) => !['Returned', 'EVC Completed'].includes(a.status)).length}
          icon={Hourglass}
          tone="primary"
        />
        <StatCard label="Inspection completed" value={apps.filter((a) => a.status === 'EVC Completed').length} icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardHeader title="My applications" description="Only records belonging to your institution are shown." action={<ViewAll href="/applications" />} />
        <ApplicationsTable
          apps={apps.slice(0, 5)}
          data={data}
          filters={false}
          showInstitution={false}
          emptyAction={
            <Btn size="sm" icon={FilePlus2} onClick={() => router.push('/applications/new')}>
              Start an application
            </Btn>
          }
        />
      </Card>
    </>
  )
}

function RoDashboard() {
  const { user, data } = useCurrent()
  const apps = visibleApplications(data, user)
  const queue = apps.filter((a) => ['Submitted', 'Resubmitted', 'Under Review'].includes(a.status))
  const flagged = queue.filter((a) => {
    const inst = data.institutions.find((i) => i.id === a.institutionId)!
    return validateApplication(a, inst).errors > 0
  })

  return (
    <>
      <PageHeader title={greeting(user.name)} description={`${ROLE_LABELS.ro} · ${user.region} Region`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={queue.length} icon={Inbox} tone="primary" />
        <StatCard label="Flagged by validation" value={flagged.length} icon={AlertOctagon} tone="danger" />
        <StatCard label="Returned to institution" value={apps.filter((a) => a.status === 'Returned').length} icon={Undo2} />
        <StatCard
          label="With EVC"
          value={apps.filter((a) => ['Forwarded to EVC', 'EVC Scheduled', 'EVC Completed'].includes(a.status)).length}
          icon={Send}
          tone="success"
        />
      </div>
      <Card>
        <CardHeader title="Review queue" description="New and resubmitted applications awaiting your decision." action={<ViewAll href="/applications" label="All applications" />} />
        <ApplicationsTable apps={queue} data={data} filters={false} />
      </Card>
    </>
  )
}

function EvcDashboard() {
  const { user, data } = useCurrent()
  const apps = visibleApplications(data, user)
  const toSchedule = apps.filter((a) => a.status === 'Forwarded to EVC')
  const scheduled = apps
    .filter((a) => a.status === 'EVC Scheduled')
    .sort((a, b) => (a.evc?.visitDate ?? '').localeCompare(b.evc?.visitDate ?? ''))

  return (
    <>
      <PageHeader title={greeting(user.name)} description="Expert Visit Committee · assigned inspections" action={<ViewAll href="/inspections" label="Open inspections" />} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="To be scheduled" value={toSchedule.length} icon={CalendarClock} tone="primary" />
        <StatCard label="Upcoming visits" value={scheduled.length} icon={CalendarCheck} />
        <StatCard label="Recommendations submitted" value={apps.filter((a) => a.status === 'EVC Completed').length} icon={CheckCircle2} tone="success" />
      </div>
      <Card>
        <CardHeader title="Upcoming visits" />
        {scheduled.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No visits scheduled" description="Schedule an inspection from the Inspections page." />
        ) : (
          <ul className="divide-y divide-border">
            {scheduled.map((app) => {
              const inst = data.institutions.find((i) => i.id === app.institutionId)!
              const d = new Date(app.evc!.visitDate!)
              return (
                <li key={app.id}>
                  <Link href={`/applications/${app.id}?tab=inspection`} className="flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-surface sm:flex-nowrap sm:gap-4 sm:px-5">
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-primary/30 bg-primary-soft py-1.5">
                      <span className="font-mono text-[10px] uppercase text-primary-strong">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      <span className="text-lg font-semibold leading-none text-foreground">{d.getDate()}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 basis-[calc(100%-4.5rem)] flex-col sm:basis-auto">
                      <span className="truncate font-medium text-foreground">{inst.name}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {app.form.program} · {app.evc!.visitTime} · {inst.city}
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}

function SuperAdminDashboard() {
  const { user, data } = useCurrent()
  const apps = visibleApplications(data, user)
  const counts = ALL_STATUSES.map((s) => ({ status: s, count: apps.filter((a) => a.status === s).length }))
  const max = Math.max(1, ...counts.map((c) => c.count))
  const activity = apps
    .flatMap((a) => a.history.map((h) => ({ ...h, app: a })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8)

  return (
    <>
      <PageHeader title={greeting(user.name)} description="National overview of all approval applications" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={apps.length} icon={FileStack} />
        <StatCard
          label="In regional review"
          value={apps.filter((a) => ['Submitted', 'Under Review', 'Resubmitted'].includes(a.status)).length}
          icon={Inbox}
          tone="primary"
        />
        <StatCard label="Returned" value={apps.filter((a) => a.status === 'Returned').length} icon={Undo2} tone="danger" />
        <StatCard label="EVC completed" value={apps.filter((a) => a.status === 'EVC Completed').length} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader title="Pipeline" description="Applications by current stage" />
          <ul className="flex flex-col gap-3 p-5">
            {counts.map(({ status, count }) => (
              <li key={status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{status}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader title="Recent activity" description="Latest audit events across all roles" />
          <ul className="divide-y divide-border">
            {activity.map((e) => (
              <li key={`${e.app.id}-${e.id}`}>
                <Link href={`/applications/${e.app.id}?tab=timeline`} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 transition-colors hover:bg-surface sm:flex-nowrap sm:gap-4 sm:px-5">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-foreground">{e.action}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{e.app.refNo}</span> · {e.actorName} ({ROLE_LABELS[e.actorRole]}) · {formatDate(e.at)}
                    </span>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

export function Dashboard() {
  const { user } = useCurrent()
  if (user.role === 'institution') return <InstitutionDashboard />
  if (user.role === 'ro') return <RoDashboard />
  if (user.role === 'evc') return <EvcDashboard />
  return <SuperAdminDashboard />
}
