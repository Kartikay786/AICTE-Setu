import { Suspense } from 'react'
import { ApplicationDetail } from '@/components/nexus/application-detail'

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense>
      <ApplicationDetail id={id} />
    </Suspense>
  )
}
