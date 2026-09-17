import React, { useEffect, useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import type { FuelCostByClassItem } from '@shared/dashboard';

import { fmtNumber } from '@client/src/utils/format';
import { vehClassColor } from './vehClassColors';

const INSIDE_LABEL_MIN_PERCENT = 5;

export interface CostByTypePieProps {
  data: FuelCostByClassItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const CostByTypePie: React.FC<CostByTypePieProps> = ({
  data,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  useEffect(() => {
    if (!chartEl) return;
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const rect = entries[0]?.contentRect;
      if (rect) setChartSize({ w: rect.width, h: rect.height });
    });
    ro.observe(chartEl);
    return () => ro.disconnect();
  }, [chartEl]);

  const pieRadius: number = Math.max(
    36,
    Math.min(chartSize.w, chartSize.h) * 0.3,
  );

  const total: number = useMemo(
    () => data.reduce((sum: number, item: FuelCostByClassItem) => sum + item.costHkd, 0),
    [data],
  );

  const option: EChartsOption = useMemo(() => {
    return {
      color: data.map((item: FuelCostByClassItem) =>
        vehClassColor(item.vehClass),
      ),
      tooltip: {
        trigger: 'item',
        formatter: (p: CallbackDataParams) =>
          `${p.marker} ${p.name}: HKD ${fmtNumber(Number(p.value), 2)} (${Number(p.percent ?? 0).toFixed(2)}%)`,
      },
      series: [
        {
          type: 'pie',
          radius: pieRadius,
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          data: data.map((item: FuelCostByClassItem) => {
            const pct = total > 0 ? (item.costHkd / total) * 100 : 0;
            const inside = pct >= INSIDE_LABEL_MIN_PERCENT;
            const amountM = (item.costHkd / 1_000_000).toFixed(2);
            const pctStr = pct.toFixed(1);
            return {
              name: item.vehClass,
              value: item.costHkd,
              label: {
                show: true,
                position: inside ? ('inside' as const) : ('outside' as const),
                color: inside ? '#ffffff' : '#252423',
                fontSize: 12,
                lineHeight: 16,
                formatter: `HKD ${amountM}M\n${pctStr}%`,
              },
              labelLine: {
                show: !inside,
                length: 10,
                length2: 6,
                lineStyle: { color: '#8c8c8c' },
              },
            };
          }),
          labelLine: {
            show: true,
            length: 10,
            length2: 6,
            lineStyle: { color: '#8c8c8c' },
          },
        },
      ],
    };
  }, [data, pieRadius, total]);

  const hasData = data.length > 0;

  return (
    <section
      className={`flex flex-col rounded-[2px] border border-[#d9d9d9] bg-white p-4 ${className}`}
    >
      <h2 className="text-[13px] font-medium text-[#252423]">
        Total HKD by Vehicle Type
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
          <p className="text-sm text-muted-foreground">
            No fuel cost data for this selection
          </p>
        </div>
      )}
      {!loading && !error && hasData && (
        <div className="mt-1 flex min-h-0 flex-1 flex-col">
          <div ref={setChartEl} className="min-h-0 w-full flex-1">
            <ReactECharts
              option={option}
              theme="ud"
              style={{ height: '100%', width: '100%' }}
              notMerge
            />
          </div>
          <div className="mt-1">
            <p className="text-center text-[11px] font-medium text-[#404040]">
              Veh. Type
            </p>
            <ul className="mt-0.5 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {data.map((item: FuelCostByClassItem) => (
                <li key={item.vehClass} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: vehClassColor(item.vehClass) }}
                  />
                  <span className="text-[13px] leading-4 text-[#252423]">
                    {item.vehClass}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default CostByTypePie;
