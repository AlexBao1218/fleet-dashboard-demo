import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { extractUploadErrorMessage } from '@client/src/utils/upload-error';

import type {
  MaintDataCutoffResponse,
  MaintStatsResponse,
  WorkshopUploadRequest,
  WorkshopUploadResponse,
} from '@shared/maintenance';

export async function uploadWorkshopOrders(
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  return postWorkshopUpload('/api/maintenance/upload-orders', body);
}

export async function uploadWorkshopManpower(
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  return postWorkshopUpload('/api/maintenance/upload-manpower', body);
}

export async function uploadWorkshopParts(
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  return postWorkshopUpload('/api/maintenance/upload-parts', body);
}

export async function uploadWorkshopThirdParty(
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  return postWorkshopUpload('/api/maintenance/upload-third-party', body);
}

export async function uploadAvailabilityHistory(
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  return postWorkshopUpload('/api/maintenance/upload-availability', body);
}

export async function fetchMaintDataCutoff(): Promise<MaintDataCutoffResponse> {
  const response = await axiosForBackend({
    url: '/api/maintenance/data-cutoff',
    method: 'GET',
  });
  return response.data;
}

export async function fetchMaintStats(params: {
  year: number;
  quarter?: string;
  month?: string;
  vehicleType?: string;
}): Promise<MaintStatsResponse> {
  const response = await axiosForBackend({
    url: '/api/maintenance/stats',
    method: 'GET',
    params,
  });
  return response.data;
}

async function postWorkshopUpload(
  url: string,
  body: WorkshopUploadRequest,
): Promise<WorkshopUploadResponse> {
  try {
    const response = await axiosForBackend({
      url,
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`维修文件上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}
