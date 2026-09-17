import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { extractUploadErrorMessage } from '@client/src/utils/upload-error';

import type {
  AccidentDataCutoffResponse,
  AccidentUploadRequest,
  AccidentUploadResponse,
  AccidentYearsResponse,
  AccidentStatsResponse,
  AccidentStatsQuery,
} from '@shared/accident';

export async function uploadAccident(
  body: AccidentUploadRequest,
): Promise<AccidentUploadResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/accident/upload',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`Accident 文件上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}

export async function fetchAccidentYears(): Promise<AccidentYearsResponse> {
  const response = await axiosForBackend({
    url: '/api/accident/years',
    method: 'GET',
  });
  return response.data;
}

export async function fetchAccidentDataCutoff(): Promise<AccidentDataCutoffResponse> {
  const response = await axiosForBackend({
    url: '/api/accident/data-cutoff',
    method: 'GET',
  });
  return response.data;
}

export async function fetchAccidentStats(
  params: { year: number; quarter?: string; month?: string; category?: string },
): Promise<AccidentStatsResponse> {
  const response = await axiosForBackend({
    url: '/api/accident/stats',
    method: 'GET',
    params,
  });
  return response.data;
}
