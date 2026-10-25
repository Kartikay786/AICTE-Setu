'use client'

import { RequireRole } from '@/components/nexus/app-shell'
import { ApplicationFormView } from '@/components/nexus/application-form'

export default function NewApplicationPage() {
  return (
    <RequireRole roles={['institution']}>
      <ApplicationFormView />
    </RequireRole>
  )
}
