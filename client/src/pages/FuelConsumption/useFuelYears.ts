import { useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { getFuelYears } from '@client/src/api/dashboard';

export interface UseFuelYearsResult {
  years: number[];
  year: number | null;
  yearsLoading: boolean;
  yearsError: string | null;
  setYear: (year: number) => void;
}

export function useFuelYears(): UseFuelYearsResult {
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [yearsLoading, setYearsLoading] = useState<boolean>(true);
  const [yearsError, setYearsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setYearsLoading(true);
    getFuelYears()
      .then((res) => {
        if (cancelled) return;
        setYears(res.years);
        if (res.years.length > 0) {
          setYear(res.years[0]);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Failed to load fuel years: ${JSON.stringify(err)}`);
        setYearsError(
          err instanceof Error ? err.message : 'Failed to load fuel years',
        );
      })
      .finally(() => {
        if (!cancelled) setYearsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { years, year, yearsLoading, yearsError, setYear };
}
