import { useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { getMakeModelOptions } from '@client/src/api/dashboard';
import type { MakeModelOptionItem } from '@shared/dashboard';

export interface UseMakeModelOptionsResult {
  options: MakeModelOptionItem[];
  loading: boolean;
}

export function useMakeModelOptions(vehClass: string): UseMakeModelOptionsResult {
  const [options, setOptions] = useState<MakeModelOptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMakeModelOptions({ vehClass })
      .then((res) => {
        if (cancelled) return;
        setOptions(res.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Failed to load make & model options: ${JSON.stringify(err)}`);
        setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vehClass]);

  return { options, loading };
}
