import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { getFuelEfficiency } from '@client/src/api/dashboard';
import type { FuelEfficiencyResponse } from '@shared/dashboard';

export interface UseFuelEfficiencyResult {
  data: FuelEfficiencyResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFuelEfficiency(
  year: number | null,
  month: number | 'all' | string,
  vehClass: string,
  makeModel: string,
): UseFuelEfficiencyResult {
  const [data, setData] = useState<FuelEfficiencyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef<number>(0);

  const fetchEfficiency = useCallback(
    async (
      y: number,
      m: number | 'all' | string,
      vc: string,
      mm: string,
    ): Promise<void> => {
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      try {
        const res = await getFuelEfficiency({
          year: y,
          month: m === 'all' ? 'all' : Number(m),
          vehClass: vc,
          makeModel: mm,
        });
        if (seq !== requestSeq.current) return;
        setData(res);
      } catch (err: unknown) {
        if (seq !== requestSeq.current) return;
        logger.error(`Failed to load efficiency data: ${JSON.stringify(err)}`);
        setError('Failed to load efficiency data');
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
    void fetchEfficiency(year, month, vehClass, makeModel);
  }, [year, month, vehClass, makeModel, fetchEfficiency]);

  const retry = useCallback((): void => {
    if (year !== null) {
      void fetchEfficiency(year, month, vehClass, makeModel);
    }
  }, [year, month, vehClass, makeModel, fetchEfficiency]);

  return { data, loading, error, retry };
}
