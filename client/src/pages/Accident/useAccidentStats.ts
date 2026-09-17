import { useCallback, useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { fetchAccidentStats, fetchAccidentYears } from '@client/src/api/accident';
import type { AccidentStatsResponse } from '@shared/accident';

export interface AccidentFilters {
  category: string;
  year: number | null;
  quarter: string;
  month: string;
}

export interface UseAccidentStatsResult {
  years: number[];
  filters: AccidentFilters;
  setFilter: (patch: Partial<AccidentFilters>) => void;
  stats: AccidentStatsResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAccidentStats(): UseAccidentStatsResult {
  const [years, setYears] = useState<number[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [year, setYear] = useState<number | null>(null);
  const [quarter, setQuarter] = useState<string>('All');
  const [month, setMonth] = useState<string>('All');
  const [stats, setStats] = useState<AccidentStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const retry = useCallback((): void => {
    setVersion((v: number) => v + 1);
  }, []);

  const setFilter = useCallback((patch: Partial<AccidentFilters>): void => {
    if (patch.category !== undefined) setCategory(patch.category);
    if (patch.year !== undefined) setYear(patch.year);
    if (patch.quarter !== undefined) setQuarter(patch.quarter);
    if (patch.month !== undefined) setMonth(patch.month);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAccidentYears()
      .then((res: { years: number[] }) => {
        if (cancelled) return;
        setYears(res.years);
        if (res.years.length > 0 && year === null) {
          setYear(res.years[0]);
        } else if (res.years.length === 0) {
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Accident years load failed: ${JSON.stringify(err)}`);
        setError('数据加载失败');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  useEffect(() => {
    if (year === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: { year: number; quarter?: string; month?: string; category?: string } = {
      year,
    };
    if (quarter !== 'All') params.quarter = quarter;
    if (month !== 'All') params.month = month;
    if (category !== 'All') params.category = category;

    fetchAccidentStats(params)
      .then((res: AccidentStatsResponse) => {
        if (cancelled) return;
        setStats(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Accident stats load failed: ${JSON.stringify(err)}`);
        setError('数据加载失败');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, quarter, month, category, version]);

  return {
    years,
    filters: { category, year, quarter, month },
    setFilter,
    stats,
    loading,
    error,
    retry,
  };
}
