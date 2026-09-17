import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  DataCutoffResponse,
  EvStatsResponse,
  FleetOverviewResponse,
  FuelCostByClassResponse,
  FuelEfficiencyResponse,
  FuelStatsResponse,
  FuelYearsResponse,
  MakeModelOptionsResponse,
} from '@shared/dashboard';

export async function getDataCutoff(): Promise<DataCutoffResponse> {
  const response = await axiosForBackend.get<DataCutoffResponse>(
    '/api/dashboard/data-cutoff',
  );
  return response.data;
}

export async function getFleetOverview(): Promise<FleetOverviewResponse> {
  const response = await axiosForBackend.get<FleetOverviewResponse>(
    '/api/dashboard/fleet-overview',
  );
  return response.data;
}

export async function getFuelYears(): Promise<FuelYearsResponse> {
  const response = await axiosForBackend.get<FuelYearsResponse>(
    '/api/dashboard/fuel-years',
  );
  return response.data;
}

export interface GetFuelStatsParams {
  year: number;
  month: string;
  vehClass: string;
  makeModel: string;
}

export async function getFuelStats(
  params: GetFuelStatsParams,
): Promise<FuelStatsResponse> {
  const response = await axiosForBackend.get<FuelStatsResponse>(
    '/api/dashboard/fuel-stats',
    {
      params: {
        year: String(params.year),
        month: params.month,
        vehClass: params.vehClass,
        makeModel: params.makeModel,
      },
    },
  );
  return response.data;
}

export interface GetFuelCostByClassParams {
  year: number;
  month: string;
  makeModel: string;
}

export async function getFuelCostByClass(
  params: GetFuelCostByClassParams,
): Promise<FuelCostByClassResponse> {
  const response = await axiosForBackend.get<FuelCostByClassResponse>(
    '/api/dashboard/fuel-cost-by-class',
    {
      params: {
        year: String(params.year),
        month: params.month,
        makeModel: params.makeModel,
      },
    },
  );
  return response.data;
}

export interface GetFuelEfficiencyParams {
  year: number;
  month: number | 'all';
  vehClass: string;
  makeModel: string;
}

export async function getFuelEfficiency(
  params: GetFuelEfficiencyParams,
): Promise<FuelEfficiencyResponse> {
  const response = await axiosForBackend.get<FuelEfficiencyResponse>(
    '/api/dashboard/fuel-efficiency',
    {
      params: {
        year: String(params.year),
        month: String(params.month),
        vehClass: params.vehClass,
        makeModel: params.makeModel,
      },
    },
  );
  return response.data;
}

export interface GetMakeModelOptionsParams {
  vehClass: string;
}

export async function getMakeModelOptions(
  params: GetMakeModelOptionsParams,
): Promise<MakeModelOptionsResponse> {
  const response = await axiosForBackend.get<MakeModelOptionsResponse>(
    '/api/dashboard/make-model-options',
    {
      params: { vehClass: params.vehClass },
    },
  );
  return response.data;
}

export interface GetEvStatsParams {
  year: number;
  month: string;
}

export async function getEvStats(
  params: GetEvStatsParams,
): Promise<EvStatsResponse> {
  const response = await axiosForBackend.get<EvStatsResponse>(
    '/api/dashboard/ev-stats',
    {
      params: {
        year: String(params.year),
        month: params.month,
      },
    },
  );
  return response.data;
}
