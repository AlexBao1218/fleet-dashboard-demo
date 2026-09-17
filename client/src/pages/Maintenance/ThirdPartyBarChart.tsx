import React, { useMemo } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { fmtInt, fmtNumber } from '@client/src/utils/format';
import { REDACTED_LABEL } from '@/lib/brand';
import type { ThirdPartyCost } from '@shared/maintenance';

import { THIRD_PARTY_BAR_COLOR, TEXT_COLOR, GRID_COLOR, PANEL_BORDER } from './maintColors';

export interface ThirdPartyBarChartProps {
  data: ThirdPartyCost[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const ThirdPartyBarChart: React.FC<ThirdPartyBarChartProps> = ({
  data,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const option: EChartsOption = useMemo(() => {
    const sorted = [...data].sort(
      (a: ThirdPartyCost, b: ThirdPartyCost) => b.cost - a.cost,
    );
    // Vendor names are withheld: the axis shows the rank and a grey bar,
    // the tooltip says so, and the cost keeps its place in the ranking.
    const names = sorted.map((_: ThirdPartyCost, i: number) => `#${i + 1}`);
    const values = sorted.map((d: ThirdPartyCost) => d.cost);
    // Axis scales with the data: four ticks, rounded up to a clean $K step.
    const maxValue: number = values.length > 0 ? Math.max(...values) : 0;
    const step: number = Math.max(10_000, Math.ceil(maxValue / 4 / 10_000) * 10_000);
    const axisMax: number = step * 4;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: CallbackDataParams) =>
          `${p.name} · ${REDACTED_LABEL}<br/>$${fmtNumber(Number(p.value), 2)}`,
      },
      grid: {
        left: 8,
        right: 90,
        bottom: 8,
        top: 8,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: axisMax,
        interval: step,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { type: 'dotted' as const, color: GRID_COLOR, width: 1 },
        },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 11,
          formatter: (v: number) => (v === 0 ? '$0' : `$${v / 1000}K`),
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 11,
          formatter: (value: string) => `${value} {bar|}`,
          rich: {
            bar: {
              backgroundColor: '#e4e3df',
              width: 52,
              height: 11,
              borderRadius: 2,
              verticalAlign: 'middle',
            },
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          barMaxWidth: 16,
          itemStyle: { color: THIRD_PARTY_BAR_COLOR, borderRadius: [0, 2, 2, 0] },
          label: {
            show: true,
            position: 'right',
            color: TEXT_COLOR,
            fontSize: 11,
            formatter: (p: CallbackDataParams) => `$${fmtInt(Number(p.value))}`,
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
      <h2 className="text-center text-[15px] font-semibold text-[#1a1a1a]">
        Third-Party Cost by Vendor
      </h2>
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
          <p className="text-sm text-muted-foreground">No third-party data</p>
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

export default ThirdPartyBarChart;
