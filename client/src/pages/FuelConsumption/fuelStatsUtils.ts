import { getFuelCostByClass, getFuelStats } from '@client/src/api/dashboard';
import type {
  FuelCostByClassItem,
  FuelMonthlyPoint,
  FuelStatsTotals,
} from '@shared/dashboard';

export const EMPTY_TOTALS: FuelStatsTotals = {
  petrolLitres: 0,
  dieselLitres: 0,
  petrolCostHkd: 0,
  dieselCostHkd: 0,
};

export interface FuelStatsBundle {
  monthly: FuelMonthlyPoint[];
  totals: FuelStatsTotals;
  costByClass: FuelCostByClassItem[];
}

export async function fetchFuelStatsBundle(
  year: number,
  month: string,
  vehClass: string,
  makeModel: string,
): Promise<FuelStatsBundle> {
  const [statsRes, costRes] = await Promise.all([
    getFuelStats({ year, month, vehClass, makeModel }),
    getFuelCostByClass({ year, month, makeModel }),
  ]);
  return {
    monthly: statsRes.monthly,
    totals: statsRes.totals,
    costByClass: costRes.items,
  };
}
