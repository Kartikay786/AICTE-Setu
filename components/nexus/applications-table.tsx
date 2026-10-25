'use client'

import { ChevronRight, FileSearch, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ALL_STATUSES, type Application, type ApplicationStatus, type NexusState } from '@/lib/nexus/types'
import { formatDate, validateApplication } from '@/lib/nexus/validation'
import { CheckPill, EmptyState, StatusBadge, inputClass } from './ui'

export function ApplicationsTable({
  apps,
  data,
  filters = true,
  showInstitution = true,
  emptyAction,
}: {
  apps: Application[]
  data: NexusState
  filters?: boolean
  showInstitution?: boolean
  emptyAction?: React.ReactNode
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps
      .map((app) => {
        const inst = data.institutions.find((i) => i.id === app.institutionId)!
        return { app, inst, validation: validateApplication(app, inst) }
      })
      .filter(({ app, inst }) => {
        if (status !== 'all' && app.status !== status) return false
        if (!q) return true
        return [app.refNo, app.form.program, app.form.type, inst.name, inst.city].some((v) =>
          v.toLowerCase().includes(q),
        )
      })
  }, [apps, data.institutions, query, status])

  return (
    <div className="flex flex-col">
      {filters && (
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="app-search" className="sr-only">
              Search applications
            </label>
            <input
              id="app-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference, programme or institution"
              className={`${inputClass} pl-9`}
            />
          </div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus | 'all')}
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No applications found"
          description={query || status !== 'all' ? 'Try a different search term or status filter.' : 'Nothing here yet.'}
          action={emptyAction}
        />
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border md:hidden">
            {rows.map(({ app, inst, validation }) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex min-w-0 flex-col gap-3 p-4 transition-colors hover:bg-surface/60"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="break-all font-mono text-xs font-medium text-foreground">{app.refNo}</span>
                      <span className="text-xs text-muted-foreground">{app.form.type}</span>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    {showInstitution && (
                      <span className="break-words text-sm font-medium text-foreground">{inst.name}</span>
                    )}
                    <span className="break-words text-sm text-foreground">{app.form.program}</span>
                    <span className="text-xs text-muted-foreground">
                      {showInstitution && `${inst.city}, ${inst.state} · `}
                      Intake {app.form.intake} · {app.form.academicYear}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {validation.errors > 0 ? (
                      <CheckPill status="fail">{validation.errors} issue{validation.errors > 1 ? 's' : ''}</CheckPill>
                    ) : validation.warnings > 0 ? (
                      <CheckPill status="warn">{validation.warnings} warning{validation.warnings > 1 ? 's' : ''}</CheckPill>
                    ) : (
                      <CheckPill status="pass">All clear</CheckPill>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">Updated {formatDate(app.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Reference</th>
                {showInstitution && <th scope="col" className="px-4 py-3 font-medium">Institution</th>}
                <th scope="col" className="px-4 py-3 font-medium">Programme</th>
                <th scope="col" className="px-4 py-3 font-medium">Validation</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ app, inst, validation }) => (
                <tr key={app.id} className="group border-b border-border last:border-0 transition-colors hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <Link href={`/applications/${app.id}`} className="font-mono text-xs font-medium text-foreground group-hover:text-primary-strong">
                      {app.refNo}
                    </Link>
                    <div className="text-xs text-muted-foreground">{app.form.type}</div>
                  </td>
                  {showInstitution && (
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{inst.name}</div>
                      <div className="text-xs text-muted-foreground">{inst.city}, {inst.state}</div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="text-foreground">{app.form.program}</div>
                    <div className="text-xs text-muted-foreground">Intake {app.form.intake} · {app.form.academicYear}</div>
                  </td>
                  <td className="px-4 py-3">
                    {validation.errors > 0 ? (
                      <CheckPill status="fail">{validation.errors} issue{validation.errors > 1 ? 's' : ''}</CheckPill>
                    ) : validation.warnings > 0 ? (
                      <CheckPill status="warn">{validation.warnings} warning{validation.warnings > 1 ? 's' : ''}</CheckPill>
                    ) : (
                      <CheckPill status="pass">All clear</CheckPill>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(app.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      aria-label={`Open ${app.refNo}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  )
}
