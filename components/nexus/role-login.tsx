'use client'

import { ArrowRight, Building2, ClipboardCheck, Loader2, ShieldCheck, Stamp, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { login, resetDemo, useNexus } from '@/lib/nexus/store'
import { ROLE_LABELS, type Role } from '@/lib/nexus/types'
import { cn } from '@/lib/utils'
import { BrandMark } from './brand'
import { Btn } from './ui'

const ROLES: { role: Role; icon: LucideIcon; blurb: string }[] = [
  { role: 'institution', icon: Building2, blurb: 'Submit applications, upload documents and correct deficiencies.' },
  { role: 'ro', icon: Stamp, blurb: 'Review submissions, inspect validation and return or advance cases.' },
  { role: 'evc', icon: ClipboardCheck, blurb: 'Schedule assigned visits and record inspection recommendations.' },
  { role: 'superadmin', icon: ShieldCheck, blurb: 'Monitor every application and manage demo accounts.' },
]

const FLOW = [
  'Institution submits application with documents',
  'Validation flags a missing or mismatched document',
  'Regional Officer returns it with a reason',
  'Institution uploads the correction and resubmits',
  'Regional Officer advances it to EVC',
  'EVC Member records an inspection recommendation',
  'Super Admin reviews status and full history',
]

export function RoleLogin() {
  const snap = useNexus()
  const router = useRouter()
  const [role, setRole] = useState<Role>('institution')
  const [userId, setUserId] = useState<string>('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (snap?.sessionUserId && snap.data.users.some((u) => u.id === snap.sessionUserId && u.active)) {
      router.replace('/dashboard')
    }
  }, [snap, router])

  const accounts = snap?.data.users.filter((u) => u.role === role && u.active) ?? []
  const selected = accounts.find((u) => u.id === userId) ?? accounts[0]

  function handleLogin() {
    if (!selected) return
    setPending(true)
    login(selected.id)
    toast.success(`Signed in as ${selected.name}`, { description: ROLE_LABELS[selected.role] })
    router.push('/dashboard')
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 grid-cols-2 gap-0.5 rounded-lg bg-primary p-1.5" aria-hidden>
            <span className="rounded-sm bg-primary-foreground" />
            <span className="rounded-sm bg-primary-foreground/50" />
            <span className="rounded-sm bg-primary-foreground/50" />
            <span className="rounded-sm bg-primary-foreground" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">AICTE Nexus</span>
        </div>

        <div className="flex max-w-lg flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Approval workflow · Document validation</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance">
              One file, every desk it passes through, on the record.
            </h1>
            <p className="leading-relaxed text-background/70 text-pretty">
              A frontend prototype that walks an approval application from submission to expert visit — with checks for
              missing documents, expired certificates and mismatched institution details.
            </p>
          </div>

          <ol className="flex flex-col">
            {FLOW.map((step, i) => (
              <li key={step} className="relative flex gap-4 pb-4 last:pb-0">
                {i < FLOW.length - 1 && (
                  <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-background/20" aria-hidden />
                )}
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/60 font-mono text-[11px] text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm text-background/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs text-background/50">
          Prototype only. All institutions, documents and verification results are dummy data stored in your browser.
        </p>
      </section>

      <section className="flex flex-col justify-center gap-8 px-5 py-10 sm:px-10">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to the demo</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Choose a role to explore. Changes made in one role are visible to the others.
          </p>
        </div>

        {!snap ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        ) : (
          <>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium text-foreground">Role</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map(({ role: r, icon: Icon, blurb }) => {
                  const active = role === r
                  const count = snap.data.users.filter((u) => u.role === r && u.active).length
                  return (
                    <label
                      key={r}
                      className={cn(
                        'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all',
                        active
                          ? 'border-primary bg-primary-soft shadow-[0_0_0_3px_rgb(255_132_52/0.15)]'
                          : 'border-border bg-card hover:border-foreground/20',
                        count === 0 && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={active}
                        disabled={count === 0}
                        onChange={() => {
                          setRole(r)
                          setUserId('')
                        }}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-2">
                        <Icon className={cn('size-4', active ? 'text-primary-strong' : 'text-muted-foreground')} aria-hidden />
                        <span className="text-sm font-semibold text-foreground">{ROLE_LABELS[r]}</span>
                      </span>
                      <span className="text-xs leading-relaxed text-muted-foreground">{blurb}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="account" className="text-sm font-medium text-foreground">
                Demo account
              </label>
              <select
                id="account"
                value={selected?.id ?? ''}
                onChange={(e) => setUserId(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {accounts.map((u) => {
                  const inst = snap.data.institutions.find((i) => i.id === u.institutionId)
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} — {inst ? inst.name : u.email}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <Btn onClick={handleLogin} disabled={!selected || pending} className="h-11">
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Continue as {ROLE_LABELS[role]}
                <ArrowRight className="size-4" aria-hidden />
              </Btn>
              <button
                type="button"
                onClick={() => {
                  resetDemo()
                  toast.success('Demo data reset to the original sample set')
                }}
                className="self-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Reset demo data
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
