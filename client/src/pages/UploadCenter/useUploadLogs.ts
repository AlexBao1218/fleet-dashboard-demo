import { useCallback, useEffect, useState } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { listUploadLogs } from '@client/src/api/upload-log';
import type { UploadLog } from '@shared/upload-log';

export interface UseUploadLogsResult {
  items: UploadLog[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useUploadLogs(fileType: string): UseUploadLogsResult {
  const [items, setItems] = useState<UploadLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await listUploadLogs(fileType);
      setItems(response.items);
    } catch (error: unknown) {
      logger.error(`加载上传历史失败: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }, [fileType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
