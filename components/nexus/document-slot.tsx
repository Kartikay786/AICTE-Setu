'use client'

import { FileText, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { DocTypeConfig } from '@/lib/nexus/doc-types'
import { ALL_AUTHORITIES } from '@/lib/nexus/doc-types'
import { uid } from '@/lib/nexus/store'
import type { Institution, UploadedDocument } from '@/lib/nexus/types'
import { validateDocument } from '@/lib/nexus/validation'
import { cn } from '@/lib/utils'
import { CheckIcon, CheckPill, inputClass } from './ui'

function isoDay(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentSlot({
  config,
  value,
  onChange,
  institution,
  defaultName,
  highlight,
}: {
  config: DocTypeConfig
  value: UploadedDocument | null
  onChange: (doc: UploadedDocument | null) => void
  institution: Institution
  defaultName: string
  highlight?: boolean
}) {
  const id = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])

  function handleFile(file: File) {
    setProgress(0)
    if (timer.current) clearInterval(timer.current)
    let pct = 0
    timer.current = setInterval(() => {
      pct += 20
      if (pct < 100) {
        setProgress(pct)
        return
      }
      if (timer.current) clearInterval(timer.current)
      setProgress(null)
      onChange({
            id: uid('doc'),
            type: config.key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            nameOnDocument: value?.nameOnDocument ?? defaultName,
            issuingAuthority: value?.issuingAuthority ?? config.authorities[0],
            issueDate: value?.issueDate ?? isoDay(-365),
            expiryDate: config.expires ? (value?.expiryDate ?? isoDay(365)) : undefined,
            version: value ? value.version : 1,
          })
    }, 120)
  }

  const result = value ? validateDocument(value, institution) : null

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors',
        result?.status === 'fail' ? 'border-destructive/40' : 'border-border',
        highlight && 'ring-2 ring-destructive/30',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {config.label}
              {config.required ? (
                <span className="ml-1.5 text-xs font-normal text-destructive">Required</span>
              ) : (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional</span>
              )}
            </span>
            {value ? (
              <span className="text-xs text-muted-foreground">
                {value.fileName} · {formatBytes(value.fileSize)}
                {value.version > 1 && ` · v${value.version}`}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">PDF, JPG or PNG · max 10 MB{config.expires && ' · must carry an expiry date'}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && <CheckPill status={result.status}>{result.status === 'pass' ? 'Valid' : result.status === 'warn' ? 'Review' : 'Issue found'}</CheckPill>}
          <input
            ref={fileRef}
            id={`${id}-file`}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }}
          />
          <label
            htmlFor={`${id}-file`}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface focus-within:ring-2 focus-within:ring-ring"
          >
            {value ? <RefreshCw className="size-3.5" aria-hidden /> : <UploadCloud className="size-3.5" aria-hidden />}
            {value ? 'Replace' : 'Upload'}
            <span className="sr-only"> {config.label}</span>
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Remove ${config.label}`}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {progress !== null && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">Uploading… {progress}% (simulated)</span>
        </div>
      )}

      {value && progress === null && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor={`${id}-name`} className="text-xs font-medium text-muted-foreground">
                Institution name on document
              </label>
              <input
                id={`${id}-name`}
                className={inputClass}
                value={value.nameOnDocument}
                onChange={(e) => onChange({ ...value, nameOnDocument: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-auth`} className="text-xs font-medium text-muted-foreground">
                Issuing authority
              </label>
              <select
                id={`${id}-auth`}
                className={inputClass}
                value={value.issuingAuthority}
                onChange={(e) => onChange({ ...value, issuingAuthority: e.target.value })}
              >
                {ALL_AUTHORITIES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-issue`} className="text-xs font-medium text-muted-foreground">
                  Issue date
                </label>
                <input
                  id={`${id}-issue`}
                  type="date"
                  className={inputClass}
                  value={value.issueDate}
                  onChange={(e) => onChange({ ...value, issueDate: e.target.value })}
                />
              </div>
              {config.expires && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${id}-exp`} className="text-xs font-medium text-muted-foreground">
                    Expiry date
                  </label>
                  <input
                    id={`${id}-exp`}
                    type="date"
                    className={inputClass}
                    value={value.expiryDate ?? ''}
                    onChange={(e) => onChange({ ...value, expiryDate: e.target.value || undefined })}
                  />
                </div>
              )}
            </div>
          </div>
          {result && result.status !== 'pass' && (
            <ul className="flex flex-col gap-1.5 rounded-lg bg-surface p-3">
              {result.checks
                .filter((c) => c.status !== 'pass')
                .map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
                    <CheckIcon status={c.status} className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      <span className="font-medium">{c.label}:</span> {c.message}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
