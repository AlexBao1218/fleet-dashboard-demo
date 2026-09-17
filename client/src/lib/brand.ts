/**
 * Every name the demo shows for things the employer owns. The real programme
 * name, company, fuel-card issuer, depots and vendors are withheld; these are
 * placeholders, not stand-ins.
 */
export const PROGRAM_NAME = 'Fleet Dashboard'
export const PROGRAM_TAGLINE = 'Fleet operations'
export const DEMO_LABEL = 'Public demo · synthetic data'
export const DEMO_USER_NAME = 'Demo user'
export const NOT_AVAILABLE = 'Not available in the public demo'
export const CASE_STUDY_URL = 'https://zijun.cloud/en/projects/fleet-dashboard'

/** Fuel suppliers: one card-based supplier with file exports, two with manual entry. */
export const SUPPLIERS = {
  fuelCard: 'Fuel Card Supplier A',
  manualB: 'Supplier B',
  manualC: 'Supplier C',
} as const

export const DEPOTS = ['Depot A', 'Depot B'] as const
