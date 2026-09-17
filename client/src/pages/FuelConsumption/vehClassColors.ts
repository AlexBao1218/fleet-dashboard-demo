const VEH_CLASS_COLORS: Record<string, string> = {
  'Private Car': '#4a9195',
  Van: '#00adfc',
  Motorcycle: '#c4b07b',
  Lorry: '#f08848',
  '(Unmatched)': '#7f7f7f',
};

const DEFAULT_VEH_CLASS_COLOR = '#7f7f7f';

export function vehClassColor(vehClass: string): string {
  return VEH_CLASS_COLORS[vehClass] ?? DEFAULT_VEH_CLASS_COLOR;
}
