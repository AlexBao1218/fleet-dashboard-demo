export const ACCIDENT_CATEGORIES = [
  'Own Fault Accident',
  'Third Party Fault Accident',
  'Third Party Fault Injury',
  'Own Fault Injury',
] as const;

export type AccidentCategory = (typeof ACCIDENT_CATEGORIES)[number];

export interface AccidentUploadRequest {
  fileName: string;
  downloadUrl: string;
}

export interface AccidentUploadResponse {
  fileName: string;
  rowsRead: number;
  rowsAdded: number;
  rowsUpdated: number;
  rowsRejected: number;
  inScopeCount: number;
  outOfScopeCount: number;
  warnings: string;
}

export interface AccidentCategoryCount {
  category: AccidentCategory;
  count: number;
}

export interface AccidentMonthlyCount {
  category: AccidentCategory;
  year: number;
  month: number;
  count: number;
}

export interface AccidentYearsResponse {
  years: number[];
}

export interface AccidentDataCutoffResponse {
  month: string | null;
}

export interface AccidentStatsQuery {
  year: number;
  quarter?: number;
  month?: number;
  category?: AccidentCategory | 'All';
}

export interface AccidentStatsResponse {
  pie: AccidentCategoryCount[];
  bars: AccidentMonthlyCount[];
}
