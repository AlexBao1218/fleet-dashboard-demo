export type ManualEntrySupplier = 'Supplier B' | 'Supplier C';

export interface FuelCardUploadRequest {
  fileName: string;
  downloadUrl: string;
}

export interface FuelCardUploadResponse {
  fileName: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  warnings: string;
}

export interface HistoryUploadRequest {
  fileName: string;
  downloadUrl: string;
}

export interface HistoryUploadResponse {
  fileName: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  warnings: string;
}

export interface ManualEntryRequest {
  supplier: ManualEntrySupplier;
  txnDate: string;
  plate: string;
  productName: string;
  litres: number;
  costHkd: number;
  docNo: string;
}

export interface ManualEntryResponse {
  id: string;
  txnKey: string;
}

export interface ManualEntryItem {
  id: string;
  supplier: string;
  txnDate: string;
  plate: string;
  productName: string;
  fuelType: string;
  litres: number;
  costHkd: number;
  docNo: string;
}

export interface ManualEntryListResponse {
  items: ManualEntryItem[];
}

export interface DeleteManualEntryResponse {
  success: boolean;
}
