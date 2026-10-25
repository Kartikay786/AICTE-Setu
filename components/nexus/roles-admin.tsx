'use client'

import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { resetDemo, updateUser } from '@/lib/nexus/store'
import { ROLE_LABELS } from '@/lib/nexus/types'
import { cn } from '@/lib/utils'
import { useCurrent } from './app-shell'
import { Btn, Card, CardHeader, DemoTag, Modal, PageHeader } from './ui'

export function RolesAdmin() {
  const { user, data } = useCurrent()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <PageHeader
        title="Demo roles"
        description="Accounts available on the sign-in screen. Deactivated accounts cannot sign in."
        action={
          <Btn variant="secondary" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Btn>
        }
      />
      <Card>
        <CardHeader title="Accounts" action={<DemoTag>Demo accounts</DemoTag>} />
        <ul className="divide-y divide-border md:hidden">
          {data.users.map((u) => {
            const inst = data.institutions.find((i) => i.id === u.institutionId)
            const scope = inst ? inst.name : u.region ? `${u.region} region` : 'All regions'
            const isSelf = u.id === user.id
            return (
              <li key={u.id} className="flex flex-col gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="break-words text-sm font-medium text-foreground">
                    {u.name}{isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
                  </span>
                  <span className="break-all text-xs text-muted-foreground">{u.email}</span>
                </div>
                <dl className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="text-foreground">{ROLE_LABELS[u.role]}</dd>
                  <dt className="text-muted-foreground">Scope</dt>
                  <dd className="break-words text-foreground">{scope}</dd>
                </dl>
                <label className={cn('flex items-center justify-between gap-3', isSelf ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                  <span className="text-xs text-muted-foreground">{u.active ? 'Active' : 'Disabled'}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={u.active}
                    disabled={isSelf}
                    aria-label={`${u.active ? 'Disable' : 'Enable'} ${u.name}`}
                    onChange={(e) => {
                      updateUser(u.id, { active: e.target.checked })
                      toast.success(`${u.name} ${e.target.checked ? 'enabled' : 'disabled'}`)
                    }}
                    className="peer sr-only"
                  />
                  <span className="relative h-5 w-9 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                </label>
              </li>
            )
          })}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Role</th>
                <th scope="col" className="px-5 py-3 font-medium">Scope</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.users.map((u) => {
                const inst = data.institutions.find((i) => i.id === u.institutionId)
                const scope = inst ? inst.name : u.region ? `${u.region} region` : 'All regions'
                const isSelf = u.id === user.id
                return (
                  <tr key={u.id}>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{u.name}{isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{ROLE_LABELS[u.role]}</td>
                    <td className="max-w-56 truncate px-5 py-3 text-muted-foreground">{scope}</td>
                    <td className="px-5 py-3 text-right">
                      <label className={cn('inline-flex items-center gap-2', isSelf ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                        <span className="text-xs text-muted-foreground">{u.active ? 'Active' : 'Disabled'}</span>
                        <input
                          type="checkbox"
                          role="switch"
                          checked={u.active}
                          disabled={isSelf}
                          aria-label={`${u.active ? 'Disable' : 'Enable'} ${u.name}`}
                          onChange={(e) => {
                            updateUser(u.id, { active: e.target.checked })
                            toast.success(`${u.name} ${e.target.checked ? 'enabled' : 'disabled'}`)
                          }}
                          className="peer sr-only"
                        />
                        <span className="relative h-5 w-9 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="All applications, uploads and account changes return to the original seed. You will stay signed in if your account exists in the seed."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            <Btn
              variant="danger"
              onClick={() => {
                resetDemo()
                setConfirmReset(false)
                toast.success('Demo data reset')
              }}
            >
              Reset
            </Btn>
          </>
        }
      />
    </>
  )
}
