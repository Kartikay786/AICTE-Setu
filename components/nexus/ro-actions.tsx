'use client'

import { AlertTriangle, Eye, Send, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getDocType } from '@/lib/nexus/doc-types'
import { forwardToEvc, returnApplication, startReview } from '@/lib/nexus/store'
import type { Application, DemoUser, NexusState } from '@/lib/nexus/types'
import type { ApplicationValidation } from '@/lib/nexus/validation'
import { Btn, Field, Modal, inputClass, textareaClass } from './ui'

function issueSummary(validation: ApplicationValidation) {
  const lines = [
    ...validation.missingDocuments.map((m) => `${m} is missing.`),
    ...validation.documents.flatMap((d) =>
      d.checks.filter((c) => c.status === 'fail').map((c) => `${getDocType(d.doc.type).label}: ${c.message}.`),
    ),
  ]
  return lines.join(' ')
}

export function RoActions({
  app,
  user,
  data,
  validation,
}: {
  app: Application
  user: DemoUser
  data: NexusState
  validation: ApplicationValidation
}) {
  const [mode, setMode] = useState<'return' | 'forward' | null>(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string>()
  const evcMembers = data.users.filter((u) => u.role === 'evc' && u.active)
  const [evcId, setEvcId] = useState(evcMembers[0]?.id ?? '')

  const canAct = ['Submitted', 'Under Review', 'Resubmitted'].includes(app.status)
  if (!canAct) return null

  function close() {
    setMode(null)
    setError(undefined)
  }

  function confirmReturn() {
    if (reason.trim().length < 15) {
      setError('Give a specific reason of at least 15 characters so the institution knows what to fix.')
      return
    }
    returnApplication(app.id, user, reason.trim())
    toast.success('Application returned', { description: 'The institution can now upload corrections.' })
    setReason('')
    close()
  }

  function confirmForward() {
    if (!evcId) {
      setError('Select an EVC member.')
      return
    }
    forwardToEvc(app.id, user, note.trim(), evcId)
    const member = evcMembers.find((m) => m.id === evcId)
    toast.success('Advanced to EVC', { description: `Assigned to ${member?.name}.` })
    setNote('')
    close()
  }

  return (
    <div className="flex flex-wrap gap-2">
      {app.status !== 'Under Review' && (
        <Btn
          variant="secondary"
          icon={Eye}
          onClick={() => {
            startReview(app.id, user)
            toast.success('Marked as under review')
          }}
        >
          Start review
        </Btn>
      )}
      <Btn
        variant="danger"
        icon={Undo2}
        onClick={() => {
          if (!reason) setReason(issueSummary(validation))
          setMode('return')
        }}
      >
        Return for correction
      </Btn>
      <Btn icon={Send} onClick={() => setMode('forward')}>
        Advance to EVC
      </Btn>

      <Modal
        open={mode === 'return'}
        onClose={close}
        title="Return for correction"
        description="The institution will see this reason and can upload corrected documents."
        footer={
          <>
            <Btn variant="secondary" onClick={close}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={confirmReturn}>
              Return application
            </Btn>
          </>
        }
      >
        <Field label="Reason" htmlFor="return-reason" error={error} hint="Pre-filled from validation results — edit as needed.">
          <textarea
            id="return-reason"
            className={textareaClass}
            rows={5}
            value={reason}
            aria-invalid={!!error}
            onChange={(e) => {
              setReason(e.target.value)
              setError(undefined)
            }}
          />
        </Field>
      </Modal>

      <Modal
        open={mode === 'forward'}
        onClose={close}
        title="Advance to Expert Visit Committee"
        description="The selected EVC member will be able to schedule and record the inspection."
        footer={
          <>
            <Btn variant="secondary" onClick={close}>
              Cancel
            </Btn>
            <Btn onClick={confirmForward}>Advance</Btn>
          </>
        }
      >
        {validation.errors > 0 && (
          <div className="flex gap-2 rounded-lg border border-primary/30 bg-primary-soft p-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
            <span>
              Validation still reports {validation.errors} issue{validation.errors > 1 ? 's' : ''}. Advancing will record your
              decision to proceed regardless.
            </span>
          </div>
        )}
        <Field label="Assign EVC member" htmlFor="evc-member" error={error}>
          <select id="evc-member" className={inputClass} value={evcId} onChange={(e) => setEvcId(e.target.value)}>
            {evcMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Note (optional)" htmlFor="forward-note">
          <textarea id="forward-note" className={textareaClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </Modal>
    </div>
  )
}
