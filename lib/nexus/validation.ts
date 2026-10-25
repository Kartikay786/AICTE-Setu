import { ALLOWED_EXTENSIONS, ALLOWED_MIME, DOC_TYPES, MAX_FILE_BYTES, getDocType } from './doc-types'
import type { Application, ApplicationForm, Institution, UploadedDocument } from './types'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export type Check = {
  id: string
  label: string
  status: CheckStatus
  message: string
}

export type SimulatedResult = {
  ocrConfidence: number
  ocrExtractedName: string
  ocrReference: string
  authorityStatus: 'Verified' | 'Not recognised'
}

export type DocumentValidation = {
  doc: UploadedDocument
  checks: Check[]
  simulated: SimulatedResult
  status: CheckStatus
}

export type ApplicationValidation = {
  fieldChecks: Check[]
  missingDocuments: string[]
  documents: DocumentValidation[]
  errors: number
  warnings: number
  passed: number
  status: CheckStatus
}

const DAY = 24 * 60 * 60 * 1000

export function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function hash(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function worst(statuses: CheckStatus[]): CheckStatus {
  if (statuses.includes('fail')) return 'fail'
  if (statuses.includes('warn')) return 'warn'
  return 'pass'
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function checkFile(fileName: string, mimeType: string, size: number): Check[] {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const typeOk = ALLOWED_EXTENSIONS.includes(ext) && (!mimeType || ALLOWED_MIME.includes(mimeType))
  return [
    {
      id: 'file-type',
      label: 'File type',
      status: typeOk ? 'pass' : 'fail',
      message: typeOk ? `.${ext.toUpperCase()} accepted` : `.${ext || 'unknown'} not allowed — use PDF, JPG or PNG`,
    },
    {
      id: 'file-size',
      label: 'File size',
      status: size <= MAX_FILE_BYTES ? 'pass' : 'fail',
      message:
        size <= MAX_FILE_BYTES
          ? `${(size / 1024 / 1024).toFixed(2)} MB (max 10 MB)`
          : `${(size / 1024 / 1024).toFixed(1)} MB exceeds 10 MB limit`,
    },
  ]
}

export function validateDocument(
  doc: UploadedDocument,
  institution: Institution,
  now: Date = new Date(),
): DocumentValidation {
  const config = getDocType(doc.type)
  const checks: Check[] = [...checkFile(doc.fileName, doc.mimeType, doc.fileSize)]

  if (config.expires) {
    if (!doc.expiryDate) {
      checks.push({ id: 'expiry', label: 'Validity', status: 'fail', message: 'Expiry date not provided' })
    } else {
      const diff = new Date(doc.expiryDate).getTime() - now.getTime()
      if (diff < 0) {
        checks.push({
          id: 'expiry',
          label: 'Validity',
          status: 'fail',
          message: `Expired on ${formatDate(doc.expiryDate)}`,
        })
      } else if (diff < 60 * DAY) {
        checks.push({
          id: 'expiry',
          label: 'Validity',
          status: 'warn',
          message: `Expires in ${Math.ceil(diff / DAY)} days (${formatDate(doc.expiryDate)})`,
        })
      } else {
        checks.push({
          id: 'expiry',
          label: 'Validity',
          status: 'pass',
          message: `Valid until ${formatDate(doc.expiryDate)}`,
        })
      }
    }
  }

  if (doc.issueDate && new Date(doc.issueDate).getTime() > now.getTime()) {
    checks.push({ id: 'issue', label: 'Issue date', status: 'fail', message: 'Issue date is in the future' })
  }

  const nameMatches = normalizeName(doc.nameOnDocument) === normalizeName(institution.name)
  checks.push({
    id: 'name-match',
    label: 'Institution name',
    status: nameMatches ? 'pass' : 'fail',
    message: nameMatches
      ? 'Matches institution record'
      : `Document shows "${doc.nameOnDocument || '—'}", record is "${institution.name}"`,
  })

  const authorityKnown = config.authorities.includes(doc.issuingAuthority)
  checks.push({
    id: 'authority',
    label: 'Issuing authority',
    status: authorityKnown ? 'pass' : 'warn',
    message: authorityKnown
      ? `${doc.issuingAuthority} is a recognised issuer (demo registry)`
      : `${doc.issuingAuthority || 'Unknown'} is not a recognised issuer for this document`,
  })

  const h = hash(doc.fileName + doc.id)
  const simulated: SimulatedResult = {
    ocrConfidence: 81 + (h % 18),
    ocrExtractedName: doc.nameOnDocument,
    ocrReference: `${doc.type.toUpperCase().slice(0, 3)}/${(h % 90000) + 10000}/${new Date(doc.issueDate || now).getFullYear()}`,
    authorityStatus: authorityKnown ? 'Verified' : 'Not recognised',
  }

  return { doc, checks, simulated, status: worst(checks.map((c) => c.status)) }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AISHE = /^[CU]-\d{5}$/

export function validateForm(form: ApplicationForm, institution: Institution): Check[] {
  const checks: Check[] = []
  const required: [keyof ApplicationForm, string][] = [
    ['program', 'Programme'],
    ['academicYear', 'Academic year'],
    ['institutionName', 'Institution name'],
    ['aisheCode', 'AISHE code'],
    ['address', 'Campus address'],
    ['principalName', 'Principal / Director'],
    ['contactEmail', 'Contact email'],
  ]
  for (const [key, label] of required) {
    const value = String(form[key] ?? '').trim()
    if (!value) checks.push({ id: `req-${key}`, label, status: 'fail', message: `${label} is required` })
  }
  if (!form.intake || form.intake < 1 || form.intake > 300) {
    checks.push({ id: 'intake', label: 'Intake', status: 'fail', message: 'Intake must be between 1 and 300' })
  }
  if (!form.landArea || form.landArea <= 0) {
    checks.push({ id: 'land', label: 'Land area', status: 'fail', message: 'Land area must be greater than 0' })
  } else if (form.landArea < 2.5) {
    checks.push({
      id: 'land',
      label: 'Land area',
      status: 'warn',
      message: `${form.landArea} acres is below the 2.5 acre demo norm`,
    })
  }
  if (!form.builtUpArea || form.builtUpArea <= 0) {
    checks.push({ id: 'built', label: 'Built-up area', status: 'fail', message: 'Built-up area must be greater than 0' })
  }
  if (form.contactEmail && !EMAIL.test(form.contactEmail)) {
    checks.push({ id: 'email', label: 'Contact email', status: 'fail', message: 'Enter a valid email address' })
  }
  if (form.aisheCode && !AISHE.test(form.aisheCode.trim())) {
    checks.push({ id: 'aishe-format', label: 'AISHE code', status: 'fail', message: 'Format must be C-12345 or U-12345' })
  } else if (form.aisheCode && form.aisheCode.trim() !== institution.aisheCode) {
    checks.push({
      id: 'aishe-match',
      label: 'AISHE code',
      status: 'fail',
      message: `Does not match institution record (${institution.aisheCode})`,
    })
  }
  if (form.institutionName && normalizeName(form.institutionName) !== normalizeName(institution.name)) {
    checks.push({
      id: 'name-match',
      label: 'Institution name',
      status: 'fail',
      message: `Does not match institution record ("${institution.name}")`,
    })
  }
  return checks
}

export function validateApplication(app: Application, institution: Institution): ApplicationValidation {
  const fieldChecks = validateForm(app.form, institution)
  const missingDocuments = DOC_TYPES.filter(
    (d) => d.required && !app.documents.some((doc) => doc.type === d.key),
  ).map((d) => d.label)
  const documents = app.documents.map((d) => validateDocument(d, institution))
  const allChecks = [...fieldChecks, ...documents.flatMap((d) => d.checks)]
  const errors = allChecks.filter((c) => c.status === 'fail').length + missingDocuments.length
  const warnings = allChecks.filter((c) => c.status === 'warn').length
  const passed = allChecks.filter((c) => c.status === 'pass').length
  return {
    fieldChecks,
    missingDocuments,
    documents,
    errors,
    warnings,
    passed,
    status: errors > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
  }
}
