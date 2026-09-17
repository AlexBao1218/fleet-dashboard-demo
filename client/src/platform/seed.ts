/**
 * Synthetic dataset for the public demo.
 *
 * Everything here is generated from a fixed seed: the fleet, every fuel
 * transaction, trip, maintenance order, accident record and upload log. None
 * of it is derived from the employer's data — magnitudes, ratios and names are
 * invented so the dashboards have something to draw. Identity-bearing fields
 * (plates, order numbers, worker names, vendors, depots) use obvious
 * placeholders rather than realistic stand-ins.
 */
import type { AccidentCategory } from '@shared/accident'
import type { AppDoc } from '@shared/app-doc'
import type { FuelProductMapItem } from '@shared/fuel-product-map'
import type { UploadLog } from '@shared/upload-log'
import { DEMO_USER_NAME, DEPOTS, SUPPLIERS } from '@/lib/brand'
import { SYSTEM_GUIDE_MARKDOWN } from './system-guide'

export const STORE_VERSION = 3

/** Last month with data — the dashboards show "Data up to 2026-08". */
export const CUTOFF = { year: 2026, month: 8 } as const
export const FIRST_YEAR = 2025

export type VehClass = 'Private Car' | 'Van' | 'Motorcycle' | 'Lorry'
export type FuelKind = 'Petrol' | 'Diesel' | 'Electric'

export interface DemoVehicle {
  plate: string
  vehClass: VehClass
  fuelType: FuelKind
  makeModel: string
  isActive: boolean
}

export interface DemoFuelTxn {
  id: string
  txnKey: string
  supplier: string
  txnDate: string // YYYY-MM-DD
  plate: string
  productName: string
  fuelType: 'Petrol' | 'Diesel'
  litres: number
  costHkd: number
  docNo: string
  source: 'fuel_card' | 'history' | 'manual'
}

/** One row per vehicle per month: the month's valid trips rolled up. */
export interface DemoTripMonth {
  plate: string
  year: number
  month: number
  netKm: number
}

export interface DemoEvMonth {
  month: string // YYYYMM
  totalKwh: number
  costHkd: number
}

export interface DemoMaintOrder {
  orderNo: string
  isCancelled: boolean
  depot: string
  orderType: string
  plate: string
  vehicleType: VehClass
  submitTime: string // ISO
  laborCost: number
  partsCost: number
  thirdPartyCost: number
  totalCost: number
}

export interface DemoThirdParty {
  orderNo: string
  thirdPartyName: string
  cost: number
}

export interface DemoAvailability {
  month: string // YYYYMM
  vehicleType: VehClass | 'Total'
  availabilityPct: number
}

export interface DemoAccident {
  id: string
  accidentDate: string // YYYY-MM-DD
  category: AccidentCategory
  inScope: boolean
}

export interface DemoStore {
  version: number
  vehicles: DemoVehicle[]
  fuelTxns: DemoFuelTxn[]
  tripMonths: DemoTripMonth[]
  evMonths: DemoEvMonth[]
  maintOrders: DemoMaintOrder[]
  thirdParties: DemoThirdParty[]
  availability: DemoAvailability[]
  accidents: DemoAccident[]
  productMap: FuelProductMapItem[]
  uploadLogs: UploadLog[]
  appDocs: AppDoc[]
}

// ---- deterministic RNG ----
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260917)
const between = (lo: number, hi: number): number => lo + rand() * (hi - lo)
const intBetween = (lo: number, hi: number): number => Math.floor(between(lo, hi + 1))
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
const round2 = (n: number): number => Math.round(n * 100) / 100
const pad2 = (n: number): string => String(n).padStart(2, '0')

/** Months from FIRST_YEAR-01 to the cutoff, inclusive. */
export function monthsInRange(): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = []
  for (let y = FIRST_YEAR; y <= CUTOFF.year; y += 1) {
    const last = y === CUTOFF.year ? CUTOFF.month : 12
    for (let m = 1; m <= last; m += 1) out.push({ year: y, month: m })
  }
  return out
}

// ---- fleet ----
// Common fleet models, assigned at random; they do not describe any real vehicle.
const MODELS: Record<VehClass, Array<{ makeModel: string; fuel: FuelKind }>> = {
  'Private Car': [
    { makeModel: 'Toyota Corolla', fuel: 'Petrol' },
    { makeModel: 'Toyota Prius', fuel: 'Petrol' },
    { makeModel: 'Honda Jazz', fuel: 'Petrol' },
    { makeModel: 'Tesla Model 3', fuel: 'Electric' },
    { makeModel: 'BYD Atto 3', fuel: 'Electric' },
  ],
  Van: [
    { makeModel: 'Toyota Hiace', fuel: 'Diesel' },
    { makeModel: 'Nissan NV350', fuel: 'Diesel' },
    { makeModel: 'Ford Transit', fuel: 'Diesel' },
    { makeModel: 'Maxus eDeliver 3', fuel: 'Electric' },
  ],
  Lorry: [
    { makeModel: 'Isuzu NPR', fuel: 'Diesel' },
    { makeModel: 'Hino 300', fuel: 'Diesel' },
    { makeModel: 'Mitsubishi Canter', fuel: 'Diesel' },
  ],
  Motorcycle: [
    { makeModel: 'Honda PCX', fuel: 'Petrol' },
    { makeModel: 'Yamaha NMAX', fuel: 'Petrol' },
  ],
}

const CLASS_COUNTS: Array<[VehClass, number]> = [
  ['Private Car', 14],
  ['Van', 12],
  ['Lorry', 8],
  ['Motorcycle', 6],
]

function buildVehicles(): DemoVehicle[] {
  const vehicles: DemoVehicle[] = []
  let n = 101
  for (const [vehClass, count] of CLASS_COUNTS) {
    for (let i = 0; i < count; i += 1) {
      const model = pick(MODELS[vehClass])
      vehicles.push({
        plate: `DEMO ${n}`,
        vehClass,
        fuelType: model.fuel,
        makeModel: model.makeModel,
        isActive: true,
      })
      n += 1
    }
  }
  // two retired vehicles: excluded from the fleet pie but still in fuel history
  vehicles.push({ plate: `DEMO ${n}`, vehClass: 'Van', fuelType: 'Diesel', makeModel: 'Toyota Hiace', isActive: false })
  vehicles.push({ plate: `DEMO ${n + 1}`, vehClass: 'Private Car', fuelType: 'Petrol', makeModel: 'Toyota Corolla', isActive: false })
  return vehicles
}

// ---- fuel product map ----
const PRODUCTS: Array<{ supplier: string; productName: string; fuelType: 'Petrol' | 'Diesel' }> = [
  { supplier: SUPPLIERS.fuelCard, productName: 'Unleaded 95', fuelType: 'Petrol' },
  { supplier: SUPPLIERS.fuelCard, productName: 'Unleaded 98', fuelType: 'Petrol' },
  { supplier: SUPPLIERS.fuelCard, productName: 'Euro V Diesel', fuelType: 'Diesel' },
  { supplier: SUPPLIERS.fuelCard, productName: 'Premium Diesel', fuelType: 'Diesel' },
  { supplier: SUPPLIERS.manualB, productName: 'Unleaded 95', fuelType: 'Petrol' },
  { supplier: SUPPLIERS.manualB, productName: 'Diesel', fuelType: 'Diesel' },
  { supplier: SUPPLIERS.manualC, productName: 'Unleaded 95 Plus', fuelType: 'Petrol' },
  { supplier: SUPPLIERS.manualC, productName: 'Low-Sulphur Diesel', fuelType: 'Diesel' },
]

function buildProductMap(): FuelProductMapItem[] {
  return PRODUCTS.map((p, i) => ({ id: `fpm-${i + 1}`, ...p }))
}

// ---- fuel transactions + trips ----
// Per-class monthly usage envelope: fill-ups, litres per fill, km per litre.
const USAGE: Record<VehClass, { fills: [number, number]; litres: [number, number]; kmPerL: [number, number] }> = {
  'Private Car': { fills: [2, 4], litres: [28, 42], kmPerL: [9.5, 12.5] },
  Van: { fills: [3, 6], litres: [45, 65], kmPerL: [7.5, 9.5] },
  Lorry: { fills: [4, 7], litres: [70, 110], kmPerL: [5, 6.5] },
  Motorcycle: { fills: [2, 3], litres: [6, 9], kmPerL: [28, 36] },
}
const PRICE: Record<'Petrol' | 'Diesel', [number, number]> = { Petrol: [21.5, 24.5], Diesel: [18, 21] }
const EV_KM_PER_KWH: [number, number] = [5.2, 6.4]
const EV_KWH_PER_MONTH: [number, number] = [380, 620]
const EV_PRICE_PER_KWH: [number, number] = [1.3, 1.7]

function seasonal(month: number): number {
  // a little more driving in summer, less around Lunar New Year
  return 1 + 0.12 * Math.sin(((month - 4) / 12) * Math.PI * 2)
}

function buildFuelAndTrips(vehicles: DemoVehicle[], productMap: FuelProductMapItem[]) {
  const fuelTxns: DemoFuelTxn[] = []
  const tripMonths: DemoTripMonth[] = []
  const evMonths: DemoEvMonth[] = []
  let seq = 1
  const fuelCardProducts = productMap.filter((p) => p.supplier === SUPPLIERS.fuelCard)

  for (const { year, month } of monthsInRange()) {
    const isHistory = year < 2026
    let evKwh = 0
    for (const v of vehicles) {
      if (!v.isActive && year === 2026) continue
      const usage = USAGE[v.vehClass]
      const factor = seasonal(month) * between(0.85, 1.15)
      if (v.fuelType === 'Electric') {
        const kwh = between(...EV_KWH_PER_MONTH) * factor
        evKwh += kwh
        tripMonths.push({ plate: v.plate, year, month, netKm: Math.round(kwh * between(...EV_KM_PER_KWH)) })
        continue
      }
      const fills = intBetween(...usage.fills)
      let litresMonth = 0
      for (let f = 0; f < fills; f += 1) {
        const litres = round2(between(...usage.litres) * factor)
        const price = between(...PRICE[v.fuelType])
        const day = intBetween(1, 28)
        const product = pick(fuelCardProducts.filter((p) => p.fuelType === v.fuelType))
        litresMonth += litres
        fuelTxns.push({
          id: `txn-${seq}`,
          txnKey: `${isHistory ? 'H' : 'F'}-${year}${pad2(month)}-${String(seq).padStart(5, '0')}`,
          supplier: SUPPLIERS.fuelCard,
          txnDate: `${year}-${pad2(month)}-${pad2(day)}`,
          plate: v.plate,
          productName: product.productName,
          fuelType: v.fuelType,
          litres,
          costHkd: round2(litres * price),
          docNo: `DOC-${String(seq).padStart(6, '0')}`,
          source: isHistory ? 'history' : 'fuel_card',
        })
        seq += 1
      }
      tripMonths.push({
        plate: v.plate,
        year,
        month,
        netKm: Math.round(litresMonth * between(...usage.kmPerL)),
      })
    }
    // EV electricity arrives as one pooled row per month, not per vehicle
    evMonths.push({
      month: `${year}${pad2(month)}`,
      totalKwh: round2(evKwh),
      costHkd: round2(evKwh * between(...EV_PRICE_PER_KWH)),
    })
  }
  // The two suppliers without a file export are keyed in by hand; a few
  // recent ones so the Manual Entry table has something to show.
  const manualPlates = vehicles.filter((v) => v.isActive && v.fuelType !== 'Electric').slice(0, 6)
  const manualProducts = productMap.filter((p) => p.supplier !== SUPPLIERS.fuelCard)
  for (let i = 0; i < 6; i += 1) {
    const v = manualPlates[i]
    const fuel: 'Petrol' | 'Diesel' = v.fuelType === 'Diesel' ? 'Diesel' : 'Petrol'
    const product = pick(manualProducts.filter((p) => p.fuelType === fuel))
    const litres = round2(between(...USAGE[v.vehClass].litres))
    const month = i < 3 ? 7 : 8
    fuelTxns.push({
      id: `txn-m-${i + 1}`,
      txnKey: `${product.supplier}|INV-2026${pad2(month)}-${pad2(i + 1)}`,
      supplier: product.supplier,
      txnDate: `${CUTOFF.year}-${pad2(month)}-${pad2(intBetween(2, 27))}`,
      plate: v.plate,
      productName: product.productName,
      fuelType: fuel,
      litres,
      costHkd: round2(litres * between(...PRICE[fuel])),
      docNo: `INV-2026${pad2(month)}-${pad2(i + 1)}`,
      source: 'manual',
    })
  }
  return { fuelTxns, tripMonths, evMonths }
}

// ---- maintenance ----
const ORDER_TYPES = ['Preventive Service', 'Corrective Repair', 'Annual Inspection', 'Body & Paint', 'Tyre Replacement'] as const
const ORDER_MIX: Record<(typeof ORDER_TYPES)[number], number> = {
  'Preventive Service': 0.38,
  'Corrective Repair': 0.3,
  'Annual Inspection': 0.14,
  'Body & Paint': 0.08,
  'Tyre Replacement': 0.1,
}
const VENDORS = Array.from({ length: 12 }, (_, i) => `Vendor ${pad2(i + 1)}`)
const LABOR_RATE = 320

function pickOrderType(): (typeof ORDER_TYPES)[number] {
  let r = rand()
  for (const t of ORDER_TYPES) {
    r -= ORDER_MIX[t]
    if (r <= 0) return t
  }
  return ORDER_TYPES[0]
}

function buildMaintenance(vehicles: DemoVehicle[]) {
  const maintOrders: DemoMaintOrder[] = []
  const thirdParties: DemoThirdParty[] = []
  const availability: DemoAvailability[] = []
  const active = vehicles.filter((v) => v.isActive)
  let seq = 1

  for (const { year, month } of monthsInRange()) {
    const orders = intBetween(28, 42)
    const downDays: Record<VehClass, number> = { 'Private Car': 0, Van: 0, Lorry: 0, Motorcycle: 0 }
    for (let i = 0; i < orders; i += 1) {
      const v = pick(active)
      const orderType = pickOrderType()
      const hours = orderType === 'Annual Inspection' ? between(1, 2.5) : between(1.5, 9)
      const laborCost = round2(hours * LABOR_RATE)
      const partsCost = orderType === 'Annual Inspection' ? 0 : round2(between(150, 2800) * (v.vehClass === 'Lorry' ? 1.8 : 1))
      const outsourced = orderType === 'Body & Paint' || (orderType === 'Corrective Repair' && rand() < 0.35) || rand() < 0.08
      const thirdPartyCost = outsourced ? round2(between(800, 9500)) : 0
      const isCancelled = rand() < 0.04
      const orderNo = `${year}${pad2(month)}-${String(seq).padStart(5, '0')}`
      const day = intBetween(1, 28)
      maintOrders.push({
        orderNo,
        isCancelled,
        depot: rand() < 0.58 ? DEPOTS[0] : DEPOTS[1],
        orderType,
        plate: v.plate,
        vehicleType: v.vehClass,
        submitTime: `${year}-${pad2(month)}-${pad2(day)}T${pad2(intBetween(8, 17))}:${pad2(intBetween(0, 59))}:00.000Z`,
        laborCost,
        partsCost,
        thirdPartyCost,
        totalCost: round2(laborCost + partsCost + thirdPartyCost),
      })
      if (outsourced) {
        thirdParties.push({ orderNo, thirdPartyName: pick(VENDORS), cost: thirdPartyCost })
      }
      if (!isCancelled) downDays[v.vehClass] += hours / 8 + (outsourced ? between(1, 4) : 0)
      seq += 1
    }
    const key = `${year}${pad2(month)}`
    let totalCap = 0
    let totalDown = 0
    for (const [cls, count] of CLASS_COUNTS) {
      const cap = count * 30
      const down = Math.min(cap * 0.12, downDays[cls] + between(0, 6))
      totalCap += cap
      totalDown += down
      availability.push({ month: key, vehicleType: cls, availabilityPct: round2(((cap - down) / cap) * 100) })
    }
    availability.push({ month: key, vehicleType: 'Total', availabilityPct: round2(((totalCap - totalDown) / totalCap) * 100) })
  }
  return { maintOrders, thirdParties, availability }
}

// ---- accidents ----
const CATEGORY_MIX: Array<[AccidentCategory, number]> = [
  ['Own Fault Accident', 0.42],
  ['Third Party Fault Accident', 0.34],
  ['Third Party Fault Injury', 0.12],
  ['Own Fault Injury', 0.12],
]

function pickCategory(): AccidentCategory {
  let r = rand()
  for (const [c, w] of CATEGORY_MIX) {
    r -= w
    if (r <= 0) return c
  }
  return CATEGORY_MIX[0][0]
}

function buildAccidents(): DemoAccident[] {
  const out: DemoAccident[] = []
  let seq = 1
  for (const { year, month } of monthsInRange()) {
    const n = intBetween(2, 8)
    for (let i = 0; i < n; i += 1) {
      out.push({
        id: `acc-${seq}`,
        accidentDate: `${year}-${pad2(month)}-${pad2(intBetween(1, 28))}`,
        category: pickCategory(),
        inScope: true,
      })
      seq += 1
    }
    // a couple of records outside the reporting scope (non-traffic incidents)
    if (rand() < 0.5) {
      out.push({ id: `acc-${seq}`, accidentDate: `${year}-${pad2(month)}-${pad2(intBetween(1, 28))}`, category: 'Own Fault Accident', inScope: false })
      seq += 1
    }
  }
  return out
}

// ---- upload logs ----
function buildUploadLogs(counts: { fuel: number; trips: number; orders: number; accidents: number }): UploadLog[] {
  const at = (y: number, m: number, d: number, h: number): string => new Date(Date.UTC(y, m - 1, d, h - 8, 12)).toISOString()
  const log = (
    id: string,
    fileType: string,
    fileName: string,
    uploadedAt: string,
    rows: [number, number, number, number],
    warnings = '',
  ): UploadLog => ({
    id,
    fileType,
    fileName,
    uploadedAt,
    uploadedBy: DEMO_USER_NAME,
    rowsRead: rows[0],
    rowsAdded: rows[1],
    rowsUpdated: rows[2],
    rowsRejected: rows[3],
    warnings,
  })
  const active = CLASS_COUNTS.reduce((s, [, c]) => s + c, 0)
  return [
    log('ul-1', 'fleet', 'Fleet_List_2026-01.xlsx', at(2026, 1, 6, 10), [active + 2, active + 2, 0, 0]),
    log('ul-2', 'history', 'Fuel_History_2025.xlsx', at(2026, 1, 6, 11), [counts.fuel, counts.fuel, 0, 0]),
    log('ul-3', 'maint', 'Maintenance_Orders_2025.csv', at(2026, 1, 7, 9), [counts.orders, counts.orders, 0, 0]),
    log('ul-4', 'accident', 'Accident_Register.xlsx', at(2026, 1, 7, 15), [counts.accidents, counts.accidents, 0, 0]),
    log('ul-5', 'fleet', 'Fleet_List_2026-06.xlsx', at(2026, 6, 3, 10), [active + 2, 0, active + 2, 0]),
    log('ul-6', 'elogbook', 'Trips_2026-07.xlsx', at(2026, 8, 4, 9), [counts.trips, counts.trips, 0, 0]),
    log('ul-7', 'ev', 'EV_Electricity_2026-08.xlsx', at(2026, 9, 2, 14), [3, 3, 0, 0]),
    log('ul-8', 'fuel_card', 'Fuel_Card_2026-08.xlsx', at(2026, 9, 3, 10), [312, 296, 0, 16], '16 rows skipped: product not in fuel product map (Additive Pack)'),
    log('ul-9', 'maint', 'Maintenance_Orders_2026-08.csv', at(2026, 9, 3, 11), [41, 39, 2, 0]),
  ].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
}

export function buildSeed(): DemoStore {
  const vehicles = buildVehicles()
  const productMap = buildProductMap()
  const { fuelTxns, tripMonths, evMonths } = buildFuelAndTrips(vehicles, productMap)
  const { maintOrders, thirdParties, availability } = buildMaintenance(vehicles)
  const accidents = buildAccidents()
  return {
    version: STORE_VERSION,
    vehicles,
    fuelTxns,
    tripMonths,
    evMonths,
    maintOrders,
    thirdParties,
    availability,
    accidents,
    productMap,
    uploadLogs: buildUploadLogs({
      fuel: fuelTxns.length,
      trips: tripMonths.length,
      orders: maintOrders.length,
      accidents: accidents.length,
    }),
    appDocs: [
      {
        docKey: 'system-guide',
        title: 'System guide',
        markdown: SYSTEM_GUIDE_MARKDOWN,
        updatedAt: '2026-09-01T02:00:00.000Z',
      },
    ],
  }
}
