import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  AppDoc,
  AppDocLiveStatusResponse,
  UpdateAppDocRequest,
} from '@shared/app-doc';

export async function getAppDoc(docKey: string): Promise<AppDoc> {
  const response = await axiosForBackend({
    url: `/api/app-docs/${docKey}`,
    method: 'GET',
  });
  return response.data;
}

export async function updateAppDoc(
  docKey: string,
  body: UpdateAppDocRequest,
): Promise<AppDoc> {
  const response = await axiosForBackend({
    url: `/api/app-docs/${docKey}`,
    method: 'PUT',
    data: body,
  });
  return response.data;
}

export async function getLiveStatus(): Promise<AppDocLiveStatusResponse> {
  const response = await axiosForBackend({
    url: '/api/app-docs/live-status',
    method: 'GET',
  });
  return response.data;
}
