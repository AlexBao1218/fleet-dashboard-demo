import React, { useEffect, useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { fmtInt } from '@client/src/utils/format';
import { ACCIDENT_CATEGORIES } from '@shared/accident';
import type { AccidentCategoryCount } from '@shared/accident';

import {
  CATEGORY_COLORS,
  PANEL_BORDER,
  TEXT_COLOR,
} from './accidentColors';

const INSIDE_LABEL_MIN_PERCENT = 5;

export interface TotalAccidentsPieProps {
  data: AccidentCategoryCount[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const TotalAccidentsPie: React.FC<TotalAccidentsPieProps> = ({
  data,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!chartEl) return;
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const rect = entries[0]?.contentRect;
      if (rect) setChartSize({ w: rect.width, h: rect.height });
    });
    ro.observe(chartEl);
    return () => ro.disconnect();
  }, [chartEl]);

  const orderedData: AccidentCategoryCount[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.category, item.count);
    }
    return ACCIDENT_CATEGORIES.map((cat: string) => ({
      category: cat as AccidentCategoryCount['category'],
      count: map.get(cat) ?? 0,
    })).filter((item: AccidentCategoryCount) => item.count > 0);
  }, [data]);

  const total: number = useMemo(
    () => orderedData.reduce((sum: number, item: AccidentCategoryCount) => sum + item.count, 0),
    [orderedData],
  );

  const pieRadius: number = Math.max(
    36,
    Math.min(chartSize.w * 0.35, chartSize.h * 0.38),
  );

  const option: EChartsOption = useMemo(() => {
    return {
      color: orderedData.map(
        (item: AccidentCategoryCount) => CATEGORY_COLORS[item.category] ?? '#7f7f7f',
      ),
      tooltip: {
        trigger: 'item',
        formatter: (p: CallbackDataParams) =>
          `${p.marker} ${p.name}: ${fmtInt(Number(p.value))} (${Number(p.percent ?? 0).toFixed(2)}%)`,
      },
      series: [
        {
          type: 'pie',
          radius: pieRadius,
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          data: orderedData.map((item: AccidentCategoryCount) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            const inside = pct >= INSIDE_LABEL_MIN_PERCENT;
            return {
              name: item.category,
              value: item.count,
              label: inside
                ? {
                    show: true,
                    position: 'inside' as const,
                    color: '#ffffff',
                    fontSize: 12,
                    lineHeight: 15,
                    formatter: (p: CallbackDataParams) =>
                      `${fmtInt(Number(p.value))} (${Number(p.percent ?? 0).toFixed(2)}%)`,
                  }
                : {
                    show: true,
                    position: 'outside' as const,
                    fontSize: 12,
                    lineHeight: 15,
                    formatter: (p: CallbackDataParams) =>
                      `${fmtInt(Number(p.value))} (${Number(p.percent ?? 0).toFixed(2)}%)`,
                  },
            };
          }),
          label: {
            show: true,
            position: 'outside',
            fontSize: 12,
            lineHeight: 15,
            formatter: (p: CallbackDataParams) =>
              `${fmtInt(Number(p.value))} (${Number(p.percent ?? 0).toFixed(2)}%)`,
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 6,
            lineStyle: { color: '#8c8c8c' },
          },
        },
      ],
    };
  }, [orderedData, pieRadius, total]);

  const hasData = orderedData.length > 0;

  return (
    <section
      className={`flex flex-col rounded-none border bg-white p-2 ${className}`}
      style={{ borderColor: PANEL_BORDER }}
    >
      <h2 className="text-[15px] font-semibold text-[#1a1a1a]">
        Total of Accidents
      </h2>
      {loading && <Skeleton className="mt-3 min-h-0 flex-1 w-full" />}
      {!loading && error && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && !hasData && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">暂无事故数据</p>
        </div>
      )}
      {!loading && !error && hasData && (
        <div className="mt-1 flex min-h-0 flex-1 flex-col">
          <div ref={setChartEl} className="min-h-[260px] w-full flex-1">
            <ReactECharts
              option={option}
              theme="ud"
              style={{ height: '100%', width: '100%' }}
              notMerge
            />
          </div>
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-[12px] font-semibold text-[#252423]">
              Accident category
            </p>
            {ACCIDENT_CATEGORIES.map((cat: string) => {
              const found = orderedData.find(
                (item: AccidentCategoryCount) => item.category === cat,
              );
              const hasCount = (found?.count ?? 0) > 0;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[cat] ?? '#7f7f7f',
                      opacity: hasCount ? 1 : 0.3,
                    }}
                  />
                  <span
                    className="text-[12px] leading-4"
                    style={{
                      color: hasCount ? TEXT_COLOR : '#a19f9d',
                    }}
                  >
                    {cat}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default TotalAccidentsPie;
