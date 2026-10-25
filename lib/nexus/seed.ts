import type { Application, AuditEvent, DemoUser, Institution, NexusState, UploadedDocument } from './types'

export const SEED_VERSION = 3

const institutions: Institution[] = [
  {
    id: 'inst-1',
    name: 'Shree Vidya Institute of Technology',
    aisheCode: 'C-41872',
    city: 'Nashik',
    state: 'Maharashtra',
    region: 'Western',
    trust: 'Shree Vidya Shikshan Trust',
  },
  {
    id: 'inst-2',
    name: 'Deccan College of Engineering',
    aisheCode: 'C-38215',
    city: 'Pune',
    state: 'Maharashtra',
    region: 'Western',
    trust: 'Deccan Education Society',
  },
  {
    id: 'inst-3',
    name: 'Narmada Institute of Management',
    aisheCode: 'C-52904',
    city: 'Vadodara',
    state: 'Gujarat',
    region: 'Western',
    trust: 'Narmada Vikas Foundation',
  },
]

const users: DemoUser[] = [
  {
    id: 'u-inst-1',
    name: 'Dr. Meera Kulkarni',
    email: 'admin@shreevidya.edu.in',
    role: 'institution',
    institutionId: 'inst-1',
    active: true,
  },
  {
    id: 'u-inst-2',
    name: 'Prof. Rakesh Patil',
    email: 'registrar@deccancoe.edu.in',
    role: 'institution',
    institutionId: 'inst-2',
    active: true,
  },
  { id: 'u-ro', name: 'Anil Deshmukh', email: 'ro.western@aicte.demo', role: 'ro', region: 'Western', active: true },
  { id: 'u-evc', name: 'Dr. Sunita Rao', email: 'evc.rao@aicte.demo', role: 'evc', active: true },
  { id: 'u-sa', name: 'Kavita Sharma', email: 'superadmin@aicte.demo', role: 'superadmin', active: true },
]

function doc(
  id: string,
  type: UploadedDocument['type'],
  fileName: string,
  nameOnDocument: string,
  issuingAuthority: string,
  issueDate: string,
  expiryDate?: string,
): UploadedDocument {
  return {
    id,
    type,
    fileName,
    fileSize: 380_000 + fileName.length * 21_000,
    mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    uploadedAt: '2026-10-12T10:00:00.000Z',
    nameOnDocument,
    issuingAuthority,
    issueDate,
    expiryDate,
    version: 1,
  }
}

function event(
  id: string,
  at: string,
  actor: DemoUser,
  action: string,
  status: AuditEvent['status'],
  note?: string,
): AuditEvent {
  return { id, at, actorName: actor.name, actorRole: actor.role, action, status, note }
}

const [inst1User, inst2User, ro, evc] = users

function fullDocs(prefix: string, name: string): UploadedDocument[] {
  return [
    doc(`${prefix}-d1`, 'land_deed', 'land-deed.pdf', name, 'Sub-Registrar Office', '2019-04-11'),
    doc(`${prefix}-d2`, 'building_cert', 'completion-certificate.pdf', name, 'Municipal Corporation', '2021-08-02'),
    doc(`${prefix}-d3`, 'fire_noc', 'fire-noc.pdf', name, 'State Fire Services', '2026-02-10', '2027-12-31'),
    doc(`${prefix}-d4`, 'trust_reg', 'trust-registration.pdf', name, 'Charity Commissioner', '2008-06-19'),
    doc(`${prefix}-d5`, 'affidavit', 'affidavit.pdf', name, 'Notary Public', '2026-09-28'),
  ]
}

const applications: Application[] = [
  {
    id: 'app-0142',
    refNo: 'AICTE/WR/2027/0142',
    institutionId: 'inst-1',
    form: {
      type: 'Increase in Intake',
      program: 'B.Tech Computer Science & Engineering',
      intake: 120,
      academicYear: '2027-28',
      institutionName: 'Shree Vidya Institute of Technology',
      aisheCode: 'C-41872',
      address: 'Gangapur Road, Nashik, Maharashtra 422013',
      landArea: 8.5,
      builtUpArea: 21500,
      principalName: 'Dr. Vivek Joshi',
      contactEmail: 'principal@shreevidya.edu.in',
    },
    documents: [
      doc('a142-d1', 'land_deed', 'land-deed-gangapur.pdf', 'Shree Vidya Institute of Technology', 'Sub-Registrar Office', '2014-03-21'),
      doc('a142-d2', 'building_cert', 'bcc-block-c.pdf', 'Shree Vidya Institute of Technology', 'Municipal Corporation', '2022-01-14'),
      doc('a142-d3', 'fire_noc', 'fire-noc-2025.pdf', 'Shree Vidya Institute of Technology', 'State Fire Services', '2024-09-01', '2026-08-31'),
      doc('a142-d4', 'trust_reg', 'trust-certificate.jpg', 'Shree Vidya Shikshan Trust', 'Charity Commissioner', '2006-11-05'),
    ],
    status: 'Submitted',
    submittedAt: '2026-10-21T09:12:00.000Z',
    updatedAt: '2026-10-21T09:12:00.000Z',
    history: [
      event('h1', '2026-10-21T09:12:00.000Z', inst1User, 'Application submitted with 4 documents', 'Submitted'),
    ],
  },
  {
    id: 'app-0128',
    refNo: 'AICTE/WR/2027/0128',
    institutionId: 'inst-2',
    form: {
      type: 'Extension of Approval',
      program: 'B.E. Mechanical Engineering',
      intake: 60,
      academicYear: '2027-28',
      institutionName: 'Deccan College of Engineering',
      aisheCode: 'C-38215',
      address: 'Karve Nagar, Pune, Maharashtra 411052',
      landArea: 12,
      builtUpArea: 30500,
      principalName: 'Dr. Sameer Gokhale',
      contactEmail: 'principal@deccancoe.edu.in',
    },
    documents: fullDocs('a128', 'Deccan College of Engineering'),
    status: 'Forwarded to EVC',
    submittedAt: '2026-10-08T11:30:00.000Z',
    updatedAt: '2026-10-19T15:05:00.000Z',
    evc: { assignedTo: 'u-evc' },
    history: [
      event('h1', '2026-10-08T11:30:00.000Z', inst2User, 'Application submitted with 5 documents', 'Submitted'),
      event('h2', '2026-10-15T10:00:00.000Z', ro, 'Review started', 'Under Review'),
      event('h3', '2026-10-19T15:05:00.000Z', ro, 'Advanced to Expert Visit Committee', 'Forwarded to EVC', 'All documents verified. Proceed with physical inspection.'),
    ],
  },
  {
    id: 'app-0119',
    refNo: 'AICTE/WR/2027/0119',
    institutionId: 'inst-3',
    form: {
      type: 'New Institution',
      program: 'MBA (Business Analytics)',
      intake: 60,
      academicYear: '2027-28',
      institutionName: 'Narmada Institute of Management',
      aisheCode: 'C-52904',
      address: 'Alkapuri, Vadodara, Gujarat 390007',
      landArea: 3.2,
      builtUpArea: 9800,
      principalName: 'Dr. Hetal Shah',
      contactEmail: 'director@nim.edu.in',
    },
    documents: fullDocs('a119', 'Narmada Institute of Management'),
    status: 'EVC Scheduled',
    submittedAt: '2026-09-29T08:45:00.000Z',
    updatedAt: '2026-10-18T12:00:00.000Z',
    evc: { assignedTo: 'u-evc', visitDate: '2026-11-04', visitTime: '10:30', committee: 'Dr. Sunita Rao (Chair), Prof. A. Menon, Er. R. Iyer' },
    history: [
      event('h1', '2026-09-29T08:45:00.000Z', { ...inst2User, name: 'Dr. Hetal Shah' }, 'Application submitted with 5 documents', 'Submitted'),
      event('h2', '2026-10-06T09:20:00.000Z', ro, 'Review started', 'Under Review'),
      event('h3', '2026-10-10T16:40:00.000Z', ro, 'Advanced to Expert Visit Committee', 'Forwarded to EVC'),
      event('h4', '2026-10-18T12:00:00.000Z', evc, 'Inspection scheduled for 04 Nov 2026, 10:30', 'EVC Scheduled'),
    ],
  },
  {
    id: 'app-0097',
    refNo: 'AICTE/WR/2027/0097',
    institutionId: 'inst-2',
    form: {
      type: 'Increase in Intake',
      program: 'B.E. Electronics & Telecommunication',
      intake: 90,
      academicYear: '2027-28',
      institutionName: 'Deccan College of Engineering',
      aisheCode: 'C-38215',
      address: 'Karve Nagar, Pune, Maharashtra 411052',
      landArea: 12,
      builtUpArea: 30500,
      principalName: 'Dr. Sameer Gokhale',
      contactEmail: 'principal@deccancoe.edu.in',
    },
    documents: fullDocs('a097', 'Deccan College of Engineering'),
    status: 'EVC Completed',
    submittedAt: '2026-09-02T10:10:00.000Z',
    updatedAt: '2026-10-09T17:30:00.000Z',
    evc: {
      assignedTo: 'u-evc',
      visitDate: '2026-10-07',
      visitTime: '11:00',
      committee: 'Dr. Sunita Rao (Chair), Prof. K. Nair',
      recommendation: 'Recommended with Conditions',
      remarks: 'Labs adequate. Library journal subscriptions to be expanded before intake increase.',
      scores: { infrastructure: 4, faculty: 4, labs: 5, library: 3 },
      completedAt: '2026-10-09T17:30:00.000Z',
    },
    history: [
      event('h1', '2026-09-02T10:10:00.000Z', inst2User, 'Application submitted with 5 documents', 'Submitted'),
      event('h2', '2026-09-10T09:00:00.000Z', ro, 'Review started', 'Under Review'),
      event('h3', '2026-09-18T14:15:00.000Z', ro, 'Advanced to Expert Visit Committee', 'Forwarded to EVC'),
      event('h4', '2026-09-25T11:00:00.000Z', evc, 'Inspection scheduled for 07 Oct 2026, 11:00', 'EVC Scheduled'),
      event('h5', '2026-10-09T17:30:00.000Z', evc, 'Inspection recommendation submitted: Recommended with Conditions', 'EVC Completed'),
    ],
  },
]

export function createSeedState(): NexusState {
  return structuredClone({ version: SEED_VERSION, users, institutions, applications })
}
