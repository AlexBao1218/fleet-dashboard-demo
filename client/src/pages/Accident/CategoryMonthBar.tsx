import React, { useMemo } from 'react';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams, TopLevelFormatterParams } from 'echarts/types/dist/shared';

import type { AccidentMonthlyCount } from '@shared/accident';

import {
  CUR_YEAR_COLOR,
  MONTH_ABBR,
  PREV_YEAR_COLOR,
} from './accidentColors';

export interface CategoryMonthBarProps {
  category: string;
  prevYear: number;
  curYear: number;
  bars: AccidentMonthlyCount[];
  yAxisMax: number;
  yAxisInterval: number;
  height: string;
  quarter: string;
  month: string;
}

const CategoryMonthBar: React.FC<CategoryMonthBarProps> = ({
  category,
  prevYear,
  curYear,
  bars,
  yAxisMax,
  yAxisInterval,
  height,
  quarter,
  month,
}) => {
  const visibleMonths: number[] = useMemo(() => {
    if (month !== 'All') {
      const m = Number(month);
      return [m];
    }
    if (quarter !== 'All') {
      const q = Number(quarter);
      const start = (q - 1) * 3 + 1;
      return [start, start + 1, start + 2];
    }
    return Array.from({ length: 12 }, (_: unknown, i: number) => i + 1);
  }, [quarter, month]);

  const monthLabels: string[] = visibleMonths.map(
    (m: number) => MONTH_ABBR[m - 1],
  );

  const prevData: number[] = visibleMonths.map((m: number) => {
    const found = bars.find(
      (b: AccidentMonthlyCount) =>
        b.category === category && b.year === prevYear && b.month === m,
    );
    return found?.count ?? 0;
  });

  const curData: number[] = visibleMonths.map((m: number) => {
    const found = bars.find(
      (b: AccidentMonthlyCount) =>
        b.category === category && b.year === curYear && b.month === m,
    );
    return found?.count ?? 0;
  });

  const option: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: TopLevelFormatterParams) => {
          if (!Array.isArray(params)) return '';
          const lines = params.map((p: CallbackDataParams) => {
            const seriesName = p.seriesName ?? '';
            const val = Number(p.value ?? 0);
            return `${seriesName}年${p.name}：${val} 宗`;
          });
          return lines.join('<br/>');
        },
      },
      xAxis: {
        type: 'category',
        data: monthLabels,
        boundaryGap: true,
        axisLabel: { interval: 0, hideOverlap: false, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisMax,
        interval: yAxisInterval,
        axisLabel: { fontSize: 11 },
        splitLine: {
          lineStyle: { type: 'dotted', color: '#bfbfbf' },
        },
      },
      series: [
        {
          name: String(prevYear),
          type: 'bar',
          z: 3,
          data: prevData,
          itemStyle: { color: PREV_YEAR_COLOR },
          barWidth: 14,
          barGap: '14%',
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            formatter: (p: CallbackDataParams) =>
              Number(p.value) === 0 ? '' : String(p.value),
          },
        },
        {
          name: String(curYear),
          type: 'bar',
          z: 3,
          data: curData,
          itemStyle: { color: CUR_YEAR_COLOR },
          barWidth: 14,
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            formatter: (p: CallbackDataParams) =>
              Number(p.value) === 0 ? '' : String(p.value),
          },
        },
      ],
      grid: {
        left: 36,
        right: 8,
        top: 24,
        bottom: 24,
      },
    };
  }, [monthLabels, prevData, curData, yAxisMax, yAxisInterval, prevYear, curYear]);

  return (
    <div className={height}>
      <ReactECharts
        option={option}
        theme="ud"
        style={{ height: '100%', width: '100%' }}
        notMerge
      />
    </div>
  );
};

export default CategoryMonthBar;
