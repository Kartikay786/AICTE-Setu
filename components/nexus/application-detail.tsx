'use client'

import { ArrowLeft, FileSearch, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { canView } from '@/lib/nexus/store'
import { validateApplication } from '@/lib/nexus/validation'
import { formatDate } from '@/lib/nexus/validation'
import { cn } from '@/lib/utils'
import { useCurrent } from './app-shell'
import { CorrectionWorkspace, DocumentsReview, ValidationSummary } from './documents-panel'
import { InspectionPanel } from './inspection-panel'
import { RoActions } from './ro-actions'
import { StageTracker, Timeline } from './timeline'
import { Card, CardHeader, CheckPill, EmptyState, StatusBadge } from './ui'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents & validation' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'timeline', label: 'Timeline' },
] as const
type TabId = (typeof TABS)[number]['id']

export function ApplicationDetail({ id }: { id: string }) {
  const { user, data } = useCurrent()
  const router = useRouter()
  const params = useSearchParams()
  const app = data.applications.find((a) => a.id === id)

  if (!app || !canView(data, user, app)) {
    return (
      <Card>
        <EmptyState
          icon={FileSearch}
          title="Application not available"
          description="It may not exist, or your role does not have access to it."
          action={
            <Link href="/applications" className="text-sm font-medium text-primary-strong hover:underline">
              Back to applications
            </Link>
          }
        />
      </Card>
    )
  }

  const institution = data.institutions.find((i) => i.id === app.institutionId)!
  const validation = validateApplication(app, institution)
  const requested = params.get('tab') as TabId | null
  const tab: TabId = TABS.some((t) => t.id === requested) ? requested! : user.role === 'evc' ? 'inspection' : 'overview'
  const isOwner = user.role === 'institution'

  function selectTab(next: TabId) {
    router.replace(`/applications/${id}?tab=${next}`, { scroll: false })
  }

  const overviewRows: [string, string][] = [
    ['Application type', app.form.type],
    ['Programme', app.form.program],
    ['Intake', String(app.form.intake)],
    ['Academic year', app.form.academicYear],
    ['AISHE code', app.form.aisheCode],
    ['Land area', `${app.form.landArea} acres`],
    ['Built-up area', `${app.form.builtUpArea.toLocaleString('en-IN')} sq. m`],
    ['Principal', app.form.principalName],
    ['Contact', app.form.contactEmail],
    ['Address', app.form.address],
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link href="/applications" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Applications
      </Link>

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{app.refNo}</span>
              <StatusBadge status={app.status} />
            </div>
            <h1 className="text-pretty text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{institution.name}</h1>
            <p className="text-sm text-muted-foreground">
              {app.form.type} · {app.form.program} · {institution.city}, {institution.state} · submitted {formatDate(app.submittedAt)}
            </p>
          </div>
          {user.role === 'ro' && (
            <div className="shrink-0 lg:max-w-md [&>div]:lg:justify-end">
              <RoActions app={app} user={user} data={data} validation={validation} />
            </div>
          )}
        </div>
        <StageTracker status={app.status} />
      </Card>

      {app.status === 'Returned' && app.returnReason && (
        <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4">
          <Undo2 className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">Returned for correction</p>
            <p className="text-sm leading-relaxed text-foreground/90">{app.returnReason}</p>
            {isOwner && tab !== 'documents' && (
              <button type="button" onClick={() => selectTab('documents')} className="w-fit text-sm font-medium text-destructive hover:underline">
                Upload corrections
              </button>
            )}
          </div>
        </div>
      )}

      <div role="tablist" aria-label="Application sections" className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => selectTab(t.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            {t.id === 'documents' && validation.errors > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive-soft px-1.5 py-0.5 text-[11px] text-destructive">{validation.errors}</span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader title="Application details" />
              <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                {overviewRows.map(([label, value]) => (
                  <div key={label} className={cn('flex flex-col gap-0.5', label === 'Address' && 'sm:col-span-2')}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <CardHeader title="Validation" action={<CheckPill status={validation.status}>{validation.status === 'pass' ? 'All clear' : validation.status === 'warn' ? 'Review' : 'Issues'}</CheckPill>} />
              <div className="flex flex-col gap-4 p-5">
                <ValidationSummary validation={validation} />
                <button type="button" onClick={() => selectTab('documents')} className="w-fit text-sm font-medium text-primary-strong hover:underline">
                  View document checks
                </button>
              </div>
            </Card>
          </div>
        )}
        {tab === 'documents' &&
          (isOwner && app.status === 'Returned' ? (
            <CorrectionWorkspace app={app} institution={institution} user={user} />
          ) : (
            <DocumentsReview validation={validation} />
          ))}
        {tab === 'inspection' && <InspectionPanel app={app} user={user} data={data} />}
        {tab === 'timeline' && (
          <Card>
            <CardHeader title="Audit trail" description="Every status change, with who made it and when." />
            <Timeline app={app} />
          </Card>
        )}
      </div>
    </div>
  )
}
