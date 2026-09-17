export type FuelType = 'Petrol' | 'Diesel';

export interface FuelProductMapItem {
  id: string;
  supplier: string;
  productName: string;
  fuelType: FuelType;
}

export interface FuelProductMapListResponse {
  items: FuelProductMapItem[];
  total: number;
}

export interface SaveFuelProductMapRequest {
  supplier: string;
  productName: string;
  fuelType: FuelType;
}

export interface DeleteFuelProductMapResponse {
  success: boolean;
}
