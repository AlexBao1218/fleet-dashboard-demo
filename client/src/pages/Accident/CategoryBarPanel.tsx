import React, { useMemo } from 'react';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { ACCIDENT_CATEGORIES } from '@shared/accident';
import type { AccidentMonthlyCount } from '@shared/accident';

import CategoryMonthBar from './CategoryMonthBar';
import {
  PANEL_BORDER,
  CUR_YEAR_COLOR,
  PREV_YEAR_COLOR,
} from './accidentColors';

export interface CategoryBarPanelProps {
  data: AccidentMonthlyCount[];
  category: string;
  year: number | null;
  quarter: string;
  month: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

function ceilToEven(n: number): number {
  return n % 2 === 0 ? n : n + 1;
}

const CategoryBarPanel: React.FC<CategoryBarPanelProps> = ({
  data,
  category,
  year,
  quarter,
  month,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const prevYear = year !== null ? year - 1 : 0;
  const curYear = year ?? 0;

  const categories: string[] = useMemo(() => {
    if (category === 'All') return [...ACCIDENT_CATEGORIES];
    return [category];
  }, [category]);

  const yAxisMax: number = useMemo(() => {
    let max = 0;
    for (const b of data) {
      if (!categories.includes(b.category)) continue;
      if (b.year !== prevYear && b.year !== curYear) continue;
      if (quarter !== 'All') {
        const q = Number(quarter);
        const start = (q - 1) * 3 + 1;
        const end = start + 2;
        if (b.month < start || b.month > end) continue;
      }
      if (month !== 'All' && b.month !== Number(month)) continue;
      if (b.count > max) max = b.count;
    }
    return Math.max(10, ceilToEven(max));
  }, [data, categories, prevYear, curYear, quarter, month]);

  const yAxisInterval: number =
    yAxisMax <= 12 ? 2 : Math.ceil(yAxisMax / 6 / 2) * 2;

  const enlarged = category !== 'All';

  return (
    <section
      className={`flex flex-col rounded-none border bg-white p-2 ${className}`}
      style={{ borderColor: PANEL_BORDER }}
    >
      <h2 className="text-[15px] font-semibold text-[#1a1a1a]">
        Count of Accidents by Accident category
      </h2>
      <div className="mt-1 flex items-center gap-4 text-[12px] text-[#252423]">
        <span className="text-[#605e5c]">Year</span>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: PREV_YEAR_COLOR }}
          />
          <span>{prevYear}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: CUR_YEAR_COLOR }}
          />
          <span>{curYear}</span>
        </div>
      </div>

      {loading && (
        <div className="mt-2 min-h-0 flex-1">
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}
      {!loading && error && (
        <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && year !== null && (
        <div className="mt-2 min-h-0 flex-1">
          {enlarged ? (
            <div className="flex h-full flex-col">
              <p className="text-[14px] font-semibold text-[#252423]">
                {categories[0]}
              </p>
              <CategoryMonthBar
                category={categories[0]}
                prevYear={prevYear}
                curYear={curYear}
                bars={data}
                yAxisMax={yAxisMax}
                yAxisInterval={yAxisInterval}
                height="min-h-[320px] flex-1"
                quarter={quarter}
                month={month}
              />
            </div>
          ) : (
            <div
              className="grid h-full grid-cols-2 gap-px border"
              style={{ borderColor: PANEL_BORDER, backgroundColor: PANEL_BORDER }}
            >
              {categories.map((cat: string) => (
                <div key={cat} className="flex flex-col bg-white p-2">
                  <p className="text-[14px] font-semibold text-[#252423]">
                    {cat}
                  </p>
                  <CategoryMonthBar
                    category={cat}
                    prevYear={prevYear}
                    curYear={curYear}
                    bars={data}
                    yAxisMax={yAxisMax}
                    yAxisInterval={yAxisInterval}
                    height="min-h-[240px] flex-1"
                    quarter={quarter}
                    month={month}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CategoryBarPanel;
