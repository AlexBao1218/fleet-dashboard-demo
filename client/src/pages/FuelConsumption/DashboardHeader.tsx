import React, { useEffect, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { getDataCutoff } from '@client/src/api/dashboard';
import type { MakeModelOptionItem } from '@shared/dashboard';
import { Label } from '@client/src/components/ui/label';
import { SyntheticBadge } from '@client/src/components/SyntheticBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...Array.from({ length: 12 }, (_: unknown, i: number) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

const VEH_CLASS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Private Car', label: 'Private Car' },
  { value: 'Van', label: 'Van' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'Lorry', label: 'Lorry' },
];

export interface DashboardHeaderProps {
  years: number[];
  year: number | null;
  month: string;
  vehClass: string;
  makeModel: string;
  makeModelOptions: MakeModelOptionItem[];
  makeModelOptionsLoading: boolean;
  yearsLoading: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: string) => void;
  onVehClassChange: (vehClass: string) => void;
  onMakeModelChange: (makeModel: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  years,
  year,
  month,
  vehClass,
  makeModel,
  makeModelOptions,
  makeModelOptionsLoading,
  yearsLoading,
  onYearChange,
  onMonthChange,
  onVehClassChange,
  onMakeModelChange,
}) => {
  const [cutoffMonth, setCutoffMonth] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDataCutoff()
      .then((res) => {
        if (cancelled) return;
        setCutoffMonth(res.month);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Failed to load data cutoff: ${JSON.stringify(err)}`);
        setCutoffMonth(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col">
          <h1 className="text-[22px] font-bold leading-7 text-[#084078]">
            Fuel Consumption
          </h1>
          <p className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
            Data up to {cutoffMonth ?? '—'}
            <SyntheticBadge />
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select
              value={year !== null ? String(year) : ''}
              onValueChange={(v: string) => onYearChange(Number(v))}
              disabled={yearsLoading || years.length === 0}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue
                  placeholder={yearsLoading ? 'Loading...' : 'No data'}
                />
              </SelectTrigger>
              <SelectContent>
                {years.map((y: number) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Month</Label>
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[100px]">
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
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Veh. Class</Label>
            <Select value={vehClass} onValueChange={onVehClassChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEH_CLASS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Make &amp; Model</Label>
            <Select value={makeModel} onValueChange={onMakeModelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={makeModelOptionsLoading ? 'Loading...' : 'All'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {makeModelOptions.map((opt: MakeModelOptionItem) => (
                  <SelectItem key={opt.combo} value={opt.combo}>
                    {opt.combo} ({opt.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
