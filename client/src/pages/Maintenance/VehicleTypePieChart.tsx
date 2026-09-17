import React, { useEffect, useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { fmtInt } from '@client/src/utils/format';
import type { VehicleTypeCount } from '@shared/maintenance';

import { vehicleTypeColor, PANEL_BORDER, TEXT_COLOR } from './maintColors';

export interface VehicleTypePieChartProps {
  data: VehicleTypeCount[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const VehicleTypePieChart: React.FC<VehicleTypePieChartProps> = ({
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

  const total = useMemo(
    () => data.reduce((sum: number, item: VehicleTypeCount) => sum + item.count, 0),
    [data],
  );

  const pieRadius: number = Math.max(
    36,
    Math.min(chartSize.w, chartSize.h) * 0.3,
  );

  const option: EChartsOption = useMemo(() => {
    return {
      color: data.map((item: VehicleTypeCount) => vehicleTypeColor(item.vehicleType)),
      tooltip: {
        trigger: 'item',
        formatter: (p: CallbackDataParams) => {
          const val = Number(p.value);
          const pct = total > 0 ? ((val / total) * 100).toFixed(2) : '0.00';
          return `${p.marker} ${p.name}: ${fmtInt(val)} (${pct}%)`;
        },
      },
      series: [
        {
          type: 'pie',
          radius: pieRadius,
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          data: data.map((item: VehicleTypeCount) => ({
            name: item.vehicleType,
            value: item.count,
          })),
          label: {
            show: true,
            position: 'outside',
            fontSize: 12,
            lineHeight: 15,
            color: TEXT_COLOR,
            formatter: (p: CallbackDataParams) =>
              `${fmtInt(Number(p.value))}\n${Number(p.percent ?? 0).toFixed(2)}%`,
          },
          labelLine: { show: true, length: 10, length2: 6, lineStyle: { color: '#8c8c8c' } },
        },
      ],
    };
  }, [data, total, pieRadius]);

  const hasData = data.length > 0;

  return (
    <section
      className={`flex flex-col rounded-none border bg-white p-2 ${className}`}
      style={{ borderColor: PANEL_BORDER }}
    >
      <h2 className="text-[15px] font-semibold leading-5 text-[#1a1a1a]">
        Totals Maintenance Orders by Vehicle Type
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
          <p className="text-sm text-muted-foreground">No vehicle type data</p>
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
            <p className="text-center text-[11px] font-semibold text-[#404040]">
              Vehicle Type
            </p>
            <ul className="mt-0.5 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {data.map((item: VehicleTypeCount) => (
                <li key={item.vehicleType} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: vehicleTypeColor(item.vehicleType) }}
                  />
                  <span className="text-[12px] leading-4 text-[#252423]">
                    {item.vehicleType}
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

export default VehicleTypePieChart;
