import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type { ExportTableName } from '@shared/export';

export async function downloadTableCsv(
  tableName: ExportTableName,
): Promise<void> {
  const response = await axiosForBackend.get<Blob>(
    `/api/export/${tableName}`,
    { responseType: 'blob' },
  );
  const blob: Blob = new Blob([response.data], {
    type: 'text/csv;charset=utf-8',
  });
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.href = url;
  anchor.download = `${tableName}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
