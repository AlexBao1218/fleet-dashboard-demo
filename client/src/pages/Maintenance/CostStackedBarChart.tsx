import React, { useEffect, useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { Skeleton } from '@client/src/components/ui/skeleton';
import { Button } from '@client/src/components/ui/button';
import { fmtCompact2 } from '@client/src/utils/format';
import type { CostBreakdown } from '@shared/maintenance';

import {
  LABOR_COLOR,
  PARTS_COLOR,
  THIRD_PARTY_COLOR,
  TEXT_COLOR,
  GRID_COLOR,
  PANEL_BORDER,
} from './maintColors';

export interface CostStackedBarChartProps {
  data: CostBreakdown[];
  title: string;
  yAxisName: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

const BAR_THICKNESS = 22;
const BAR_GAP = 10;
const AXIS_INTERVAL = 500_000;
const SEGMENT_LABEL_MIN_PX = 48;
const LEFT_ZONE_PX = 110;
const RIGHT_ZONE_PX = 90;
const VERTICAL_CHROME_PX = 96;

function fmtSegmentMoney(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1_000)}K`;
}

function fmtAxisTick(value: number): string {
  if (value === 0) return '$0';
  const m = value / 1_000_000;
  return `$${Number.isInteger(m) ? String(m) : m.toFixed(1)}M`;
}

const CostStackedBarChart: React.FC<CostStackedBarChartProps> = ({
  data,
  title,
  yAxisName,
  loading,
  error,
  onRetry,
  className = '',
}) => {
  const [wrapEl, setWrapEl] = useState<HTMLDivElement | null>(null);
  const [plotWidth, setPlotWidth] = useState<number>(0);

  useEffect(() => {
    if (!wrapEl) return;
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;
      const usable = entry.contentRect.width - LEFT_ZONE_PX - RIGHT_ZONE_PX;
      setPlotWidth(Math.max(0, usable));
    });
    ro.observe(wrapEl);
    return () => ro.disconnect();
  }, [wrapEl]);

  const sorted = useMemo(
    () => [...data].sort((a: CostBreakdown, b: CostBreakdown) => b.total - a.total),
    [data],
  );

  const option: EChartsOption = useMemo(() => {
    const names = sorted.map((d: CostBreakdown) => d.group);
    const labor = sorted.map((d: CostBreakdown) => d.labor);
    const parts = sorted.map((d: CostBreakdown) => d.parts);
    const thirdParty = sorted.map((d: CostBreakdown) => d.thirdParty);
    const totals = sorted.map((d: CostBreakdown) => d.total);

    const maxTotal: number = totals.length > 0 ? Math.max(...totals) : 0;
    const niceMax: number =
      maxTotal > 0 ? Math.ceil(maxTotal / AXIS_INTERVAL) * AXIS_INTERVAL : AXIS_INTERVAL;
    const minLabelValue: number =
      plotWidth > 0 ? (SEGMENT_LABEL_MIN_PX / plotWidth) * niceMax : Number.POSITIVE_INFINITY;

    const segmentLabel = {
      show: true,
      position: 'inside' as const,
      fontSize: 12,
      color: '#ffffff',
      formatter: (p: CallbackDataParams) => {
        const v = Number(p.value);
        return v >= minLabelValue ? fmtSegmentMoney(v) : '';
      },
    };

    const separator = { borderColor: '#ffffff', borderWidth: 1 };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        textStyle: { color: TEXT_COLOR },
        extraCssText: 'box-shadow: none;',
        formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
          const list = Array.isArray(params) ? params : [params];
          const first = list[0];
          if (!first) return '';
          const idx = Number(first.dataIndex);
          const lines: string[] = [String(first.name)];
          for (const p of list) {
            if (p.seriesName === '_total') continue;
            lines.push(`${p.marker} ${p.seriesName}: $${fmtCompact2(Number(p.value))}`);
          }
          lines.push(`Total: $${fmtCompact2(totals[idx])}`);
          return lines.join('<br/>');
        },
      },
      legend: {
        top: 4,
        left: 8,
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        itemGap: 10,
        textStyle: { color: '#404040', fontSize: 11 },
        data: ['Sum of Labor Wages', 'Sum of Part cost', 'Sum of Third Party Cost'],
      },
      grid: {
        left: 8,
        right: RIGHT_ZONE_PX,
        bottom: 8,
        top: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Total of cost',
        nameLocation: 'middle',
        nameGap: 26,
        nameTextStyle: { color: '#404040', fontSize: 11 },
        min: 0,
        interval: AXIS_INTERVAL,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { type: 'dotted' as const, color: GRID_COLOR, width: 1 },
        },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 11,
          formatter: (v: number) => fmtAxisTick(v),
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        name: yAxisName,
        nameLocation: 'middle',
        nameRotate: 90,
        nameGap: 100,
        nameTextStyle: { color: TEXT_COLOR, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 11,
          width: 80,
          overflow: 'truncate' as const,
        },
      },
      series: [
        {
          name: 'Sum of Labor Wages',
          type: 'bar',
          stack: 'cost',
          barWidth: BAR_THICKNESS,
          barCategoryGap: BAR_GAP,
          itemStyle: { color: LABOR_COLOR, ...separator },
          data: labor,
          label: segmentLabel,
        },
        {
          name: 'Sum of Part cost',
          type: 'bar',
          stack: 'cost',
          barWidth: BAR_THICKNESS,
          itemStyle: { color: PARTS_COLOR, ...separator },
          data: parts,
          label: segmentLabel,
        },
        {
          name: 'Sum of Third Party Cost',
          type: 'bar',
          stack: 'cost',
          barWidth: BAR_THICKNESS,
          itemStyle: { color: THIRD_PARTY_COLOR, ...separator },
          data: thirdParty,
          label: segmentLabel,
        },
        {
          name: '_total',
          type: 'bar',
          stack: 'cost',
          barWidth: BAR_THICKNESS,
          itemStyle: { color: 'transparent' },
          data: totals.map(
            (t: number, i: number) => Math.max(0, t - (labor[i] + parts[i] + thirdParty[i])),
          ),
          tooltip: { show: false },
          label: {
            show: true,
            position: 'right',
            distance: 6,
            fontSize: 12,
            color: '#000000',
            formatter: (p: CallbackDataParams) => {
              const idx = Number(p.dataIndex);
              return `$${fmtCompact2(totals[idx])}`;
            },
          },
        },
      ],
    };
  }, [sorted, yAxisName, plotWidth]);

  const chartHeight: number = Math.max(
    160,
    sorted.length * (BAR_THICKNESS + BAR_GAP) + VERTICAL_CHROME_PX,
  );
  const hasData = data.length > 0;

  return (
    <section
      className={`flex flex-col rounded-none border bg-white p-2 ${className}`}
      style={{ borderColor: PANEL_BORDER }}
    >
      <h2 className="text-center text-[16px] font-semibold text-[#1a1a1a]">{title}</h2>
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
          <p className="text-sm text-muted-foreground">No cost data</p>
        </div>
      )}
      {!loading && !error && hasData && (
        <div className="mt-1" ref={setWrapEl} style={{ height: chartHeight }}>
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

export default CostStackedBarChart;
