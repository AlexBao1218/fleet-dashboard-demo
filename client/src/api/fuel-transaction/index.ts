import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { extractUploadErrorMessage } from '@client/src/utils/upload-error';

import type {
  FuelCardUploadRequest,
  FuelCardUploadResponse,
  DeleteManualEntryResponse,
  HistoryUploadRequest,
  HistoryUploadResponse,
  ManualEntryListResponse,
  ManualEntryRequest,
  ManualEntryResponse,
} from '@shared/fuel-transaction';

export async function uploadFuelCard(
  body: FuelCardUploadRequest,
): Promise<FuelCardUploadResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/fuel-transactions/upload-fuel-card',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`fuel_card 上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}

export async function uploadHistory(
  body: HistoryUploadRequest,
): Promise<HistoryUploadResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/fuel-transactions/upload-history',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`history 上传解析失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}

export async function createManualEntry(
  body: ManualEntryRequest,
): Promise<ManualEntryResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/fuel-transactions/manual',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    logger.error(`手工录入失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}

export async function listManualEntries(
  limit = 20,
): Promise<ManualEntryListResponse> {
  const response = await axiosForBackend.get<ManualEntryListResponse>(
    '/api/fuel-transactions/manual',
    { params: { limit } },
  );
  return response.data;
}

export async function deleteManualEntry(
  id: string,
): Promise<DeleteManualEntryResponse> {
  try {
    const response = await axiosForBackend.delete<DeleteManualEntryResponse>(
      `/api/fuel-transactions/manual/${id}`,
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(`删除手工录入失败: ${JSON.stringify(error)}`);
    throw new Error(extractUploadErrorMessage(error));
  }
}
