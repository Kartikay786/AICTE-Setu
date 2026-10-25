'use client'

import { FilePlus2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { visibleApplications } from '@/lib/nexus/store'
import { useCurrent } from './app-shell'
import { ApplicationsTable } from './applications-table'
import { Btn, Card, PageHeader } from './ui'

const COPY = {
  institution: { title: 'My applications', description: 'Applications submitted by your institution.' },
  ro: { title: 'Review queue', description: 'All applications from institutions in your region.' },
  evc: { title: 'Assigned applications', description: 'Applications assigned to you for expert visit.' },
  superadmin: { title: 'All applications', description: 'Every application across regions and stages.' },
}

export function ApplicationsList() {
  const { user, data } = useCurrent()
  const router = useRouter()
  const apps = visibleApplications(data, user)
  const copy = COPY[user.role]

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          user.role === 'institution' ? (
            <Btn icon={FilePlus2} onClick={() => router.push('/applications/new')}>
              New application
            </Btn>
          ) : undefined
        }
      />
      <Card>
        <ApplicationsTable apps={apps} data={data} showInstitution={user.role !== 'institution'} />
      </Card>
    </>
  )
}
