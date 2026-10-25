'use client'

import { AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/lib/nexus/types'
import type { CheckStatus } from '@/lib/nexus/validation'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

const variantClasses: Record<BtnVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-strong shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-surface shadow-sm',
  ghost: 'text-muted-foreground hover:bg-surface hover:text-foreground',
  danger: 'bg-destructive text-primary-foreground hover:opacity-90 shadow-sm',
  success: 'bg-success text-primary-foreground hover:opacity-90 shadow-sm',
}

export const Btn = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md'; icon?: LucideIcon }
>(function Btn({ variant = 'primary', size = 'md', icon: Icon, className, children, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </button>
  )
})

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)]', className)}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">{title}</h1>
        {description && <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

const statusStyle: Record<ApplicationStatus, string> = {
  Submitted: 'bg-surface text-foreground border-border',
  'Under Review': 'bg-primary-soft text-primary-strong border-primary/30',
  Returned: 'bg-destructive-soft text-destructive border-destructive/25',
  Resubmitted: 'bg-primary-soft text-primary-strong border-primary/30',
  'Forwarded to EVC': 'bg-surface text-foreground border-foreground/20',
  'EVC Scheduled': 'bg-primary-soft text-primary-strong border-primary/30',
  'EVC Completed': 'bg-success-soft text-success border-success/25',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyle[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  )
}

export function CheckIcon({ status, className }: { status: CheckStatus; className?: string }) {
  if (status === 'pass') return <CheckCircle2 className={cn('size-4 text-success', className)} aria-label="Passed" />
  if (status === 'warn')
    return <AlertTriangle className={cn('size-4 text-primary-strong', className)} aria-label="Warning" />
  return <XCircle className={cn('size-4 text-destructive', className)} aria-label="Failed" />
}

export function CheckPill({ status, children }: { status: CheckStatus; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'pass' && 'bg-success-soft text-success',
        status === 'warn' && 'bg-primary-soft text-primary-strong',
        status === 'fail' && 'bg-destructive-soft text-destructive',
      )}
    >
      <CheckIcon status={status} className="size-3.5" />
      {children}
    </span>
  )
}

export function DemoTag({ children = 'Simulated · demo data' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-foreground/25 bg-surface px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-surface">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

export const inputClass =
  'h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-destructive'

export const textareaClass =
  'min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl open:animate-in open:fade-in-0 open:zoom-in-95"
      aria-labelledby="modal-title"
    >
      {open && (
        <div className="flex flex-col">
          <div className="flex flex-col gap-1 px-6 pt-6">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {children && <div className="flex flex-col gap-4 px-6 pt-5">{children}</div>}
          <div className="mt-6 flex justify-end gap-2 border-t border-border bg-surface px-6 py-4">{footer}</div>
        </div>
      )}
    </dialog>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'neutral' | 'primary' | 'danger' | 'success'
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          tone === 'neutral' && 'bg-surface text-foreground',
          tone === 'primary' && 'bg-primary-soft text-primary-strong',
          tone === 'danger' && 'bg-destructive-soft text-destructive',
          tone === 'success' && 'bg-success-soft text-success',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        <span className="truncate text-sm text-muted-foreground">{label}</span>
      </div>
    </Card>
  )
}
