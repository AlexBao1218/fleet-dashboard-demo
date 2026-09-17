import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { extractUploadErrorMessage } from '@client/src/utils/upload-error';

import type {
  ElogbookUploadRequest,
  ElogbookUploadResponse,
} from '@shared/elogbook-trip';

export async function uploadElogbook(
  body: ElogbookUploadRequest,
): Promise<ElogbookUploadResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/elogbook-trips/upload',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`elogbook 上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}
