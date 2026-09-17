export interface EvMonthlyUploadRequest {
  fileName: string;
  downloadUrl: string;
  month: string;
}

export interface EvMonthlyUploadResponse {
  fileName: string;
  month: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  totalKwh: number;
  costHkd: number;
  warnings: string;
}

export interface EvMonthlyDeleteResponse {
  month: string;
  deletedRows: number;
}
