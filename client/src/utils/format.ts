export function fmtNumber(value: number, fractionDigits: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function fmtInt(value: number): string {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
}

export function fmtHkd(value: number): string {
  return fmtNumber(value, 2);
}

export function fmtPercent(value: number, fractionDigits: number = 1): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function fmtCompact2(value: number): string {
  const abs: number = Math.abs(value);
  if (abs >= 1_000_000) return `${fmtNumber(value / 1_000_000, 2)}M`;
  if (abs >= 1_000) return `${fmtNumber(value / 1_000, 2)}K`;
  return fmtNumber(value, 2);
}
