import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { maintenanceApi } from '@client/src/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@client/src/components/ui/tooltip';
import { fmtCompact2, fmtNumber } from '@client/src/utils/format';
import { SyntheticBadge } from '@client/src/components/SyntheticBadge';

import { CARD_BORDER } from './maintColors';

function fmtCompact3(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${fmtNumber(value / 1_000_000, 2)}M`;
  if (abs >= 1_000) return `${fmtNumber(value / 1_000, 3)}K`;
  return fmtNumber(value, 0);
}

const YEAR_OPTIONS = [2026, 2025];

const QUARTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '1', label: 'Q1' },
  { value: '2', label: 'Q2' },
  { value: '3', label: 'Q3' },
  { value: '4', label: 'Q4' },
];

const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_: unknown, i: number) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

const VEHICLE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Private Car', label: 'Private Car' },
  { value: 'Van', label: 'Van' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'Lorry', label: 'Lorry' },
];

interface FitNumberProps {
  text: string;
  maxSize?: number;
}

const FitNumber: React.FC<FitNumberProps> = ({ text, maxSize = 40 }) => {
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
      while (size > 24) {
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
      <span className="whitespace-nowrap font-bold leading-none text-[#1a1a1a]" style={{ fontSize }}>
        {text}
      </span>
    </div>
  );
};

const SELECT_TRIGGER_CLASS =
  'h-8 w-full rounded-[2px] border-[#bfbfbf] bg-white text-[13px] text-[#1a1a1a]';

export interface MaintenanceHeaderRightProps {
  year: number;
  quarter: string;
  month: string;
  totalOrders: number;
  totalCost: number;
  onYearChange: (y: number) => void;
  onQuarterChange: (q: string) => void;
  onMonthChange: (m: string) => void;
}

interface StatCardProps {
  title: string;
  display: string;
  exact: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, display, exact }) => (
  <div className="min-w-0">
    <p className="mb-1 truncate text-[14px] font-semibold text-[#1a1a1a]">{title}</p>
    <div
      className="flex h-[84px] items-center justify-center rounded-[2px] border bg-white px-3"
      style={{ borderColor: CARD_BORDER }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full cursor-default">
            <FitNumber text={display} maxSize={44} />
          </div>
        </TooltipTrigger>
        <TooltipContent>{exact}</TooltipContent>
      </Tooltip>
    </div>
  </div>
);

export interface MaintenanceHeaderLeftProps {
  vehicleType: string;
  avgAvailability: number | null;
  onVehicleTypeChange: (v: string) => void;
}

export const MaintenanceHeaderLeft: React.FC<MaintenanceHeaderLeftProps> = ({
  vehicleType,
  avgAvailability,
  onVehicleTypeChange,
}) => {
  const [cutoff, setCutoff] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    maintenanceApi
      .fetchMaintDataCutoff()
      .then((res) => {
        if (cancelled) return;
        setCutoff(res.month);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Failed to load maint data cutoff: ${JSON.stringify(err)}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availDisplay = avgAvailability !== null ? `${avgAvailability.toFixed(2)}%` : '—';
  const availExact =
    avgAvailability !== null ? `${fmtNumber(avgAvailability, 2)}%` : 'No data';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col">
          <h1 className="text-[22px] font-bold leading-7 text-[#084078]">Maintenance</h1>
          <p className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
            Data up to {cutoff ?? '—'}
            <SyntheticBadge />
          </p>
        </div>
        <div className="flex w-[200px] flex-col gap-1">
          <p className="text-[13px] font-semibold text-[#1a1a1a]">Vehicle Type</p>
          <Select value={vehicleType} onValueChange={onVehicleTypeChange}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TooltipProvider delayDuration={200}>
        <StatCard title="Average Availability %" display={availDisplay} exact={availExact} />
      </TooltipProvider>
    </div>
  );
};

export const MaintenanceHeaderRight: React.FC<MaintenanceHeaderRightProps> = ({
  year,
  quarter,
  month,
  totalOrders,
  totalCost,
  onYearChange,
  onQuarterChange,
  onMonthChange,
}) => {
  const ordersDisplay = fmtCompact3(totalOrders);
  const ordersExact = `${totalOrders.toLocaleString('en-US')} orders`;
  const costDisplay = `$${fmtCompact2(totalCost)}`;
  const costExact = `$${fmtNumber(totalCost, 2)}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-[#1a1a1a]">Year</p>
          <Select
            value={String(year)}
            onValueChange={(v: string) => onYearChange(Number(v))}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y: number) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-[#1a1a1a]">Quarter</p>
          <Select value={quarter} onValueChange={onQuarterChange}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUARTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-[#1a1a1a]">Month</p>
          <Select value={month} onValueChange={onMonthChange}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Maintenance Order"
            display={ordersDisplay}
            exact={ordersExact}
          />
          <StatCard
            title="Total Maintenance Cost"
            display={costDisplay}
            exact={costExact}
          />
        </div>
      </TooltipProvider>
    </div>
  );
};
