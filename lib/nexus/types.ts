export type Role = 'institution' | 'ro' | 'evc' | 'superadmin'

export const ROLE_LABELS: Record<Role, string> = {
  institution: 'Institution Admin',
  ro: 'Regional Officer',
  evc: 'EVC Member',
  superadmin: 'Super Admin',
}

export type DemoUser = {
  id: string
  name: string
  email: string
  role: Role
  institutionId?: string
  region?: string
  active: boolean
}

export type Institution = {
  id: string
  name: string
  aisheCode: string
  city: string
  state: string
  region: string
  trust: string
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Returned'
  | 'Resubmitted'
  | 'Forwarded to EVC'
  | 'EVC Scheduled'
  | 'EVC Completed'

export const ALL_STATUSES: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Returned',
  'Resubmitted',
  'Forwarded to EVC',
  'EVC Scheduled',
  'EVC Completed',
]

export type ApplicationType = 'New Institution' | 'Extension of Approval' | 'Increase in Intake'

export type DocTypeKey =
  | 'land_deed'
  | 'building_cert'
  | 'fire_noc'
  | 'trust_reg'
  | 'affidavit'
  | 'building_plan'

export type UploadedDocument = {
  id: string
  type: DocTypeKey
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  nameOnDocument: string
  issuingAuthority: string
  issueDate: string
  expiryDate?: string
  version: number
}

export type AuditEvent = {
  id: string
  at: string
  actorName: string
  actorRole: Role
  action: string
  note?: string
  status: ApplicationStatus
}

export type Recommendation = 'Recommended for Approval' | 'Recommended with Conditions' | 'Not Recommended'

export type InspectionScores = {
  infrastructure: number
  faculty: number
  labs: number
  library: number
}

export type EvcRecord = {
  assignedTo: string
  visitDate?: string
  visitTime?: string
  committee?: string
  recommendation?: Recommendation
  remarks?: string
  scores?: InspectionScores
  completedAt?: string
}

export type ApplicationForm = {
  type: ApplicationType
  program: string
  intake: number
  academicYear: string
  institutionName: string
  aisheCode: string
  address: string
  landArea: number
  builtUpArea: number
  principalName: string
  contactEmail: string
}

export type Application = {
  id: string
  refNo: string
  institutionId: string
  form: ApplicationForm
  documents: UploadedDocument[]
  status: ApplicationStatus
  returnReason?: string
  evc?: EvcRecord
  submittedAt: string
  updatedAt: string
  history: AuditEvent[]
}

export type NexusState = {
  version: number
  users: DemoUser[]
  institutions: Institution[]
  applications: Application[]
}
