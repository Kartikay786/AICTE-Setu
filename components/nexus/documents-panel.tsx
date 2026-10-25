'use client'

import { FileText, FileX2, ScanText, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DOC_TYPES, getDocType } from '@/lib/nexus/doc-types'
import { replaceDocument, resubmitApplication } from '@/lib/nexus/store'
import type { Application, DocTypeKey, DemoUser, Institution, UploadedDocument } from '@/lib/nexus/types'
import { formatDate, validateApplication, type ApplicationValidation, type DocumentValidation } from '@/lib/nexus/validation'
import { DocumentSlot } from './document-slot'
import { Btn, Card, CardHeader, CheckIcon, CheckPill, DemoTag, Field, textareaClass } from './ui'

export function ValidationSummary({ validation }: { validation: ApplicationValidation }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
      {[
        { label: 'Issues', value: validation.errors, cls: 'text-destructive' },
        { label: 'Warnings', value: validation.warnings, cls: 'text-primary-strong' },
        { label: 'Passed', value: validation.passed, cls: 'text-success' },
      ].map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-0.5 py-3">
          <span className={`text-xl font-semibold tabular-nums ${s.cls}`}>{s.value}</span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function DocumentResult({ result }: { result: DocumentValidation }) {
  const config = getDocType(result.doc.type)
  return (
    <li className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-foreground">{config.label}</span>
            <span className="break-all text-xs text-muted-foreground">
              {result.doc.fileName} · uploaded {formatDate(result.doc.uploadedAt)}
              {result.doc.version > 1 && <span className="ml-1 font-medium text-primary-strong">· corrected v{result.doc.version}</span>}
            </span>
          </div>
        </div>
        <CheckPill status={result.status}>
          {result.status === 'pass' ? 'Valid' : result.status === 'warn' ? 'Review' : 'Issue found'}
        </CheckPill>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <ul className="flex flex-col gap-2">
          {result.checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5 text-sm">
              <CheckIcon status={c.status} className="mt-0.5 size-4 shrink-0" />
              <span className="leading-relaxed">
                <span className="font-medium text-foreground">{c.label}</span>
                <span className="text-muted-foreground"> — {c.message}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <ScanText className="size-3.5" aria-hidden />
              OCR & registry
            </span>
            <DemoTag>Simulated</DemoTag>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Confidence</dt>
            <dd className="font-mono text-foreground">{result.simulated.ocrConfidence}%</dd>
            <dt className="text-muted-foreground">Extracted name</dt>
            <dd className="truncate text-foreground" title={result.simulated.ocrExtractedName}>{result.simulated.ocrExtractedName || '—'}</dd>
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="font-mono text-foreground">{result.simulated.ocrReference}</dd>
            <dt className="text-muted-foreground">Authority</dt>
            <dd className={result.simulated.authorityStatus === 'Verified' ? 'text-success' : 'text-primary-strong'}>
              {result.simulated.authorityStatus}
            </dd>
          </dl>
        </div>
      </div>
    </li>
  )
}

export function DocumentsReview({ validation }: { validation: ApplicationValidation }) {
  return (
    <div className="flex flex-col gap-6">
      {(validation.missingDocuments.length > 0 || validation.fieldChecks.some((c) => c.status !== 'pass')) && (
        <Card>
          <CardHeader title="Application-level checks" />
          <ul className="flex flex-col gap-2 p-5">
            {validation.missingDocuments.map((m) => (
              <li key={m} className="flex items-start gap-2.5 text-sm">
                <FileX2 className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                <span>
                  <span className="font-medium text-foreground">Missing required document</span>
                  <span className="text-muted-foreground"> — {m}</span>
                </span>
              </li>
            ))}
            {validation.fieldChecks
              .filter((c) => c.status !== 'pass')
              .map((c) => (
                <li key={c.id} className="flex items-start gap-2.5 text-sm">
                  <CheckIcon status={c.status} className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="text-muted-foreground"> — {c.message}</span>
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      )}
      <Card>
        <CardHeader title="Uploaded documents" description="Rule-based checks run on every document. OCR and registry results are simulated." />
        <ul className="divide-y divide-border">
          {validation.documents.map((d) => (
            <DocumentResult key={d.doc.id} result={d} />
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function CorrectionWorkspace({ app, institution, user }: { app: Application; institution: Institution; user: DemoUser }) {
  const [pending, setPending] = useState<Partial<Record<DocTypeKey, UploadedDocument | null>>>({})
  const [note, setNote] = useState('')

  const effective = DOC_TYPES.map((config) => {
    const changed = config.key in pending
    const doc = changed ? pending[config.key] ?? null : app.documents.find((d) => d.type === config.key) ?? null
    return { config, doc, changed }
  })
  const effectiveDocs = effective.map((e) => e.doc).filter(Boolean) as UploadedDocument[]
  const preview = validateApplication({ ...app, documents: effectiveDocs }, institution)
  const changedTypes = effective.filter((e) => e.changed && e.doc).map((e) => e.config)
  const blocking = preview.documents.some((d) => d.checks.some((c) => c.id.startsWith('file-') && c.status === 'fail'))

  function handleResubmit() {
    if (changedTypes.length === 0) {
      toast.error('Upload at least one corrected document before resubmitting')
      return
    }
    if (blocking) {
      toast.error('A corrected file has an invalid type or size')
      return
    }
    for (const config of changedTypes) replaceDocument(app.id, pending[config.key]!)
    resubmitApplication(app.id, user, note.trim(), changedTypes.map((c) => c.label))
    toast.success('Corrections submitted', { description: 'The Regional Officer has been notified.' })
    setPending({})
    setNote('')
  }

  return (
    <Card>
      <CardHeader
        title="Correct and resubmit"
        description="Replace the flagged documents below. Checks update live; earlier versions stay on record."
        action={<CheckPill status={preview.status}>{preview.errors} issue{preview.errors === 1 ? '' : 's'} remaining</CheckPill>}
      />
      <div className="flex flex-col gap-3 p-5">
        {effective.map(({ config, doc }) => (
          <DocumentSlot
            key={config.key}
            config={config}
            institution={institution}
            defaultName={institution.name}
            value={doc}
            highlight={config.required && !doc}
            onChange={(next) =>
              setPending((p) => ({
                ...p,
                [config.key]: next ? { ...next, version: (app.documents.find((d) => d.type === config.key)?.version ?? 0) + 1 } : null,
              }))
            }
          />
        ))}
        <Field label="Note to Regional Officer (optional)" htmlFor="resubmit-note">
          <textarea
            id="resubmit-note"
            className={textareaClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Briefly describe what was corrected"
          />
        </Field>
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {changedTypes.length === 0 ? 'No documents changed yet' : `Changed: ${changedTypes.map((c) => c.label).join(', ')}`}
          </span>
          <Btn icon={Send} onClick={handleResubmit} disabled={changedTypes.length === 0}>
            Resubmit application
          </Btn>
        </div>
      </div>
    </Card>
  )
}
