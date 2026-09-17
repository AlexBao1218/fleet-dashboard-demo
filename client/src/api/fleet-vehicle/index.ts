import axios from 'axios';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  FleetUploadParseRequest,
  FleetUploadParseResponse,
} from '@shared/fleet-vehicle';

interface BackendErrorData {
  message?: string | string[];
  error?: { message?: string };
}

function extractBackendMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendErrorData | undefined;
    const nested = data?.error?.message;
    if (typeof nested === 'string' && nested) return nested;
    const top = data?.message;
    if (typeof top === 'string' && top) return top;
    if (Array.isArray(top)) {
      const parts = top.filter((part: unknown): part is string => typeof part === 'string');
      if (parts.length > 0) return parts.join('；');
    }
  }
  return '解析失败，请稍后重试';
}

export async function parseFleetUpload(
  body: FleetUploadParseRequest,
): Promise<FleetUploadParseResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/fleet-vehicles/upload',
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(extractBackendMessage(error));
  }
}
