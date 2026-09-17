import React, { useEffect, useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { fmtInt } from '@client/src/utils/format';
import type { FleetClassDistributionItem } from '@shared/dashboard';

import { vehClassColor } from './vehClassColors';

export interface TypeDistributionPieProps {
  data: FleetClassDistributionItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const TypeDistributionPie: React.FC<TypeDistributionPieProps> = ({
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

  const pieRadius: number = Math.max(
    36,
    Math.min(chartSize.w, chartSize.h) * 0.3,
  );

  const option: EChartsOption = useMemo(() => {
    return {
      color: data.map((item: FleetClassDistributionItem) =>
        vehClassColor(item.vehClass),
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
          data: data.map((item: FleetClassDistributionItem) => ({
            name: item.vehClass,
            value: item.count,
          })),
          label: {
            show: true,
            position: 'outside',
            fontSize: 12,
            lineHeight: 15,
            color: '#252423',
            formatter: (p: CallbackDataParams) =>
              `${fmtInt(Number(p.value))}\n${Number(p.percent ?? 0).toFixed(2)}%`,
          },
          labelLine: { show: true, length: 10, length2: 6, lineStyle: { color: '#8c8c8c' } },
        },
      ],
    };
  }, [data, pieRadius]);

  const hasData = data.length > 0;

  return (
    <section
      className={`flex flex-col rounded-[2px] border border-[#d9d9d9] bg-white p-4 ${className}`}
    >
      <h2 className="text-[13px] font-medium text-[#252423]">
        Vehicles Type Distribution
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
          <p className="text-sm text-muted-foreground">No vehicle data</p>
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
          <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {data.map((item: FleetClassDistributionItem) => (
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
      )}
    </section>
  );
};

export default TypeDistributionPie;
