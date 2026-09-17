export const DEPOT_A_COLOR = '#5a9e9c';
export const DEPOT_B_COLOR = '#00b8ff';
export const AVAIL_LINE_COLOR = '#0e4c7a';
export const AVAIL_BASELINE_COLOR = '#c00000';
export const THIRD_PARTY_BAR_COLOR = '#4a9195';
export const LABOR_COLOR = '#4a9195';
export const PARTS_COLOR = '#00adfc';
export const THIRD_PARTY_COLOR = '#c4b07b';
export const PANEL_BORDER = '#d9d9d9';
export const CARD_BORDER = '#d9d9d9';
export const TITLE_COLOR = '#084078';
export const TEXT_COLOR = '#252423';
export const GRID_COLOR = '#bfbfbf';

export const VEHICLE_TYPE_COLORS: Record<string, string> = {
  'Private Car': '#4a9195',
  Van: '#00adfc',
  Motorcycle: '#c4b07b',
  Lorry: '#f08848',
};

export const DEFAULT_VEHICLE_COLOR = '#7f7f7f';

export function vehicleTypeColor(type: string): string {
  return VEHICLE_TYPE_COLORS[type] ?? DEFAULT_VEHICLE_COLOR;
}

export const DEPOT_COLORS: Record<string, string> = {
  'Depot A': DEPOT_A_COLOR,
  'Depot B': DEPOT_B_COLOR,
};

export const DEFAULT_DEPOT_COLOR = '#7f7f7f';

export function depotColor(depot: string): string {
  return DEPOT_COLORS[depot] ?? DEFAULT_DEPOT_COLOR;
}
