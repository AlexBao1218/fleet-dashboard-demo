import React from 'react';

import { useAccidentStats } from './useAccidentStats';
import AccidentHeader from './AccidentHeader';
import TotalAccidentsPie from './TotalAccidentsPie';
import CategoryBarPanel from './CategoryBarPanel';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';

const AccidentPage: React.FC = () => {
  const { years, filters, setFilter, stats, loading, error, retry } =
    useAccidentStats();

  const hasYears = years.length > 0;

  if (!loading && !hasYears && !error) {
    return (
      <div className="flex min-h-full items-center justify-center bg-white p-6">
        <p className="text-sm text-muted-foreground">
          暂无事故数据，请先在 Upload Center 上传 Accident BI.xlsx
        </p>
      </div>
    );
  }

  if (error && !stats && !hasYears) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-white p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white p-6">
      <div className="flex flex-col gap-4">
        <AccidentHeader
          years={years}
          filters={filters}
          setFilter={setFilter}
          loading={loading}
        />

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[28fr_72fr]">
          {loading && !stats ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <TotalAccidentsPie
              className="h-full min-h-[520px]"
              data={stats?.pie ?? []}
              loading={loading}
              error={error}
              onRetry={retry}
            />
          )}
          {loading && !stats ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <CategoryBarPanel
              className="h-full min-h-[520px]"
              data={stats?.bars ?? []}
              category={filters.category}
              year={filters.year}
              quarter={filters.quarter}
              month={filters.month}
              loading={loading}
              error={error}
              onRetry={retry}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccidentPage;
