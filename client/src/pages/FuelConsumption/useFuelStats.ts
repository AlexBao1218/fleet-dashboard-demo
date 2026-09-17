import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import type {
  FuelCostByClassItem,
  FuelMonthlyPoint,
  FuelStatsTotals,
} from '@shared/dashboard';

import { EMPTY_TOTALS, fetchFuelStatsBundle } from './fuelStatsUtils';
import { useFuelYears } from './useFuelYears';

export interface UseFuelStatsResult {
  years: number[];
  year: number | null;
  month: string;
  vehClass: string;
  makeModel: string;
  yearsLoading: boolean;
  statsLoading: boolean;
  statsError: string | null;
  monthly: FuelMonthlyPoint[];
  totals: FuelStatsTotals;
  costByClass: FuelCostByClassItem[];
  setYear: (year: number) => void;
  setMonth: (month: string) => void;
  setVehClass: (vehClass: string) => void;
  setMakeModel: (makeModel: string) => void;
  retry: () => void;
}

export function useFuelStats(): UseFuelStatsResult {
  const { years, year, yearsLoading, yearsError, setYear } = useFuelYears();
  const [month, setMonth] = useState<string>('all');
  const [vehClass, setVehClass] = useState<string>('all');
  const [makeModel, setMakeModel] = useState<string>('all');
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<FuelMonthlyPoint[]>([]);
  const [totals, setTotals] = useState<FuelStatsTotals>(EMPTY_TOTALS);
  const [costByClass, setCostByClass] = useState<FuelCostByClassItem[]>([]);
  const requestSeq = useRef<number>(0);

  const fetchStats = useCallback(
    async (y: number, m: string, vc: string, mm: string): Promise<void> => {
      const seq = ++requestSeq.current;
      setStatsLoading(true);
      setStatsError(null);
      try {
        const bundle = await fetchFuelStatsBundle(y, m, vc, mm);
        if (seq !== requestSeq.current) return;
        setMonthly(bundle.monthly);
        setTotals(bundle.totals);
        setCostByClass(bundle.costByClass);
      } catch (err: unknown) {
        if (seq !== requestSeq.current) return;
        logger.error(`Failed to load fuel stats: ${JSON.stringify(err)}`);
        setStatsError(
          err instanceof Error ? err.message : 'Failed to load fuel stats',
        );
        setMonthly([]);
        setTotals(EMPTY_TOTALS);
        setCostByClass([]);
      } finally {
        if (seq === requestSeq.current) {
          setStatsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (year === null) return;
    void fetchStats(year, month, vehClass, makeModel);
  }, [year, month, vehClass, makeModel, fetchStats]);

  const retry = useCallback((): void => {
    if (year !== null) {
      void fetchStats(year, month, vehClass, makeModel);
    }
  }, [year, month, vehClass, makeModel, fetchStats]);

  const changeVehClass = useCallback(
    (nextVehClass: string): void => {
      setVehClass(nextVehClass);
      setMakeModel('all');
    },
    [],
  );

  return {
    years, year, month, vehClass, makeModel,
    yearsLoading, statsLoading,
    statsError: statsError ?? yearsError,
    monthly, totals, costByClass,
    setYear, setMonth, setVehClass: changeVehClass, setMakeModel, retry,
  };
}
