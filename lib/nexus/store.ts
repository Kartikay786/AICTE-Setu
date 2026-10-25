'use client'

import { useSyncExternalStore } from 'react'
import { SEED_VERSION, createSeedState } from './seed'
import type {
  Application,
  ApplicationForm,
  ApplicationStatus,
  DemoUser,
  EvcRecord,
  InspectionScores,
  NexusState,
  Recommendation,
  UploadedDocument,
} from './types'

const DATA_KEY = 'aicte-nexus:data'
const SESSION_KEY = 'aicte-nexus:session'

type Snapshot = { data: NexusState; sessionUserId: string | null }

let snapshot: Snapshot | null = null
const listeners = new Set<() => void>()

function load(): Snapshot {
  let data: NexusState | null = null
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as NexusState
      if (parsed.version === SEED_VERSION) data = parsed
    }
  } catch {
    data = null
  }
  if (!data) {
    data = createSeedState()
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  }
  return { data, sessionUserId: localStorage.getItem(SESSION_KEY) }
}

function getSnapshot() {
  if (!snapshot) snapshot = load()
  return snapshot
}

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === DATA_KEY || e.key === SESSION_KEY) {
      snapshot = load()
      emit()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function setData(updater: (data: NexusState) => NexusState) {
  const current = getSnapshot()
  const data = updater(current.data)
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  snapshot = { ...current, data }
  emit()
}

export function useNexus(): Snapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function useSessionUser(): { ready: boolean; user: DemoUser | null; data: NexusState | null } {
  const snap = useNexus()
  if (!snap) return { ready: false, user: null, data: null }
  const user = snap.data.users.find((u) => u.id === snap.sessionUserId && u.active) ?? null
  return { ready: true, user, data: snap.data }
}

export function login(userId: string) {
  localStorage.setItem(SESSION_KEY, userId)
  snapshot = { ...getSnapshot(), sessionUserId: userId }
  emit()
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  snapshot = { ...getSnapshot(), sessionUserId: null }
  emit()
}

export function resetDemo() {
  const data = createSeedState()
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  snapshot = { ...getSnapshot(), data }
  emit()
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function visibleApplications(data: NexusState, user: DemoUser): Application[] {
  const apps = [...data.applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  if (user.role === 'institution') return apps.filter((a) => a.institutionId === user.institutionId)
  if (user.role === 'evc') return apps.filter((a) => a.evc?.assignedTo === user.id)
  if (user.role === 'ro') {
    const regionInst = data.institutions.filter((i) => i.region === user.region).map((i) => i.id)
    return apps.filter((a) => regionInst.includes(a.institutionId))
  }
  return apps
}

export function canView(data: NexusState, user: DemoUser, app: Application) {
  return visibleApplications(data, user).some((a) => a.id === app.id)
}

function transition(
  appId: string,
  actor: DemoUser,
  status: ApplicationStatus,
  action: string,
  note?: string,
  patch: (app: Application) => Partial<Application> = () => ({}),
) {
  const at = new Date().toISOString()
  setData((data) => ({
    ...data,
    applications: data.applications.map((app) =>
      app.id !== appId
        ? app
        : {
            ...app,
            ...patch(app),
            status,
            updatedAt: at,
            history: [
              ...app.history,
              { id: uid('h'), at, actorName: actor.name, actorRole: actor.role, action, note, status },
            ],
          },
    ),
  }))
}

export function submitApplication(actor: DemoUser, form: ApplicationForm, documents: UploadedDocument[]) {
  const data = getSnapshot().data
  const refNumbers = data.applications.map((a) => Number(a.refNo.split('/').pop()) || 0)
  const next = Math.max(0, ...refNumbers) + 1
  const at = new Date().toISOString()
  const app: Application = {
    id: uid('app'),
    refNo: `AICTE/WR/2027/${String(next).padStart(4, '0')}`,
    institutionId: actor.institutionId!,
    form,
    documents,
    status: 'Submitted',
    submittedAt: at,
    updatedAt: at,
    history: [
      {
        id: uid('h'),
        at,
        actorName: actor.name,
        actorRole: actor.role,
        action: `Application submitted with ${documents.length} documents`,
        status: 'Submitted',
      },
    ],
  }
  setData((d) => ({ ...d, applications: [app, ...d.applications] }))
  return app
}

export function startReview(appId: string, actor: DemoUser) {
  transition(appId, actor, 'Under Review', 'Review started')
}

export function returnApplication(appId: string, actor: DemoUser, reason: string) {
  transition(appId, actor, 'Returned', 'Returned to institution for correction', reason, () => ({
    returnReason: reason,
  }))
}

export function forwardToEvc(appId: string, actor: DemoUser, note: string, evcUserId: string) {
  transition(appId, actor, 'Forwarded to EVC', 'Advanced to Expert Visit Committee', note || undefined, () => ({
    evc: { assignedTo: evcUserId },
  }))
}

export function replaceDocument(appId: string, doc: UploadedDocument) {
  setData((data) => ({
    ...data,
    applications: data.applications.map((app) => {
      if (app.id !== appId) return app
      const existing = app.documents.find((d) => d.type === doc.type)
      const version = existing ? existing.version + 1 : 1
      const documents = existing
        ? app.documents.map((d) => (d.type === doc.type ? { ...doc, version } : d))
        : [...app.documents, { ...doc, version }]
      return { ...app, documents, updatedAt: new Date().toISOString() }
    }),
  }))
}

export function updateForm(appId: string, form: ApplicationForm) {
  setData((data) => ({
    ...data,
    applications: data.applications.map((app) => (app.id === appId ? { ...app, form } : app)),
  }))
}

export function resubmitApplication(appId: string, actor: DemoUser, note: string, changed: string[]) {
  const summary = changed.length ? `Corrected: ${changed.join(', ')}` : 'Resubmitted without document changes'
  transition(appId, actor, 'Resubmitted', 'Corrections uploaded and resubmitted', note ? `${summary}. ${note}` : summary, () => ({
    returnReason: undefined,
  }))
}

export function scheduleInspection(
  appId: string,
  actor: DemoUser,
  visit: Pick<EvcRecord, 'visitDate' | 'visitTime' | 'committee'>,
  isReschedule: boolean,
) {
  const date = visit.visitDate ? new Date(`${visit.visitDate}T00:00:00`) : null
  const formatted = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : visit.visitDate || 'selected date'

  transition(
    appId,
    actor,
    'EVC Scheduled',
    `${isReschedule ? 'Inspection rescheduled' : 'Inspection scheduled'} for ${formatted}, ${visit.visitTime}`,
    visit.committee ? `Committee: ${visit.committee}` : undefined,
    (app) => ({ evc: { ...app.evc!, ...visit } }),
  )
}

export function submitInspection(
  appId: string,
  actor: DemoUser,
  result: { recommendation: Recommendation; remarks: string; scores: InspectionScores },
) {
  transition(
    appId,
    actor,
    'EVC Completed',
    `Inspection recommendation submitted: ${result.recommendation}`,
    result.remarks,
    (app) => ({ evc: { ...app.evc!, ...result, completedAt: new Date().toISOString() } }),
  )
}

export function updateUser(userId: string, patch: Partial<DemoUser>) {
  setData((data) => ({
    ...data,
    users: data.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
  }))
}
