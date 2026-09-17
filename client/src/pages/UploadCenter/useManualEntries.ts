import { useCallback, useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { listManualEntries } from '@client/src/api/fuel-transaction';
import type { ManualEntryItem } from '@shared/fuel-transaction';

export interface UseManualEntriesResult {
  items: ManualEntryItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useManualEntries(): UseManualEntriesResult {
  const [items, setItems] = useState<ManualEntryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await listManualEntries(20);
      setItems(response.items);
    } catch (error: unknown) {
      logger.error(`加载手工录入记录失败: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
