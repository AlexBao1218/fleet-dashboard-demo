import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  DeleteFuelProductMapResponse,
  FuelProductMapItem,
  FuelProductMapListResponse,
  SaveFuelProductMapRequest,
} from '@shared/fuel-product-map';

export async function listFuelProductMaps(
  supplier?: string,
): Promise<FuelProductMapListResponse> {
  const response = await axiosForBackend.get<FuelProductMapListResponse>(
    '/api/fuel-product-maps',
    { params: supplier ? { supplier } : undefined },
  );
  return response.data;
}

export async function createFuelProductMap(
  body: SaveFuelProductMapRequest,
): Promise<FuelProductMapItem> {
  const response = await axiosForBackend.post<FuelProductMapItem>(
    '/api/fuel-product-maps',
    body,
  );
  return response.data;
}

export async function updateFuelProductMap(
  id: string,
  body: SaveFuelProductMapRequest,
): Promise<FuelProductMapItem> {
  const response = await axiosForBackend.patch<FuelProductMapItem>(
    `/api/fuel-product-maps/${id}`,
    body,
  );
  return response.data;
}

export async function deleteFuelProductMap(
  id: string,
): Promise<DeleteFuelProductMapResponse> {
  const response = await axiosForBackend.delete<DeleteFuelProductMapResponse>(
    `/api/fuel-product-maps/${id}`,
  );
  return response.data;
}
