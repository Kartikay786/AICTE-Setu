'use client'

import { RequireRole } from '@/components/nexus/app-shell'
import { InspectionsView } from '@/components/nexus/inspections-view'

export default function InspectionsPage() {
  return (
    <RequireRole roles={['evc', 'superadmin']}>
      <InspectionsView />
    </RequireRole>
  )
}
