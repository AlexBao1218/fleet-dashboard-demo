import { useCallback, useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { fetchMaintStats } from '@client/src/api/maintenance';
import type { MaintStatsResponse } from '@shared/maintenance';

export interface UseMaintStatsResult {
  data: MaintStatsResponse | null;
  loading: boolean;
  error: string | null;
  year: number;
  quarter: string;
  month: string;
  vehicleType: string;
  setYear: (y: number) => void;
  setQuarter: (q: string) => void;
  setMonth: (m: string) => void;
  setVehicleType: (v: string) => void;
  retry: () => void;
}

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export function useMaintStats(): UseMaintStatsResult {
  const [year, setYear] = useState<number>(YEARS[0]);
  const [quarter, setQuarter] = useState<string>('all');
  const [month, setMonth] = useState<string>('all');
  const [vehicleType, setVehicleType] = useState<string>('all');
  const [data, setData] = useState<MaintStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const retry = useCallback((): void => {
    setVersion((v: number) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: {
      year: number;
      quarter?: string;
      month?: string;
      vehicleType?: string;
    } = { year };
    if (quarter !== 'all') params.quarter = quarter;
    if (month !== 'all') params.month = month;
    if (vehicleType !== 'all') params.vehicleType = vehicleType;

    fetchMaintStats(params)
      .then((res: MaintStatsResponse) => {
        if (cancelled) return;
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Maintenance stats load failed: ${JSON.stringify(err)}`);
        setError('数据加载失败');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, quarter, month, vehicleType, version]);

  return {
    data,
    loading,
    error,
    year,
    quarter,
    month,
    vehicleType,
    setYear,
    setQuarter,
    setMonth,
    setVehicleType,
    retry,
  };
}
