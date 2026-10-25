'use client'

import { CalendarCheck, CalendarClock, ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { scheduleInspection, submitInspection } from '@/lib/nexus/store'
import type { Application, DemoUser, InspectionScores, NexusState, Recommendation } from '@/lib/nexus/types'
import { formatDate } from '@/lib/nexus/validation'
import { cn } from '@/lib/utils'
import { Btn, Card, CardHeader, EmptyState, Field, inputClass, textareaClass } from './ui'

const RECOMMENDATIONS: Recommendation[] = ['Recommended for Approval', 'Recommended with Conditions', 'Not Recommended']
const SCORE_LABELS: Record<keyof InspectionScores, string> = {
  infrastructure: 'Infrastructure',
  faculty: 'Faculty',
  labs: 'Laboratories',
  library: 'Library',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function ScheduleForm({ app, user }: { app: Application; user: DemoUser }) {
  const isReschedule = app.status === 'EVC Scheduled'
  const [date, setDate] = useState(app.evc?.visitDate ?? '')
  const [time, setTime] = useState(app.evc?.visitTime ?? '10:00')
  const [committee, setCommittee] = useState(app.evc?.committee ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!date) next.date = 'Choose a visit date'
    else if (date < todayIso()) next.date = 'Visit date cannot be in the past'
    if (!time) next.time = 'Choose a time'
    if (committee.trim().length < 3) next.committee = 'List at least one committee member'
    setErrors(next)
    if (Object.keys(next).length) return
    scheduleInspection(app.id, user, { visitDate: date, visitTime: time, committee: committee.trim() }, isReschedule)
    toast.success(isReschedule ? 'Inspection rescheduled' : 'Inspection scheduled', { description: `${formatDate(date)} at ${time}` })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 p-5 sm:grid-cols-2">
      <Field label="Visit date" htmlFor="visit-date" error={errors.date}>
        <input id="visit-date" type="date" min={todayIso()} className={inputClass} aria-invalid={!!errors.date} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Time" htmlFor="visit-time" error={errors.time}>
        <input id="visit-time" type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
      <Field label="Committee members" htmlFor="committee" error={errors.committee} className="sm:col-span-2" hint="Comma-separated names">
        <input id="committee" className={inputClass} aria-invalid={!!errors.committee} value={committee} onChange={(e) => setCommittee(e.target.value)} placeholder="Prof. Meera Iyer, Dr. S. Kulkarni" />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <Btn type="submit" icon={CalendarCheck} variant={isReschedule ? 'secondary' : 'primary'}>
          {isReschedule ? 'Reschedule visit' : 'Schedule visit'}
        </Btn>
      </div>
    </form>
  )
}

function ResultForm({ app, user }: { app: Application; user: DemoUser }) {
  const [scores, setScores] = useState<InspectionScores>({ infrastructure: 0, faculty: 0, labs: 0, library: 0 })
  const [recommendation, setRecommendation] = useState<Recommendation | ''>('')
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (Object.values(scores).some((s) => s === 0)) next.scores = 'Rate every area from 1 to 5'
    if (!recommendation) next.recommendation = 'Select a recommendation'
    if (remarks.trim().length < 20) next.remarks = 'Remarks must be at least 20 characters'
    setErrors(next)
    if (Object.keys(next).length) return
    submitInspection(app.id, user, { recommendation: recommendation as Recommendation, remarks: remarks.trim(), scores })
    toast.success('Inspection recommendation submitted')
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 p-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium text-foreground">Area ratings (1–5)</legend>
        {(Object.keys(SCORE_LABELS) as (keyof InspectionScores)[]).map((key) => (
          <div key={key} className="flex flex-wrap items-center justify-between gap-2">
            <span id={`score-${key}`} className="text-sm text-foreground">{SCORE_LABELS[key]}</span>
            <div role="radiogroup" aria-labelledby={`score-${key}`} className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={scores[key] === n}
                  aria-label={`${n} of 5`}
                  onClick={() => setScores((s) => ({ ...s, [key]: n }))}
                  className={cn(
                    'size-9 rounded-lg border text-sm font-medium transition-colors',
                    scores[key] >= n ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-surface',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        {errors.scores && <p className="text-xs text-destructive" role="alert">{errors.scores}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">Recommendation</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {RECOMMENDATIONS.map((r) => (
            <label
              key={r}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                recommendation === r ? 'border-primary bg-primary-soft text-foreground' : 'border-border text-muted-foreground hover:bg-surface',
              )}
            >
              <input type="radio" name="recommendation" value={r} checked={recommendation === r} onChange={() => setRecommendation(r)} className="accent-primary" />
              {r}
            </label>
          ))}
        </div>
        {errors.recommendation && <p className="text-xs text-destructive" role="alert">{errors.recommendation}</p>}
      </fieldset>

      <Field label="Remarks" htmlFor="remarks" error={errors.remarks}>
        <textarea id="remarks" className={textareaClass} rows={4} aria-invalid={!!errors.remarks} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Observations from the visit, conditions if any" />
      </Field>
      <div className="flex justify-end">
        <Btn type="submit" icon={ClipboardCheck}>
          Submit recommendation
        </Btn>
      </div>
    </form>
  )
}

function ResultView({ app, data }: { app: Application; data: NexusState }) {
  const evc = app.evc!
  const member = data.users.find((u) => u.id === evc.assignedTo)
  return (
    <div className="flex flex-col gap-5 p-5">
      <div
        className={cn(
          'rounded-xl border p-4',
          evc.recommendation === 'Not Recommended' ? 'border-destructive/30 bg-destructive-soft' : 'border-success/30 bg-success-soft',
        )}
      >
        <p className="text-xs text-muted-foreground">Recommendation · {formatDate(evc.completedAt)} · {member?.name}</p>
        <p className="text-lg font-semibold text-foreground">{evc.recommendation}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(SCORE_LABELS) as (keyof InspectionScores)[]).map((k) => (
          <div key={k} className="rounded-lg border border-border p-3">
            <dt className="text-xs text-muted-foreground">{SCORE_LABELS[k]}</dt>
            <dd className="text-lg font-semibold tabular-nums text-foreground">{evc.scores?.[k]}<span className="text-sm font-normal text-muted-foreground">/5</span></dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Remarks</span>
        <p className="text-sm leading-relaxed text-foreground">{evc.remarks}</p>
      </div>
    </div>
  )
}

export function InspectionPanel({ app, user, data }: { app: Application; user: DemoUser; data: NexusState }) {
  const evc = app.evc
  if (!evc) {
    return (
      <Card>
        <EmptyState icon={CalendarClock} title="Not yet with EVC" description="The Regional Officer has not advanced this application to the Expert Visit Committee." />
      </Card>
    )
  }

  const isAssignee = user.role === 'evc' && evc.assignedTo === user.id
  const member = data.users.find((u) => u.id === evc.assignedTo)

  return (
    <div className="flex flex-col gap-6">
      {evc.visitDate && (
        <Card>
          <CardHeader title="Visit details" />
          <dl className="grid gap-4 p-5 sm:grid-cols-4">
            <div><dt className="text-xs text-muted-foreground">Assigned to</dt><dd className="text-sm font-medium text-foreground">{member?.name}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Date</dt><dd className="text-sm font-medium text-foreground">{formatDate(evc.visitDate)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Time</dt><dd className="text-sm font-medium text-foreground">{evc.visitTime}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Committee</dt><dd className="text-sm font-medium text-foreground">{evc.committee}</dd></div>
          </dl>
        </Card>
      )}

      {app.status === 'EVC Completed' ? (
        <Card>
          <CardHeader title="Inspection outcome" />
          <ResultView app={app} data={data} />
        </Card>
      ) : isAssignee ? (
        <>
          <Card>
            <CardHeader title={app.status === 'EVC Scheduled' ? 'Reschedule visit' : 'Schedule visit'} />
            <ScheduleForm app={app} user={user} />
          </Card>
          {app.status === 'EVC Scheduled' && (
            <Card>
              <CardHeader title="Record inspection result" description="Submitting closes the EVC stage for this application." />
              <ResultForm app={app} user={user} />
            </Card>
          )}
        </>
      ) : (
        !evc.visitDate && (
          <Card>
            <EmptyState icon={CalendarClock} title="Awaiting scheduling" description={`Assigned to ${member?.name}. The visit has not been scheduled yet.`} />
          </Card>
        )
      )}
    </div>
  )
}
