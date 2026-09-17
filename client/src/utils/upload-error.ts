import axios from 'axios';

export const SERVER_PROCESS_LIMIT_MB = 50;
export const SERVER_PROCESS_LIMIT_BYTES = SERVER_PROCESS_LIMIT_MB * 1024 * 1024;

const TIMEOUT_MESSAGE =
  '请求超时或连接中断，文件可能过大，请按月拆分后重新上传';

interface BackendErrorData {
  message?: string | string[];
  error?: { message?: string };
}

export function buildFileSizeErrorMessage(fileSize: number): string {
  const sizeMb: number = Math.max(1, Math.round(fileSize / 1024 / 1024));
  return `文件约 ${sizeMb} MB，超过服务端单次处理上限 ${SERVER_PROCESS_LIMIT_MB} MB，请按月拆分后重新上传`;
}

export function extractUploadErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return TIMEOUT_MESSAGE;
    }
    if (!error.response) {
      return TIMEOUT_MESSAGE;
    }
    const status: number | undefined = error.response.status;
    if (status === 413) {
      return `文件超过大小上限，请按月拆分后重新上传`;
    }
    if (status === 502 || status === 503 || status === 504) {
      return '服务端处理超时，文件可能过大，请按月拆分后重新上传';
    }
    const data = error.response.data as BackendErrorData | undefined;
    const nested: unknown = data?.error?.message;
    if (typeof nested === 'string' && nested) return nested;
    const top: unknown = data?.message;
    if (typeof top === 'string' && top) return top;
    if (Array.isArray(top)) {
      const parts: string[] = top.filter(
        (part: unknown): part is string => typeof part === 'string',
      );
      if (parts.length > 0) return parts.join('；');
    }
  }
  return '操作失败，请稍后重试';
}
