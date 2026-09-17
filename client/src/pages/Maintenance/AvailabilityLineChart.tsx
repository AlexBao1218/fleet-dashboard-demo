import React, { useMemo } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import type { AvailabilityPoint } from '@shared/maintenance';

import { AVAIL_LINE_COLOR, AVAIL_BASELINE_COLOR, GRID_COLOR, TEXT_COLOR, PANEL_BORDER } from './maintColors';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface AvailabilityLineChartProps {
  data: AvailabilityPoint[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const AvailabilityLineChart: React.FC<AvailabilityLineChartProps> = ({
  data,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const option: EChartsOption = useMemo(() => {
    const seriesData: (number | null)[] = Array(12).fill(null);
    for (const pt of data) {
      const idx = pt.month - 1;
      if (idx >= 0 && idx < 12) seriesData[idx] = pt.pct;
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: '#ffffff',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        textStyle: { color: TEXT_COLOR },
        extraCssText: 'box-shadow: none;',
        formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
          const list = Array.isArray(params) ? params : [params];
          const first = list[0];
          if (!first) return '';
          const val = first.value;
          if (val === null || val === undefined) return String(first.name);
          return `${first.name}<br/>${Number(val).toFixed(2)}%`;
        },
      },
      grid: {
        left: 8,
        right: 16,
        bottom: 8,
        top: 24,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: MONTH_LABELS,
        boundaryGap: false,
        name: 'Month',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { color: TEXT_COLOR, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: TEXT_COLOR, fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        min: 80,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { type: 'dotted' as const, color: '#808080', width: 1 },
        },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 12,
          formatter: (v: number) => `${v}%`,
        },
      },
      series: [
        {
          name: 'Availability',
          type: 'line',
          data: seriesData,
          connectNulls: false,
          smooth: false,
          lineStyle: { width: 2, color: AVAIL_LINE_COLOR },
          itemStyle: { color: AVAIL_LINE_COLOR },
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            position: 'top',
            color: AVAIL_LINE_COLOR,
            fontSize: 11,
            fontWeight: 600,
            formatter: (p: CallbackDataParams) => {
              if (p.value === null || p.value === undefined) return '';
              return `${Number(p.value).toFixed(2)}%`;
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: AVAIL_BASELINE_COLOR, width: 2.5, type: 'solid' as const },
            data: [{ yAxis: 90, label: { show: false } }],
          },
        },
      ],
    };
  }, [data]);

  const hasData = data.length > 0;

  return (
    <section
      className={`flex flex-col rounded-none border bg-white p-2 ${className}`}
      style={{ borderColor: PANEL_BORDER }}
    >
      <h2 className="text-center text-[16px] font-semibold text-[#1a1a1a]">Availability %</h2>
      {loading && <Skeleton className="mt-2 min-h-0 flex-1 w-full" />}
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
          <p className="text-sm text-muted-foreground">No availability data</p>
        </div>
      )}
      {!loading && !error && hasData && (
        <div className="mt-1 min-h-0 flex-1">
          <ReactECharts
            option={option}
            theme="ud"
            style={{ height: '100%', width: '100%' }}
            notMerge
          />
        </div>
      )}
    </section>
  );
};

export default AvailabilityLineChart;
