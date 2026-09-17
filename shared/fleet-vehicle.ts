export interface FleetUploadParseRequest {
  fileName: string;
  downloadUrl: string;
}

export interface FleetUploadParseResponse {
  fileName: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  warnings: string;
}
