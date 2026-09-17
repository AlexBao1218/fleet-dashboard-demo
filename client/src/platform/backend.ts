/**
 * In-browser replacement for the NestJS backend.
 *
 * `handleRequest` answers the same `/api/...` routes the page code calls, with
 * the same response shapes (see `shared/*.ts`), computed from the synthetic
 * store. Aggregations follow the original services (dashboard, maintenance
 * stats, accident, upload log, fuel product map, app doc). Anything that
 * needed the platform — file parsing, storage — answers with a 400 and the
 * public-demo notice instead of pretending.
 */
import { ACCIDENT_CATEGORIES, type AccidentCategory, type AccidentCategoryCount, type AccidentMonthlyCount, type AccidentStatsResponse } from '@shared/accident'
import type { AppDoc, AppDocLiveStatusResponse } from '@shared/app-doc'
import type {
  DataCutoffResponse,
  EvStatsResponse,
  FleetOverviewResponse,
  FuelCostByClassItem,
  FuelCostByClassResponse,
  FuelEfficiencyResponse,
  FuelStatsResponse,
  FuelYearsResponse,
  MakeModelOptionsResponse,
} from '@shared/dashboard'
import type { EvMonthlyDeleteResponse } from '@shared/ev-monthly'
import { isExportTableName, type ExportTableName } from '@shared/export'
import type { FuelProductMapItem, FuelProductMapListResponse, SaveFuelProductMapRequest } from '@shared/fuel-product-map'
import type { ManualEntryItem, ManualEntryListResponse, ManualEntryRequest, ManualEntryResponse } from '@shared/fuel-transaction'
import type { CostBreakdown, MaintStatsResponse } from '@shared/maintenance'
import type { RecordUploadRequest, UploadLog, UploadLogListResponse } from '@shared/upload-log'
import { DEMO_USER_NAME, NOT_AVAILABLE } from '@/lib/brand'
import { getStore, saveStore } from './store'
import type { DemoFuelTxn, DemoMaintOrder, DemoStore } from './seed'

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface RequestOptions {
  params: Record<string, string>
}

/** Shaped like an axios error so the pages' `isAxiosError` handling works unchanged. */
export class BackendError extends Error {
  readonly isAxiosError = true
  readonly response: { status: number; data: { message: string } }
  constructor(status: number, message: string) {
    super(message)
    this.name = 'BackendError'
    this.response = { status, data: { message } }
  }
}

const UNMATCHED_CLASS = '(Unmatched)'
const FIXED_CLASSES = ['Private Car', 'Van', 'Motorcycle', 'Lorry'] as const
const pad2 = (n: number): string => String(n).padStart(2, '0')
const r2 = (n: number): number => Number(n.toFixed(2))

function yearOf(date: string): number {
  return Number(date.slice(0, 4))
}
function monthOf(date: string): number {
  return Number(date.slice(5, 7))
}
function quarterOf(month: number): number {
  return Math.floor((month - 1) / 3) + 1
}
function parseMonthFilter(raw: string | undefined): 'all' | number {
  if (!raw || raw === 'all' || raw === 'All') return 'all'
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : 'all'
}
function requireYear(raw: string | undefined): number {
  const n = Number(raw)
  if (!Number.isInteger(n)) throw new BackendError(400, 'year is required')
  return n
}

// ---- dashboard ----
function dataCutoff(store: DemoStore): DataCutoffResponse {
  let max = ''
  for (const t of store.fuelTxns) if (t.txnDate > max) max = t.txnDate
  return { month: max ? max.slice(0, 7) : null }
}

function fleetOverview(store: DemoStore): FleetOverviewResponse {
  const active = store.vehicles.filter((v) => v.isActive)
  const counts = new Map<string, number>()
  for (const v of active) counts.set(v.vehClass, (counts.get(v.vehClass) ?? 0) + 1)
  return {
    activeVehicles: active.length,
    classDistribution: [...counts].map(([vehClass, count]) => ({ vehClass, count })),
  }
}

function fuelYears(store: DemoStore): FuelYearsResponse {
  const years = new Set<number>()
  for (const t of store.fuelTxns) years.add(yearOf(t.txnDate))
  return { years: [...years].sort((a, b) => b - a) }
}

function filteredPlates(store: DemoStore, vehClass: string, makeModel: string): Set<string> | null {
  if (vehClass === 'all' && makeModel === 'all') return null
  const plates = new Set<string>()
  for (const v of store.vehicles) {
    if (vehClass !== 'all' && v.vehClass !== vehClass) continue
    if (makeModel !== 'all' && v.makeModel !== makeModel) continue
    plates.add(v.plate)
  }
  return plates
}

function makeModelOptions(store: DemoStore, vehClass: string): MakeModelOptionsResponse {
  const counts = new Map<string, number>()
  for (const v of store.vehicles) {
    if (!v.isActive || !v.makeModel) continue
    if (vehClass !== 'all' && v.vehClass !== vehClass) continue
    counts.set(v.makeModel, (counts.get(v.makeModel) ?? 0) + 1)
  }
  return {
    items: [...counts]
      .map(([combo, count]) => ({ combo, count }))
      .sort((a, b) => a.combo.localeCompare(b.combo, 'en', { sensitivity: 'base' })),
  }
}

function fuelStats(store: DemoStore, year: number, monthFilter: 'all' | number, vehClass: string, makeModel: string): FuelStatsResponse {
  const plates = filteredPlates(store, vehClass, makeModel)
  const monthly = new Map<number, { petrolLitres: number; dieselLitres: number }>()
  for (let m = 1; m <= 12; m += 1) monthly.set(m, { petrolLitres: 0, dieselLitres: 0 })
  const totals = { petrolLitres: 0, dieselLitres: 0, petrolCostHkd: 0, dieselCostHkd: 0 }
  for (const t of store.fuelTxns) {
    if (yearOf(t.txnDate) !== year) continue
    if (plates !== null && !plates.has(t.plate)) continue
    const m = monthOf(t.txnDate)
    const entry = monthly.get(m)!
    if (t.fuelType === 'Petrol') entry.petrolLitres += t.litres
    else entry.dieselLitres += t.litres
    if (monthFilter !== 'all' && m !== monthFilter) continue
    if (t.fuelType === 'Petrol') {
      totals.petrolLitres += t.litres
      totals.petrolCostHkd += t.costHkd
    } else {
      totals.dieselLitres += t.litres
      totals.dieselCostHkd += t.costHkd
    }
  }
  return {
    monthly: [...monthly]
      .filter(([, e]) => e.petrolLitres > 0 || e.dieselLitres > 0)
      .map(([month, e]) => ({ month, petrolLitres: r2(e.petrolLitres), dieselLitres: r2(e.dieselLitres) })),
    totals: {
      petrolLitres: r2(totals.petrolLitres),
      dieselLitres: r2(totals.dieselLitres),
      petrolCostHkd: r2(totals.petrolCostHkd),
      dieselCostHkd: r2(totals.dieselCostHkd),
    },
  }
}

function fuelCostByClass(store: DemoStore, year: number, monthFilter: 'all' | number, makeModel: string): FuelCostByClassResponse {
  const plates = filteredPlates(store, 'all', makeModel)
  const classOf = new Map(store.vehicles.map((v) => [v.plate, v.vehClass as string]))
  const cost = new Map<string, number>()
  for (const t of store.fuelTxns) {
    if (yearOf(t.txnDate) !== year) continue
    if (monthFilter !== 'all' && monthOf(t.txnDate) !== monthFilter) continue
    if (plates !== null && !plates.has(t.plate)) continue
    const cls = classOf.get(t.plate) ?? UNMATCHED_CLASS
    cost.set(cls, (cost.get(cls) ?? 0) + t.costHkd)
  }
  const items: FuelCostByClassItem[] = []
  for (const cls of FIXED_CLASSES) if (cost.has(cls)) items.push({ vehClass: cls, costHkd: r2(cost.get(cls)!) })
  for (const cls of [...cost.keys()].filter((k) => !(FIXED_CLASSES as readonly string[]).includes(k) && k !== UNMATCHED_CLASS).sort())
    items.push({ vehClass: cls, costHkd: r2(cost.get(cls)!) })
  if (cost.has(UNMATCHED_CLASS)) items.push({ vehClass: UNMATCHED_CLASS, costHkd: r2(cost.get(UNMATCHED_CLASS)!) })
  return { items }
}

function fuelEfficiency(store: DemoStore, year: number, monthFilter: 'all' | number, vehClass: string, makeModel: string): FuelEfficiencyResponse {
  const plates = filteredPlates(store, vehClass, makeModel)
  const fuelOf = new Map(store.vehicles.map((v) => [v.plate, v.fuelType]))
  const calc = (fuel: 'Petrol' | 'Diesel') => {
    const litresByMonth = new Map<number, number>()
    for (const t of store.fuelTxns) {
      if (t.fuelType !== fuel || yearOf(t.txnDate) !== year) continue
      const m = monthOf(t.txnDate)
      if (monthFilter !== 'all' && m !== monthFilter) continue
      if (plates !== null && !plates.has(t.plate)) continue
      litresByMonth.set(m, (litresByMonth.get(m) ?? 0) + t.litres)
    }
    let litres = 0
    const monthsUsed: number[] = []
    for (const [m, l] of litresByMonth) {
      litres += l
      if (l > 0) monthsUsed.push(m)
    }
    monthsUsed.sort((a, b) => a - b)
    const monthSet = new Set(monthsUsed)
    let netKm = 0
    for (const trip of store.tripMonths) {
      if (trip.year !== year || !monthSet.has(trip.month)) continue
      if (fuelOf.get(trip.plate) !== fuel) continue
      if (plates !== null && !plates.has(trip.plate)) continue
      netKm += trip.netKm
    }
    return { netKm, litres: r2(litres), kmPerLitre: litres > 0 ? netKm / litres : null, monthsUsed }
  }
  return { petrol: calc('Petrol'), diesel: calc('Diesel') }
}

function evStats(store: DemoStore, year: number, monthFilter: 'all' | number): EvStatsResponse {
  const byMonth = new Map(store.evMonths.map((e) => [e.month, e]))
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const e = byMonth.get(`${year}${pad2(i + 1)}`)
    return { month: i + 1, totalKwh: e ? r2(e.totalKwh) : null }
  })
  const from = monthFilter === 'all' ? 1 : monthFilter
  const to = monthFilter === 'all' ? 12 : monthFilter
  let totalKwh = 0
  let costHkd = 0
  const monthsWithData = new Set<number>()
  for (let m = from; m <= to; m += 1) {
    const e = byMonth.get(`${year}${pad2(m)}`)
    if (!e) continue
    totalKwh += e.totalKwh
    costHkd += e.costHkd
    monthsWithData.add(m)
  }
  const electric = new Set(store.vehicles.filter((v) => v.fuelType === 'Electric').map((v) => v.plate))
  let netKm = 0
  for (const trip of store.tripMonths) {
    if (trip.year === year && monthsWithData.has(trip.month) && electric.has(trip.plate)) netKm += trip.netKm
  }
  totalKwh = r2(totalKwh)
  return {
    monthly,
    totalKwh,
    costHkd: r2(costHkd),
    efficiency: {
      netKm,
      totalKwh,
      kmPerKwh: totalKwh > 0 ? netKm / totalKwh : null,
      monthsUsed: [...monthsWithData].sort((a, b) => a - b),
    },
  }
}

// ---- maintenance ----
function maintDataCutoff(store: DemoStore): { month: string | null } {
  let max = ''
  for (const o of store.maintOrders) if (o.submitTime > max) max = o.submitTime
  return { month: max ? max.slice(0, 7) : null }
}

function maintStats(store: DemoStore, p: RequestOptions['params']): MaintStatsResponse {
  const year = requireYear(p.year)
  const quarter = p.quarter ? Number(p.quarter) : undefined
  const month = p.month ? Number(p.month) : undefined
  const vehicleType = p.vehicleType && p.vehicleType !== 'All' ? p.vehicleType : undefined

  const inScope = (o: DemoMaintOrder): boolean => {
    if (o.isCancelled || yearOf(o.submitTime) !== year) return false
    const m = monthOf(o.submitTime)
    if (quarter && quarterOf(m) !== quarter) return false
    if (month && m !== month) return false
    if (vehicleType && o.vehicleType !== vehicleType) return false
    return true
  }
  const orders = store.maintOrders.filter(inScope)
  const orderNos = new Set(orders.map((o) => o.orderNo))

  const availRows = store.availability
    .filter((a) => a.month.startsWith(String(year)) && a.vehicleType === (vehicleType ?? 'Total'))
    .sort((a, b) => a.month.localeCompare(b.month))
  const availabilitySeries = availRows.map((a) => ({ month: Number(a.month.slice(4, 6)), pct: a.availabilityPct }))
  const avgAvailability = availRows.length ? Math.round((availRows.reduce((s, a) => s + a.availabilityPct, 0) / availRows.length) * 100) / 100 : null

  const count = <K extends keyof DemoMaintOrder>(key: K) => {
    const m = new Map<string, number>()
    for (const o of orders) m.set(String(o[key]), (m.get(String(o[key])) ?? 0) + 1)
    return m
  }
  const vendorCost = new Map<string, number>()
  for (const t of store.thirdParties) if (orderNos.has(t.orderNo)) vendorCost.set(t.thirdPartyName, (vendorCost.get(t.thirdPartyName) ?? 0) + t.cost)

  const breakdown = (key: 'orderType' | 'vehicleType', only?: readonly string[]): CostBreakdown[] => {
    const m = new Map<string, CostBreakdown>()
    for (const o of orders) {
      const group = o[key].trim() || '(Unknown)'
      if (only && !only.includes(group)) continue
      const cur = m.get(group) ?? { group, labor: 0, parts: 0, thirdParty: 0, total: 0 }
      cur.labor += o.laborCost
      cur.parts += o.partsCost
      cur.thirdParty += o.thirdPartyCost
      cur.total += o.totalCost
      m.set(group, cur)
    }
    return [...m.values()]
      .map((d) => ({ group: d.group, labor: r2(d.labor), parts: r2(d.parts), thirdParty: r2(d.thirdParty), total: r2(d.total) }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
  }

  return {
    totalOrders: orders.length,
    totalCost: r2(orders.reduce((s, o) => s + o.totalCost, 0)),
    avgAvailability,
    availabilitySeries,
    depotCounts: [...count('depot')].map(([depot, n]) => ({ depot, count: n })).sort((a, b) => a.depot.localeCompare(b.depot)),
    vehicleTypeCounts: [...count('vehicleType')].map(([vehicleType, n]) => ({ vehicleType, count: n })),
    thirdPartyCosts: [...vendorCost]
      .map(([name, cost]) => ({ name, cost: r2(cost) }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 15),
    costByOrderType: breakdown('orderType'),
    costByVehicleType: breakdown('vehicleType', FIXED_CLASSES),
  }
}

// ---- accident ----
function accidentYears(store: DemoStore): { years: number[] } {
  const years = new Set<number>()
  for (const a of store.accidents) if (a.inScope) years.add(yearOf(a.accidentDate))
  return { years: [...years].sort((a, b) => b - a) }
}

function accidentCutoff(store: DemoStore): { month: string | null } {
  let max = ''
  for (const a of store.accidents) if (a.accidentDate > max) max = a.accidentDate
  return { month: max ? max.slice(0, 7) : null }
}

function accidentStats(store: DemoStore, p: RequestOptions['params']): AccidentStatsResponse {
  const year = requireYear(p.year)
  const quarter = p.quarter ? Number(p.quarter) : undefined
  const month = p.month ? Number(p.month) : undefined
  const category = p.category && p.category !== 'All' ? (p.category as AccidentCategory) : undefined
  const categories: AccidentCategory[] = category ? [category] : [...ACCIDENT_CATEGORIES]

  const pieCounts = new Map<string, number>()
  const barCounts = new Map<string, number>()
  for (const a of store.accidents) {
    if (!a.inScope) continue
    if (category && a.category !== category) continue
    const y = yearOf(a.accidentDate)
    const m = monthOf(a.accidentDate)
    if (y === year - 1 || y === year) barCounts.set(`${a.category}|${y}|${m}`, (barCounts.get(`${a.category}|${y}|${m}`) ?? 0) + 1)
    if (y !== year) continue
    if (quarter && quarterOf(m) !== quarter) continue
    if (month && m !== month) continue
    pieCounts.set(a.category, (pieCounts.get(a.category) ?? 0) + 1)
  }
  const pie: AccidentCategoryCount[] = categories.map((c) => ({ category: c, count: pieCounts.get(c) ?? 0 }))
  const bars: AccidentMonthlyCount[] = []
  for (const c of categories)
    for (const y of [year - 1, year])
      for (let m = 1; m <= 12; m += 1) bars.push({ category: c, year: y, month: m, count: barCounts.get(`${c}|${y}|${m}`) ?? 0 })
  return { pie, bars }
}

// ---- upload logs ----
function listUploadLogs(store: DemoStore, fileType: string): UploadLogListResponse {
  const items = store.uploadLogs
    .filter((l) => fileType === 'all' || l.fileType === fileType)
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
  return { items, total: items.length }
}

function recordUpload(store: DemoStore, body: RecordUploadRequest): UploadLog {
  const row: UploadLog = {
    id: `ul-${Date.now()}`,
    fileType: body.fileType,
    fileName: body.fileName,
    uploadedAt: new Date().toISOString(),
    uploadedBy: DEMO_USER_NAME,
    rowsRead: 0,
    rowsAdded: 0,
    rowsUpdated: 0,
    rowsRejected: 0,
    warnings: NOT_AVAILABLE,
  }
  store.uploadLogs.unshift(row)
  saveStore()
  return row
}

// ---- fuel product map ----
function listProductMap(store: DemoStore, supplier?: string): FuelProductMapListResponse {
  const items = store.productMap
    .filter((p) => !supplier || p.supplier === supplier)
    .sort((a, b) => a.supplier.localeCompare(b.supplier) || a.productName.localeCompare(b.productName))
  return { items, total: items.length }
}

function assertUniqueMapping(store: DemoStore, body: SaveFuelProductMapRequest, excludeId?: string): void {
  const dup = store.productMap.some(
    (p) => p.id !== excludeId && p.supplier.trim().toLowerCase() === body.supplier.trim().toLowerCase() && p.productName.trim().toLowerCase() === body.productName.trim().toLowerCase(),
  )
  if (dup) throw new BackendError(409, 'This supplier and product name combination already exists')
}

function createProductMap(store: DemoStore, body: SaveFuelProductMapRequest): FuelProductMapItem {
  assertUniqueMapping(store, body)
  const item: FuelProductMapItem = { id: `fpm-${Date.now()}`, supplier: body.supplier.trim(), productName: body.productName.trim(), fuelType: body.fuelType }
  store.productMap.push(item)
  saveStore()
  return item
}

function updateProductMap(store: DemoStore, id: string, body: SaveFuelProductMapRequest): FuelProductMapItem {
  const item = store.productMap.find((p) => p.id === id)
  if (!item) throw new BackendError(404, 'Mapping not found')
  assertUniqueMapping(store, body, id)
  item.supplier = body.supplier.trim()
  item.productName = body.productName.trim()
  item.fuelType = body.fuelType
  saveStore()
  return item
}

function deleteProductMap(store: DemoStore, id: string): { success: boolean } {
  const idx = store.productMap.findIndex((p) => p.id === id)
  if (idx === -1) throw new BackendError(404, 'Mapping not found')
  store.productMap.splice(idx, 1)
  saveStore()
  return { success: true }
}

// ---- manual fuel entries ----
function toManualItem(t: DemoFuelTxn): ManualEntryItem {
  return { id: t.id, supplier: t.supplier, txnDate: t.txnDate, plate: t.plate, productName: t.productName, fuelType: t.fuelType, litres: t.litres, costHkd: t.costHkd, docNo: t.docNo }
}

function listManualEntries(store: DemoStore, limitRaw?: string): ManualEntryListResponse {
  const limit = Math.min(Math.max(Number(limitRaw) || 20, 1), 200)
  const items = store.fuelTxns
    .filter((t) => t.source === 'manual')
    .sort((a, b) => (a.txnDate < b.txnDate ? 1 : a.txnDate > b.txnDate ? -1 : a.id < b.id ? 1 : -1))
    .slice(0, limit)
    .map(toManualItem)
  return { items }
}

function createManualEntry(store: DemoStore, body: ManualEntryRequest): ManualEntryResponse {
  const mapping = store.productMap.find((p) => p.supplier === body.supplier && p.productName === body.productName)
  if (!mapping) throw new BackendError(400, `Product "${body.productName}" is not mapped for ${body.supplier}; add it in Reference Tables first`)
  const txnKey = `${body.supplier}|${body.docNo.trim()}`
  const existing = store.fuelTxns.find((t) => t.txnKey === txnKey)
  const row: DemoFuelTxn = {
    id: existing?.id ?? `txn-m-${Date.now()}`,
    txnKey,
    supplier: body.supplier,
    txnDate: body.txnDate,
    plate: body.plate.trim().toUpperCase(),
    productName: body.productName,
    fuelType: mapping.fuelType,
    litres: body.litres,
    costHkd: body.costHkd,
    docNo: body.docNo.trim(),
    source: 'manual',
  }
  if (existing) Object.assign(existing, row)
  else store.fuelTxns.push(row)
  saveStore()
  return { id: row.id, txnKey }
}

function deleteManualEntry(store: DemoStore, id: string): { success: boolean } {
  const idx = store.fuelTxns.findIndex((t) => t.id === id && t.source === 'manual')
  if (idx === -1) throw new BackendError(404, 'Manual entry not found')
  store.fuelTxns.splice(idx, 1)
  saveStore()
  return { success: true }
}

// ---- ev monthly ----
function deleteEvMonth(store: DemoStore, month: string | undefined): EvMonthlyDeleteResponse {
  if (!month || !/^\d{6}$/.test(month)) throw new BackendError(400, 'month must be YYYYMM')
  const before = store.evMonths.length
  store.evMonths = store.evMonths.filter((e) => e.month !== month)
  saveStore()
  return { month, deletedRows: before - store.evMonths.length }
}

// ---- app docs ----
function getAppDoc(store: DemoStore, docKey: string): AppDoc {
  const doc = store.appDocs.find((d) => d.docKey === docKey)
  if (!doc) throw new BackendError(404, `Document ${docKey} not found`)
  return doc
}

function updateAppDoc(store: DemoStore, docKey: string, body: { markdown: string; title?: string }): AppDoc {
  const doc = getAppDoc(store, docKey)
  doc.markdown = body.markdown
  if (body.title !== undefined) doc.title = body.title
  doc.updatedAt = new Date().toISOString()
  saveStore()
  return doc
}

function liveStatus(store: DemoStore): AppDocLiveStatusResponse {
  const manpowerRows = Math.round(store.maintOrders.length * 1.4)
  const partRows = Math.round(store.maintOrders.length * 2.1)
  const tables = [
    ['fleet_vehicle', 'Fleet vehicles', store.vehicles.length],
    ['fuel_product_map', 'Fuel product map', store.productMap.length],
    ['fuel_transaction', 'Fuel transactions', store.fuelTxns.length],
    ['elogbook_trip', 'Elogbook trips', store.tripMonths.length],
    ['ev_monthly', 'EV monthly', store.evMonths.length],
    ['maint_order', 'Maintenance orders', store.maintOrders.length],
    ['maint_manpower', 'Maintenance manpower', manpowerRows],
    ['maint_part', 'Maintenance parts', partRows],
    ['maint_third_party', 'Maintenance third party', store.thirdParties.length],
    ['availability_month', 'Availability months', store.availability.length],
    ['accident_record', 'Accident records', store.accidents.length],
    ['upload_log', 'Upload logs', store.uploadLogs.length],
  ] as const
  const sources = [
    ['fleet', 'Fleet List'],
    ['fuel_card', 'Fuel Card'],
    ['elogbook', 'Elogbook'],
    ['ev', 'EV Electricity'],
    ['maint', 'Maintenance (Workshop)'],
    ['accident', 'Accident Records'],
    ['history', 'History Import'],
  ] as const
  const last = new Map<string, string>()
  for (const l of store.uploadLogs) if (!last.has(l.fileType) || last.get(l.fileType)! < l.uploadedAt) last.set(l.fileType, l.uploadedAt)
  return {
    tables: tables.map(([table, label, rows]) => ({ table, label, rows })),
    sources: sources.map(([fileType, label]) => ({ fileType, label, lastUploadAt: last.get(fileType) ?? null })),
  }
}

// ---- csv export ----
function toCsv(rows: object[]): string {
  if (rows.length === 0) return ''
  const cols = Object.keys(rows[0])
  const esc = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(','))].join('\n')
}

function exportTable(store: DemoStore, table: ExportTableName): Blob {
  const rows: object[] = (() => {
    switch (table) {
      case 'fleet_vehicle':
        return store.vehicles
      case 'fuel_transaction':
        return store.fuelTxns
      case 'elogbook_trip':
        return store.tripMonths
      case 'ev_monthly':
        return store.evMonths
      case 'maint_order':
        return store.maintOrders
      case 'maint_third_party':
        return store.thirdParties
      case 'availability_month':
        return store.availability
      case 'accident_record':
        return store.accidents
      case 'fuel_product_map':
        return store.productMap
      case 'upload_log':
        return store.uploadLogs
      case 'maint_manpower':
      case 'maint_part':
        throw new BackendError(400, `${table}: ${NOT_AVAILABLE}`)
    }
  })()
  return new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
}

// ---- router ----
const notAvailable = (): never => {
  throw new BackendError(400, NOT_AVAILABLE)
}

export async function handleRequest(method: HttpMethod, url: string, body: unknown, opts: RequestOptions): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120))
  const store = getStore()
  const path = url.split('?')[0]
  const p = opts.params
  const route = `${method.toUpperCase()} ${path}`

  // dashboard
  if (route === 'GET /api/dashboard/data-cutoff') return dataCutoff(store)
  if (route === 'GET /api/dashboard/fleet-overview') return fleetOverview(store)
  if (route === 'GET /api/dashboard/fuel-years') return fuelYears(store)
  if (route === 'GET /api/dashboard/make-model-options') return makeModelOptions(store, p.vehClass ?? 'all')
  if (route === 'GET /api/dashboard/fuel-stats') return fuelStats(store, requireYear(p.year), parseMonthFilter(p.month), p.vehClass ?? 'all', p.makeModel ?? 'all')
  if (route === 'GET /api/dashboard/fuel-cost-by-class') return fuelCostByClass(store, requireYear(p.year), parseMonthFilter(p.month), p.makeModel ?? 'all')
  if (route === 'GET /api/dashboard/fuel-efficiency') return fuelEfficiency(store, requireYear(p.year), parseMonthFilter(p.month), p.vehClass ?? 'all', p.makeModel ?? 'all')
  if (route === 'GET /api/dashboard/ev-stats') return evStats(store, requireYear(p.year), parseMonthFilter(p.month))

  // maintenance
  if (route === 'GET /api/maintenance/data-cutoff') return maintDataCutoff(store)
  if (route === 'GET /api/maintenance/stats') return maintStats(store, p)
  if (method === 'post' && path.startsWith('/api/maintenance/upload-')) return notAvailable()

  // accident
  if (route === 'GET /api/accident/years') return accidentYears(store)
  if (route === 'GET /api/accident/data-cutoff') return accidentCutoff(store)
  if (route === 'GET /api/accident/stats') return accidentStats(store, p)
  if (route === 'POST /api/accident/upload') return notAvailable()

  // upload logs
  if (route === 'GET /api/upload-logs') return listUploadLogs(store, p.fileType ?? 'fleet')
  if (route === 'POST /api/upload-logs') return recordUpload(store, body as RecordUploadRequest)

  // fuel product map
  if (route === 'GET /api/fuel-product-maps') return listProductMap(store, p.supplier)
  if (route === 'POST /api/fuel-product-maps') return createProductMap(store, body as SaveFuelProductMapRequest)
  {
    const m = path.match(/^\/api\/fuel-product-maps\/([^/]+)$/)
    if (m && method === 'patch') return updateProductMap(store, m[1], body as SaveFuelProductMapRequest)
    if (m && method === 'delete') return deleteProductMap(store, m[1])
  }

  // fuel transactions
  if (route === 'POST /api/fuel-transactions/manual') return createManualEntry(store, body as ManualEntryRequest)
  if (route === 'GET /api/fuel-transactions/manual') return listManualEntries(store, p.limit)
  {
    const m = path.match(/^\/api\/fuel-transactions\/manual\/([^/]+)$/)
    if (m && method === 'delete') return deleteManualEntry(store, m[1])
  }
  if (method === 'post' && path.startsWith('/api/fuel-transactions/upload-')) return notAvailable()

  // uploads that need the platform's file storage + server-side parsers
  if (route === 'POST /api/fleet-vehicles/upload') return notAvailable()
  if (route === 'POST /api/elogbook-trips/upload') return notAvailable()
  if (route === 'POST /api/ev-monthlies/upload') return notAvailable()
  if (route === 'DELETE /api/ev-monthlies') return deleteEvMonth(store, p.month)

  // export
  {
    const m = path.match(/^\/api\/export\/([^/]+)$/)
    if (m && method === 'get') {
      if (!isExportTableName(m[1])) throw new BackendError(400, `Unknown table ${m[1]}`)
      return exportTable(store, m[1])
    }
  }

  // app docs
  if (route === 'GET /api/app-docs/live-status') return liveStatus(store)
  {
    const m = path.match(/^\/api\/app-docs\/([^/]+)$/)
    if (m && method === 'get') return getAppDoc(store, m[1])
    if (m && method === 'put') return updateAppDoc(store, m[1], body as { markdown: string; title?: string })
  }

  throw new BackendError(404, `No demo handler for ${route}`)
}
