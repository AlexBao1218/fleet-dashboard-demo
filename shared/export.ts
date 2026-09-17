export const EXPORT_TABLE_NAMES = [
  'fleet_vehicle',
  'fuel_transaction',
  'elogbook_trip',
  'ev_monthly',
  'maint_order',
  'maint_manpower',
  'maint_part',
  'maint_third_party',
  'availability_month',
  'accident_record',
  'fuel_product_map',
  'upload_log',
] as const;

export type ExportTableName = (typeof EXPORT_TABLE_NAMES)[number];

export interface ExportTableOption {
  value: ExportTableName;
  label: string;
}

export const EXPORT_TABLE_OPTIONS: ExportTableOption[] = EXPORT_TABLE_NAMES.map(
  (name: ExportTableName) => ({ value: name, label: name }),
);

export function isExportTableName(value: string): value is ExportTableName {
  return (EXPORT_TABLE_NAMES as readonly string[]).includes(value);
}
