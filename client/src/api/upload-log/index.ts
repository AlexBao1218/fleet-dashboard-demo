import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  RecordUploadRequest,
  RecordUploadResponse,
  UploadLogListResponse,
} from '@shared/upload-log';

export async function recordUpload(
  body: RecordUploadRequest,
): Promise<RecordUploadResponse> {
  const response = await axiosForBackend({
    url: '/api/upload-logs',
    method: 'POST',
    data: body,
  });
  return response.data;
}

export async function listUploadLogs(
  fileType: string,
): Promise<UploadLogListResponse> {
  const response = await axiosForBackend({
    url: '/api/upload-logs',
    method: 'GET',
    params: { fileType },
  });
  return response.data;
}
