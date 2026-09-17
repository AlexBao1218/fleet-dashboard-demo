import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { getEvStats } from '@client/src/api/dashboard';
import type { EvStatsResponse } from '@shared/dashboard';

export interface UseEvStatsResult {
  data: EvStatsResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useEvStats(
  year: number | null,
  month: number | 'all' | string,
): UseEvStatsResult {
  const [data, setData] = useState<EvStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef<number>(0);

  const fetchStats = useCallback(
    async (y: number, m: number | 'all' | string): Promise<void> => {
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      try {
        const monthParam: string = m === 'all' ? 'all' : String(Number(m));
        const res = await getEvStats({ year: y, month: monthParam });
        if (seq !== requestSeq.current) return;
        setData(res);
      } catch (err: unknown) {
        if (seq !== requestSeq.current) return;
        logger.error(`Failed to load EV stats: ${JSON.stringify(err)}`);
        setError('Failed to load EV stats');
        setData(null);
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (year === null) return;
    void fetchStats(year, month);
  }, [year, month, fetchStats]);

  const retry = useCallback((): void => {
    if (year !== null) {
      void fetchStats(year, month);
    }
  }, [year, month, fetchStats]);

  return { data, loading, error, retry };
}
