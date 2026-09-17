export type WorkshopFileSlot = 'orders' | 'manpower' | 'parts' | 'third_party' | 'availability';

export interface WorkshopUploadRequest {
  fileName: string;
  downloadUrl: string;
}

export interface WorkshopUploadResponse {
  fileName: string;
  slot: WorkshopFileSlot;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  warnings: string;
  costSummary: string;
}

export interface MaintOrderRecord {
  id: string;
  orderNo: string;
  status: string;
  isCancelled: boolean;
  depot: string;
  orderType: string;
  plate: string;
  vehicleType: string;
  brand: string;
  model: string;
  dept: string;
  submitTime: string;
  handleTime: string | null;
  hourlyRate: number;
  laborCost: number;
  partsCost: number;
  thirdPartyCost: number;
  totalCost: number;
}

export interface MaintManpowerRecord {
  id: string;
  seqId: string;
  orderNo: string;
  workerName: string;
  paidHours: number;
}

export interface MaintPartRecord {
  id: string;
  seqId: string;
  orderNo: string;
  partId: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface MaintThirdPartyRecord {
  id: string;
  seqId: string;
  orderNo: string;
  thirdPartyName: string;
  cost: number;
  remarks: string;
}

export interface AvailabilityRecord {
  availKey: string;
  month: string;
  vehicleType: string;
  fleetQty: number;
  capacityDays: number;
  unavailableDays: number;
  availabilityPct: number;
  source: string;
}

export interface MaintStatsQuery {
  year: number;
  quarter?: number;
  month?: number;
  vehicleType?: string;
}

export interface AvailabilityPoint {
  month: number;
  pct: number;
}

export interface DepotCount {
  depot: string;
  count: number;
}

export interface VehicleTypeCount {
  vehicleType: string;
  count: number;
}

export interface ThirdPartyCost {
  name: string;
  cost: number;
}

export interface CostBreakdown {
  group: string;
  labor: number;
  parts: number;
  thirdParty: number;
  total: number;
}

export interface MaintDataCutoffResponse {
  month: string | null;
}

export interface MaintStatsResponse {
  totalOrders: number;
  totalCost: number;
  avgAvailability: number | null;
  availabilitySeries: AvailabilityPoint[];
  depotCounts: DepotCount[];
  vehicleTypeCounts: VehicleTypeCount[];
  thirdPartyCosts: ThirdPartyCost[];
  costByOrderType: CostBreakdown[];
  costByVehicleType: CostBreakdown[];
}
