export interface ElogbookUploadRequest {
  fileName: string;
  downloadUrl: string;
}

export interface ElogbookUploadResponse {
  fileName: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  validCount: number;
  warnings: string;
}
