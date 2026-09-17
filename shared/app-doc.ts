export interface AppDoc {
  docKey: string;
  title: string;
  markdown: string;
  updatedAt: string;
}

export interface UpdateAppDocRequest {
  markdown: string;
  title?: string;
}

export interface AppDocLiveStatusTable {
  table: string;
  label: string;
  rows: number;
}

export interface AppDocLiveStatusSource {
  fileType: string;
  label: string;
  lastUploadAt: string | null;
}

export interface AppDocLiveStatusResponse {
  tables: AppDocLiveStatusTable[];
  sources: AppDocLiveStatusSource[];
}
