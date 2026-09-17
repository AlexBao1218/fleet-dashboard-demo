export interface DataCutoffResponse {
  month: string | null;
}

export interface FleetClassDistributionItem {
  vehClass: string;
  count: number;
}

export interface FleetOverviewResponse {
  activeVehicles: number;
  classDistribution: FleetClassDistributionItem[];
}

export interface FuelYearsResponse {
  years: number[];
}

export interface MakeModelOptionItem {
  combo: string;
  count: number;
}

export interface MakeModelOptionsResponse {
  items: MakeModelOptionItem[];
}

export interface FuelMonthlyPoint {
  month: number;
  petrolLitres: number;
  dieselLitres: number;
}

export interface FuelStatsTotals {
  petrolLitres: number;
  dieselLitres: number;
  petrolCostHkd: number;
  dieselCostHkd: number;
}

export interface FuelStatsResponse {
  monthly: FuelMonthlyPoint[];
  totals: FuelStatsTotals;
}

export interface FuelCostByClassItem {
  vehClass: string;
  costHkd: number;
}

export interface FuelCostByClassResponse {
  items: FuelCostByClassItem[];
}

export interface FuelEfficiencyEntry {
  netKm: number;
  litres: number;
  kmPerLitre: number | null;
  monthsUsed: number[];
}

export interface FuelEfficiencyResponse {
  petrol: FuelEfficiencyEntry;
  diesel: FuelEfficiencyEntry;
}

export interface EvMonthlyPoint {
  month: number;
  totalKwh: number | null;
}

export interface EvEfficiencyEntry {
  netKm: number;
  totalKwh: number;
  kmPerKwh: number | null;
  monthsUsed: number[];
}

export interface EvStatsResponse {
  monthly: EvMonthlyPoint[];
  totalKwh: number;
  costHkd: number;
  efficiency: EvEfficiencyEntry;
}
