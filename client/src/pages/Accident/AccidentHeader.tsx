import React, { useEffect, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { ACCIDENT_CATEGORIES } from '@shared/accident';
import { accidentApi } from '@client/src/api';
import { SyntheticBadge } from '@client/src/components/SyntheticBadge';

import type { AccidentFilters } from './useAccidentStats';

export interface AccidentHeaderProps {
  years: number[];
  filters: AccidentFilters;
  setFilter: (patch: Partial<AccidentFilters>) => void;
  loading: boolean;
}

const SELECT_TRIGGER_CLASS =
  'h-8 w-full rounded-[2px] border-[#bfbfbf] bg-white text-[13px] text-[#1a1a1a]';

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All' },
  ...ACCIDENT_CATEGORIES.map((c: string) => ({ value: c, label: c })),
];

const QUARTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: '1', label: 'Q1' },
  { value: '2', label: 'Q2' },
  { value: '3', label: 'Q3' },
  { value: '4', label: 'Q4' },
];

const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All' },
  ...Array.from({ length: 12 }, (_: unknown, i: number) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

const AccidentHeader: React.FC<AccidentHeaderProps> = ({
  years,
  filters,
  setFilter,
  loading,
}) => {
  const yearDisabled = loading || years.length === 0;
  const [cutoff, setCutoff] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    accidentApi
      .fetchAccidentDataCutoff()
      .then((res) => {
        if (cancelled) return;
        setCutoff(res.month);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error(`Failed to load accident data cutoff: ${JSON.stringify(err)}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-[22px] font-bold leading-7 text-[#084078]">
          Accident
        </h1>
        <p className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
          Data up to {cutoff ?? '—'}
          <SyntheticBadge />
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex w-[200px] flex-col gap-1">
          <p className="text-[12px] text-[#605e5c]">Accident category</p>
          <Select
            value={filters.category}
            onValueChange={(v: string) => setFilter({ category: v })}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] flex-col gap-1">
          <p className="text-[12px] text-[#605e5c]">Year</p>
          <Select
            value={filters.year !== null ? String(filters.year) : ''}
            onValueChange={(v: string) => setFilter({ year: Number(v) })}
            disabled={yearDisabled}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Year" />
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

        <div className="flex w-[90px] flex-col gap-1">
          <p className="text-[12px] text-[#605e5c]">Quarter</p>
          <Select
            value={filters.quarter}
            onValueChange={(v: string) => setFilter({ quarter: v })}
            disabled={yearDisabled}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="All" />
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

        <div className="flex w-[90px] flex-col gap-1">
          <p className="text-[12px] text-[#605e5c]">Month</p>
          <Select
            value={filters.month}
            onValueChange={(v: string) => setFilter({ month: v })}
            disabled={yearDisabled}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="All" />
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
    </div>
  );
};

export default AccidentHeader;
