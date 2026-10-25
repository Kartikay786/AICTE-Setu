'use client'

import { AlertTriangle, FlaskConical, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DOC_TYPES } from '@/lib/nexus/doc-types'
import { submitApplication, uid } from '@/lib/nexus/store'
import type { ApplicationForm as FormShape, ApplicationType, DocTypeKey, UploadedDocument } from '@/lib/nexus/types'
import { validateApplication, validateForm } from '@/lib/nexus/validation'
import { useCurrent } from './app-shell'
import { DocumentSlot } from './document-slot'
import { Btn, Card, CardHeader, CheckIcon, Field, Modal, PageHeader, inputClass } from './ui'

const TYPES: ApplicationType[] = ['New Institution', 'Extension of Approval', 'Increase in Intake']

export function ApplicationFormView() {
  const { user, data } = useCurrent()
  const router = useRouter()
  const institution = data.institutions.find((i) => i.id === user.institutionId)!

  const [form, setForm] = useState<FormShape>({
    type: 'Extension of Approval',
    program: '',
    intake: 60,
    academicYear: '2027-28',
    institutionName: institution.name,
    aisheCode: institution.aisheCode,
    address: '',
    landArea: 0,
    builtUpArea: 0,
    principalName: '',
    contactEmail: '',
  })
  const [docs, setDocs] = useState<Partial<Record<DocTypeKey, UploadedDocument>>>({})
  const [attempted, setAttempted] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fieldErrors = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of validateForm(form, institution)) {
      if (c.status !== 'fail') continue
      const key = c.id.replace(/^req-/, '')
      const field =
        key === 'intake' ? 'intake' : key === 'land' ? 'landArea' : key === 'built' ? 'builtUpArea' : key === 'email' ? 'contactEmail' : key.startsWith('aishe') ? 'aisheCode' : key === 'name-match' ? 'institutionName' : key
      map[field] = c.message
    }
    return map
  }, [form, institution])

  const docList = Object.values(docs).filter(Boolean) as UploadedDocument[]
  const preview = validateApplication(
    { id: 'draft', refNo: '', institutionId: institution.id, form, documents: docList, status: 'Submitted', submittedAt: '', updatedAt: '', history: [] },
    institution,
  )
  const blockingDocs = preview.documents.filter((d) => d.checks.some((c) => c.id.startsWith('file-') && c.status === 'fail'))
  const flagged = [
    ...preview.missingDocuments.map((m) => `Missing: ${m}`),
    ...preview.documents.flatMap((d) =>
      d.checks.filter((c) => c.status !== 'pass').map((c) => `${DOC_TYPES.find((t) => t.key === d.doc.type)!.label} — ${c.message}`),
    ),
    ...preview.fieldChecks.filter((c) => c.status === 'warn').map((c) => c.message),
  ]

  function set<K extends keyof FormShape>(key: K, value: FormShape[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function loadSample() {
    setForm({
      type: 'Increase in Intake',
      program: 'B.Tech Artificial Intelligence & Data Science',
      intake: 60,
      academicYear: '2027-28',
      institutionName: institution.name,
      aisheCode: institution.aisheCode,
      address: `${institution.city}, ${institution.state}`,
      landArea: 8.5,
      builtUpArea: 21500,
      principalName: 'Dr. Vivek Joshi',
      contactEmail: user.email,
    })
    const mk = (type: DocTypeKey, fileName: string, nameOnDocument: string, authority: string, expiryDate?: string): UploadedDocument => ({
      id: uid('doc'),
      type,
      fileName,
      fileSize: 412_000,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      nameOnDocument,
      issuingAuthority: authority,
      issueDate: '2025-06-01',
      expiryDate,
      version: 1,
    })
    setDocs({
      land_deed: mk('land_deed', 'land-deed.pdf', institution.name, 'Sub-Registrar Office'),
      building_cert: mk('building_cert', 'building-completion.pdf', institution.name, 'Municipal Corporation'),
      fire_noc: mk('fire_noc', 'fire-noc.pdf', institution.name, 'State Fire Services', '2027-09-30'),
      trust_reg: mk('trust_reg', 'trust-registration.pdf', institution.trust, 'Charity Commissioner'),
    })
    toast.info('Sample data loaded', {
      description: 'Includes a deliberate name mismatch and a missing affidavit to demonstrate validation.',
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAttempted(true)
    if (Object.keys(fieldErrors).length > 0) {
      toast.error('Please fix the highlighted fields before submitting')
      return
    }
    if (blockingDocs.length > 0) {
      toast.error('One or more files have an invalid type or size', { description: 'Replace them with a PDF, JPG or PNG under 10 MB.' })
      return
    }
    if (docList.length === 0) {
      toast.error('Upload at least one document')
      return
    }
    if (flagged.length > 0) {
      setConfirmOpen(true)
      return
    }
    finalize()
  }

  function finalize() {
    const app = submitApplication(user, form, docList)
    setConfirmOpen(false)
    toast.success('Application submitted', { description: `${app.refNo} is now with the Regional Officer.` })
    router.push(`/applications/${app.id}`)
  }

  const err = (k: string) => (attempted ? fieldErrors[k] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <PageHeader
        title="New approval application"
        description={`Submitting on behalf of ${institution.name}`}
        action={
          <Btn variant="secondary" icon={FlaskConical} onClick={loadSample}>
            Load sample data
          </Btn>
        }
      />

      <Card>
        <CardHeader title="Application details" description="Institution fields are checked against your AICTE record." />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="Application type" htmlFor="type">
            <select id="type" className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value as ApplicationType)}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Academic year" htmlFor="ay" error={err('academicYear')}>
            <select id="ay" className={inputClass} value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)}>
              <option>2027-28</option>
              <option>2028-29</option>
            </select>
          </Field>
          <Field label="Programme" htmlFor="program" error={err('program')} className="sm:col-span-2">
            <input id="program" className={inputClass} aria-invalid={!!err('program')} placeholder="e.g. B.Tech Computer Science & Engineering" value={form.program} onChange={(e) => set('program', e.target.value)} />
          </Field>
          <Field label="Proposed intake" htmlFor="intake" error={err('intake')} hint="Between 1 and 300 seats">
            <input id="intake" type="number" min={1} max={300} className={inputClass} aria-invalid={!!err('intake')} value={form.intake || ''} onChange={(e) => set('intake', Number(e.target.value))} />
          </Field>
          <Field label="Principal / Director" htmlFor="principal" error={err('principalName')}>
            <input id="principal" className={inputClass} aria-invalid={!!err('principalName')} value={form.principalName} onChange={(e) => set('principalName', e.target.value)} />
          </Field>
          <Field label="Institution name" htmlFor="iname" error={err('institutionName')}>
            <input id="iname" className={inputClass} aria-invalid={!!err('institutionName')} value={form.institutionName} onChange={(e) => set('institutionName', e.target.value)} />
          </Field>
          <Field label="AISHE code" htmlFor="aishe" error={err('aisheCode')} hint="Format C-12345">
            <input id="aishe" className={`${inputClass} font-mono`} aria-invalid={!!err('aisheCode')} value={form.aisheCode} onChange={(e) => set('aisheCode', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Campus address" htmlFor="address" error={err('address')} className="sm:col-span-2">
            <input id="address" className={inputClass} aria-invalid={!!err('address')} value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label="Land area (acres)" htmlFor="land" error={err('landArea')}>
            <input id="land" type="number" step="0.1" min={0} className={inputClass} aria-invalid={!!err('landArea')} value={form.landArea || ''} onChange={(e) => set('landArea', Number(e.target.value))} />
          </Field>
          <Field label="Built-up area (sq. m)" htmlFor="built" error={err('builtUpArea')}>
            <input id="built" type="number" min={0} className={inputClass} aria-invalid={!!err('builtUpArea')} value={form.builtUpArea || ''} onChange={(e) => set('builtUpArea', Number(e.target.value))} />
          </Field>
          <Field label="Contact email" htmlFor="email" error={err('contactEmail')} className="sm:col-span-2">
            <input id="email" type="email" className={inputClass} aria-invalid={!!err('contactEmail')} value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Supporting documents"
          description="Each file is checked for type, size, validity dates, institution name and issuing authority as you upload."
        />
        <div className="flex flex-col gap-3 p-5">
          {DOC_TYPES.map((config) => (
            <DocumentSlot
              key={config.key}
              config={config}
              institution={institution}
              defaultName={form.institutionName}
              value={docs[config.key] ?? null}
              highlight={attempted && config.required && !docs[config.key]}
              onChange={(doc) =>
                setDocs((d) => {
                  const next = { ...d }
                  if (doc) next[config.key] = doc
                  else delete next[config.key]
                  return next
                })
              }
            />
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-2 text-sm">
          <CheckIcon status={preview.status} />
          <span className="break-words text-foreground">
            {preview.errors} issue{preview.errors === 1 ? '' : 's'} · {preview.warnings} warning{preview.warnings === 1 ? '' : 's'} · {docList.length}/{DOC_TYPES.length} documents
          </span>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Btn variant="ghost" onClick={() => router.push('/applications')}>
            Cancel
          </Btn>
          <Btn type="submit" icon={Send}>
            Submit application
          </Btn>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit with flagged items?"
        description="Validation found the items below. You can still submit — the Regional Officer will see the same results and may return the application."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setConfirmOpen(false)}>
              Go back and fix
            </Btn>
            <Btn onClick={finalize}>Submit anyway</Btn>
          </>
        }
      >
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto">
          {flagged.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </Modal>
    </form>
  )
}
