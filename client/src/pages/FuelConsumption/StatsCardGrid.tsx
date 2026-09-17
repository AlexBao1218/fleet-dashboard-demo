import React, { useLayoutEffect, useRef, useState } from 'react';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@client/src/components/ui/tooltip';
import { fmtCompact2, fmtInt, fmtNumber } from '@client/src/utils/format';
import type {
  EvStatsResponse,
  FuelEfficiencyResponse,
  FuelStatsTotals,
} from '@shared/dashboard';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export interface StatsCardGridProps {
  fuelTotals: FuelStatsTotals;
  efficiency: FuelEfficiencyResponse | null;
  evData: EvStatsResponse | null;
  year: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface FitNumberProps {
  text: string;
  color?: string;
  maxSize?: number;
}

const FitNumber: React.FC<FitNumberProps> = ({
  text,
  color = '#000000',
  maxSize = 40,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxSize);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const compute = (): void => {
      const width = el.clientWidth;
      if (width === 0 || !ctx) return;
      let size = maxSize;
      while (size > 28) {
        ctx.font = `700 ${size}px Inter, sans-serif`;
        if (ctx.measureText(text).width <= width) break;
        size -= 1;
      }
      setFontSize(size);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, maxSize]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden text-center">
      <span
        className="whitespace-nowrap font-bold leading-none"
        style={{ fontSize, color }}
      >
        {text}
      </span>
    </div>
  );
};

interface StatCardProps {
  title: string;
  display: string;
  exact: string;
  color?: string;
  sub?: string;
  maxSize?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  display,
  exact,
  color,
  sub,
  maxSize,
}) => (
  <div className="min-w-0">
    <p className="mb-1.5 truncate text-[13px] text-[#252423]">{title}</p>
    <div className="flex h-[72px] flex-col items-center justify-center rounded-[2px] border border-[#d9d9d9] bg-white px-3 py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full cursor-default">
            <FitNumber text={display} color={color} maxSize={maxSize} />
          </div>
        </TooltipTrigger>
        <TooltipContent>{exact}</TooltipContent>
      </Tooltip>
      {sub && (
        <p className="mt-1.5 w-full truncate text-center text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  </div>
);

function buildCoverageNote(
  monthsWithData: number[],
  year: number | null,
): string {
  const count = monthsWithData.length;
  if (count === 0 || year === null) return '';
  const sorted: number[] = [...monthsWithData].sort(
    (a: number, b: number) => a - b,
  );
  if (count === 1) {
    return ` · ${MONTH_SHORT[sorted[0] - 1]} ${year} only`;
  }
  const contiguous: boolean =
    sorted[count - 1] - sorted[0] === count - 1;
  if (contiguous) {
    return ` · ${MONTH_SHORT[sorted[0] - 1]}–${MONTH_SHORT[sorted[count - 1] - 1]} ${year} only`;
  }
  return ` · ${count} months only`;
}

const StatsCardGrid: React.FC<StatsCardGridProps> = ({
  fuelTotals,
  efficiency,
  evData,
  year,
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }, (_: unknown, i: number) => (
          <Skeleton key={i} className="h-[104px] w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-[104px] flex-col items-center justify-center gap-3 rounded-[2px] border border-[#d9d9d9] bg-white">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const petrolEff = efficiency?.petrol ?? null;
  const dieselEff = efficiency?.diesel ?? null;
  const evEff = evData?.efficiency ?? null;

  // Baseline = months with fuel data in the period; suffix shows only when a
  // card's months are a strict subset of that baseline.
  const baselineMonths = new Set<number>([
    ...(petrolEff?.monthsUsed ?? []),
    ...(dieselEff?.monthsUsed ?? []),
  ]);
  const suffixFor = (months: number[]): string => {
    if (months.length === 0 || months.length >= baselineMonths.size) return '';
    return buildCoverageNote(months, year);
  };

  const cards: StatCardProps[] = [
    {
      title: 'Petrol Vol (Liter)',
      display: fmtCompact2(fuelTotals.petrolLitres),
      exact: `${fmtNumber(fuelTotals.petrolLitres, 2)} L`,
    },
    {
      title: 'Diesel Vol (Liter)',
      display: fmtCompact2(fuelTotals.dieselLitres),
      exact: `${fmtNumber(fuelTotals.dieselLitres, 2)} L`,
    },
    {
      title: 'Electricity Consumed (kwh)',
      display: fmtCompact2(evData?.totalKwh ?? 0),
      exact: `${fmtNumber(evData?.totalKwh ?? 0, 2)} kWh`,
    },
    {
      title: 'Petrol Cost',
      display: `$${fmtCompact2(fuelTotals.petrolCostHkd)}`,
      exact: `$${fmtNumber(fuelTotals.petrolCostHkd, 2)}`,
    },
    {
      title: 'Diesel Cost',
      display: `$${fmtCompact2(fuelTotals.dieselCostHkd)}`,
      exact: `$${fmtNumber(fuelTotals.dieselCostHkd, 2)}`,
    },
    {
      title: 'Electricity Cost',
      display: `$${fmtCompact2(evData?.costHkd ?? 0)}`,
      exact: `$${fmtNumber(evData?.costHkd ?? 0, 2)}`,
    },
    {
      title: 'Petrol Efficiency (Km/L)',
      display:
        petrolEff?.kmPerLitre != null
          ? fmtNumber(petrolEff.kmPerLitre, 2)
          : '—',
      exact:
        petrolEff?.kmPerLitre != null
          ? `${fmtNumber(petrolEff.kmPerLitre, 2)} km/L`
          : 'No data',
      color: '#00a8f8',
      maxSize: 32,
      sub: petrolEff
        ? `${fmtInt(petrolEff.netKm)} km / ${fmtNumber(petrolEff.litres, 2)} L${suffixFor(petrolEff.monthsUsed)}`
        : undefined,
    },
    {
      title: 'Diesel Efficiency (Km/L)',
      display:
        dieselEff?.kmPerLitre != null
          ? fmtNumber(dieselEff.kmPerLitre, 2)
          : '—',
      exact:
        dieselEff?.kmPerLitre != null
          ? `${fmtNumber(dieselEff.kmPerLitre, 2)} km/L`
          : 'No data',
      color: '#f87000',
      maxSize: 32,
      sub: dieselEff
        ? `${fmtInt(dieselEff.netKm)} km / ${fmtNumber(dieselEff.litres, 2)} L${suffixFor(dieselEff.monthsUsed)}`
        : undefined,
    },
    {
      title: 'EV Efficiency (km/kwh)',
      display:
        evEff?.kmPerKwh != null ? fmtNumber(evEff.kmPerKwh, 2) : '—',
      exact:
        evEff?.kmPerKwh != null
          ? `${fmtNumber(evEff.kmPerKwh, 2)} km/kWh`
          : 'No data',
      color: '#18a840',
      maxSize: 32,
      sub: evEff
        ? `${fmtInt(evEff.netKm)} km / ${fmtNumber(evEff.totalKwh, 2)} kWh${suffixFor(evEff.monthsUsed)}`
        : undefined,
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card: StatCardProps) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </TooltipProvider>
  );
};

export default StatsCardGrid;
