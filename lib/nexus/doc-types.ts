import type { DocTypeKey } from './types'

export type DocTypeConfig = {
  key: DocTypeKey
  label: string
  required: boolean
  expires: boolean
  authorities: string[]
}

export const DOC_TYPES: DocTypeConfig[] = [
  {
    key: 'land_deed',
    label: 'Land Ownership Deed',
    required: true,
    expires: false,
    authorities: ['Sub-Registrar Office', 'District Collectorate'],
  },
  {
    key: 'building_cert',
    label: 'Building Completion Certificate',
    required: true,
    expires: false,
    authorities: ['Municipal Corporation', 'Town Planning Authority'],
  },
  {
    key: 'fire_noc',
    label: 'Fire Safety NOC',
    required: true,
    expires: true,
    authorities: ['State Fire Services', 'Municipal Fire Department'],
  },
  {
    key: 'trust_reg',
    label: 'Trust / Society Registration',
    required: true,
    expires: false,
    authorities: ['Charity Commissioner', 'Registrar of Societies'],
  },
  {
    key: 'affidavit',
    label: 'Notarized Affidavit',
    required: true,
    expires: false,
    authorities: ['Notary Public'],
  },
  {
    key: 'building_plan',
    label: 'Approved Building Plan',
    required: false,
    expires: false,
    authorities: ['Town Planning Authority', 'Municipal Corporation'],
  },
]

export const ALL_AUTHORITIES = Array.from(
  new Set([...DOC_TYPES.flatMap((d) => d.authorities), 'Private Consultant', 'Gram Panchayat']),
)

export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
export const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png']
export const MAX_FILE_BYTES = 10 * 1024 * 1024

export function getDocType(key: DocTypeKey) {
  return DOC_TYPES.find((d) => d.key === key)!
}
