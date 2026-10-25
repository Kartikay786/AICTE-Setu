import { Check, Undo2 } from 'lucide-react'
import { ROLE_LABELS, type Application, type ApplicationStatus } from '@/lib/nexus/types'
import { cn } from '@/lib/utils'
import { StatusBadge } from './ui'

const STAGES = ['Submitted', 'Regional review', 'With EVC', 'Inspection scheduled', 'Recommendation'] as const

const STAGE_INDEX: Record<ApplicationStatus, number> = {
  Submitted: 1,
  'Under Review': 1,
  Returned: 1,
  Resubmitted: 1,
  'Forwarded to EVC': 2,
  'EVC Scheduled': 3,
  'EVC Completed': 5,
}

export function StageTracker({ status }: { status: ApplicationStatus }) {
  const current = STAGE_INDEX[status]
  const returned = status === 'Returned'
  return (
    <ol className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-5 sm:gap-2" aria-label="Application progress">
      {STAGES.map((stage, i) => {
        const done = i < current
        const active = i === current
        const isReturned = returned && active
        return (
          <li key={stage} className="flex flex-col gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={cn(
                'h-1.5 rounded-full transition-colors',
                done ? 'bg-primary' : isReturned ? 'bg-destructive' : active ? 'bg-primary/40' : 'bg-border',
              )}
            />
            <span className="flex items-center gap-1 text-[11px] leading-tight sm:text-xs">
              {done && <Check className="size-3 shrink-0 text-primary-strong" aria-hidden />}
              {isReturned && <Undo2 className="size-3 shrink-0 text-destructive" aria-hidden />}
              <span className={cn(done || active ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                {isReturned ? 'Returned' : stage}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function Timeline({ app }: { app: Application }) {
  const events = [...app.history].reverse()
  return (
    <ol className="flex flex-col p-5">
      {events.map((e, i) => (
        <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < events.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%-0.75rem)] w-px bg-border" aria-hidden />}
          <span
            className={cn(
              'relative mt-1 size-[15px] shrink-0 rounded-full border-[3px] bg-card',
              i === 0 ? 'border-primary' : e.status === 'Returned' ? 'border-destructive' : 'border-border',
            )}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{e.action}</span>
              <StatusBadge status={e.status} />
            </div>
            <span className="text-xs text-muted-foreground">
              {e.actorName} · {ROLE_LABELS[e.actorRole]} ·{' '}
              <time dateTime={e.at}>
                {new Date(e.at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </span>
            {e.note && <p className="rounded-lg bg-surface px-3 py-2 text-sm leading-relaxed text-foreground/90">{e.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
