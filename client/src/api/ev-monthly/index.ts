import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { extractUploadErrorMessage } from '@client/src/utils/upload-error';

import type {
  EvMonthlyDeleteResponse,
  EvMonthlyUploadRequest,
  EvMonthlyUploadResponse,
} from '@shared/ev-monthly';

export async function uploadEvMonthly(
  body: EvMonthlyUploadRequest,
): Promise<EvMonthlyUploadResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/ev-monthlies/upload',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`ev 电量文件上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}

export async function deleteEvMonthly(
  month: string,
): Promise<EvMonthlyDeleteResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/ev-monthlies',
      method: 'DELETE',
      params: { month },
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`ev 电量按月删除失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}
