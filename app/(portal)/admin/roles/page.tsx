'use client'

import { RequireRole } from '@/components/nexus/app-shell'
import { RolesAdmin } from '@/components/nexus/roles-admin'

export default function RolesPage() {
  return (
    <RequireRole roles={['superadmin']}>
      <RolesAdmin />
    </RequireRole>
  )
}
