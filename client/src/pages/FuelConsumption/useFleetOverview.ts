import { useCallback, useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { getFleetOverview } from '@client/src/api/dashboard';
import type { FleetOverviewResponse } from '@shared/dashboard';

export interface UseFleetOverviewResult {
  data: FleetOverviewResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFleetOverview(): UseFleetOverviewResult {
  const [data, setData] = useState<FleetOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result: FleetOverviewResponse = await getFleetOverview();
      setData(result);
    } catch (err: unknown) {
      const message: string =
        err instanceof Error ? err.message : 'Failed to load fleet overview';
      logger.error(`Failed to load fleet overview: ${JSON.stringify(err)}`);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
