/**
 * Browser-side persistence for the demo. The production app kept this state in
 * PostgreSQL behind a NestJS API; here it lives in localStorage so a visitor can
 * add a manual entry, edit the product map, delete an EV month, and reset.
 */
import { buildSeed, STORE_VERSION, type DemoStore } from './seed'

export const STORE_KEY = 'fleet-dashboard-demo:store'

let cache: DemoStore | null = null

function read(): DemoStore | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoStore
    if (parsed.version !== STORE_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function getStore(): DemoStore {
  if (cache) return cache
  cache = read() ?? buildSeed()
  saveStore()
  return cache
}

export function saveStore(): void {
  if (!cache) return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(cache))
  } catch {
    // storage unavailable (private mode, quota) — keep the in-memory copy
  }
}

export function resetDemoData(): void {
  cache = null
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    // ignore
  }
}
