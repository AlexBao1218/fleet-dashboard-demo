export type UploadFileType =
  | 'fleet'
  | 'fuel_card'
  | 'elogbook'
  | 'ev'
  | 'maint'
  | 'accident'
  | 'history';

export interface UploadLog {
  id: string;
  fileType: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  warnings: string;
}

export interface RecordUploadRequest {
  fileType: UploadFileType;
  fileName: string;
}

export interface RecordUploadResponse extends UploadLog {
  fileType: UploadFileType;
}

export interface UploadLogListResponse {
  items: UploadLog[];
  total: number;
}
