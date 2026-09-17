import React, { useMemo } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { TopLevelFormatterParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import type { FuelMonthlyPoint } from '@shared/dashboard';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const DIESEL_COLOR = '#4a9195';
const PETROL_COLOR = '#23adeb';
const TEXT_COLOR = '#252423';
const GRID_COLOR = '#bfbfbf';

export interface FuelConsumptionLineChartProps {
  data: FuelMonthlyPoint[];
  year: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const FuelConsumptionLineChart: React.FC<FuelConsumptionLineChartProps> = ({
  data,
  year,
  loading,
  error,
  onRetry,
}) => {
  const option: EChartsOption = useMemo(() => {
    const petrolData: (number | null)[] = Array(12).fill(null) as (number | null)[];
    const dieselData: (number | null)[] = Array(12).fill(null) as (number | null)[];
    for (const pt of data) {
      const idx = pt.month - 1;
      if (idx >= 0 && idx < 12) {
        petrolData[idx] = pt.petrolLitres;
        dieselData[idx] = pt.dieselLitres;
      }
    }

    const xLabels: string[] = MONTH_LABELS.map(
      (m: string) => `${m} ${year ?? ''}`.trim(),
    );

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: '#ffffff',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        textStyle: { color: TEXT_COLOR },
        extraCssText: 'box-shadow: none;',
        formatter: (params: TopLevelFormatterParams) => {
          const list = Array.isArray(params) ? params : [params];
          const monthName = list[0]?.name ?? '';
          const lines = list
            .filter((p) => p.value !== null && p.value !== undefined)
            .map(
              (p) =>
                `${p.marker} ${Number(p.value).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} L ${p.seriesName}`,
            );
          if (lines.length === 0) return monthName;
          return `${monthName}<br/>${lines.join('<br/>')}`;
        },
      },
      legend: {
        top: 0,
        left: 0,
        itemWidth: 14,
        itemHeight: 8,
        data: ['Diesel', 'Petrol'],
        textStyle: { color: TEXT_COLOR, fontSize: 13 },
      },
      grid: {
        left: '2%',
        right: '3%',
        bottom: '4%',
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: false,
        axisLine: { lineStyle: { color: GRID_COLOR } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 12,
          interval: 2,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { type: 'dotted' as const, color: GRID_COLOR, width: 1 },
        },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 12,
          formatter: (value: number) =>
            value >= 1000 ? `${Math.round(value / 1000)}K` : String(value),
        },
      },
      series: [
        {
          name: 'Diesel',
          type: 'line',
          data: dieselData,
          connectNulls: false,
          smooth: false,
          lineStyle: { width: 2, color: DIESEL_COLOR },
          itemStyle: { color: DIESEL_COLOR },
          symbol: 'circle',
          symbolSize: 8,
        },
        {
          name: 'Petrol',
          type: 'line',
          data: petrolData,
          connectNulls: false,
          smooth: false,
          lineStyle: { width: 2, color: PETROL_COLOR },
          itemStyle: { color: PETROL_COLOR },
          symbol: 'circle',
          symbolSize: 8,
        },
      ],
    };
  }, [data, year]);

  const hasData = data.length > 0;

  return (
    <section className="flex h-[376px] flex-col rounded-[2px] border border-[#cfe3e2] bg-[#ecf5f4] p-4">
      <h2 className="text-[13px] font-medium text-[#252423]">
        Fuel Consumption (L)
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
          <p className="text-sm text-muted-foreground">
            No fuel transactions for this selection
          </p>
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

export default FuelConsumptionLineChart;
