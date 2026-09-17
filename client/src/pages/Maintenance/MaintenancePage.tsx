import React from 'react';

import { useMaintStats } from './useMaintStats';
import { MaintenanceHeaderLeft, MaintenanceHeaderRight } from './MaintenanceHeader';
import AvailabilityLineChart from './AvailabilityLineChart';
import DepotPieChart from './DepotPieChart';
import VehicleTypePieChart from './VehicleTypePieChart';
import ThirdPartyBarChart from './ThirdPartyBarChart';
import CostStackedBarChart from './CostStackedBarChart';

const MaintenancePage: React.FC = () => {
  const stats = useMaintStats();

  if (stats.loading && !stats.data) {
    return (
      <div className="flex min-h-full items-center justify-center bg-white p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (stats.error && !stats.data) {
    return (
      <div className="flex min-h-full items-center justify-center bg-white p-6">
        <p className="text-sm text-destructive">{stats.error}</p>
      </div>
    );
  }

  const d = stats.data;
  const loading = stats.loading;
  const error = stats.error;
  const retry = stats.retry;

  return (
    <div className="min-h-full bg-white p-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[57fr_43fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <MaintenanceHeaderLeft
            vehicleType={stats.vehicleType}
            avgAvailability={d?.avgAvailability ?? null}
            onVehicleTypeChange={stats.setVehicleType}
          />

          <AvailabilityLineChart
            className="h-[280px]"
            data={d?.availabilitySeries ?? []}
            loading={loading}
            error={error}
            onRetry={retry}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[42fr_58fr]">
            <div className="flex min-w-0 flex-col gap-3">
              <DepotPieChart
                className="h-[280px]"
                data={d?.depotCounts ?? []}
                loading={loading}
                error={error}
                onRetry={retry}
              />
              <VehicleTypePieChart
                className="h-[340px]"
                data={d?.vehicleTypeCounts ?? []}
                loading={loading}
                error={error}
                onRetry={retry}
              />
            </div>
            <ThirdPartyBarChart
              className="h-[402px] md:h-auto"
              data={d?.thirdPartyCosts ?? []}
              loading={loading}
              error={error}
              onRetry={retry}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <MaintenanceHeaderRight
            year={stats.year}
            quarter={stats.quarter}
            month={stats.month}
            totalOrders={d?.totalOrders ?? 0}
            totalCost={d?.totalCost ?? 0}
            onYearChange={stats.setYear}
            onQuarterChange={stats.setQuarter}
            onMonthChange={stats.setMonth}
          />

          <CostStackedBarChart
            className=""
            data={d?.costByOrderType ?? []}
            title="Cost of Maintenance Order"
            yAxisName="Order_Type"
            loading={loading}
            error={error}
            onRetry={retry}
          />
          <CostStackedBarChart
            className=""
            data={d?.costByVehicleType ?? []}
            title="Cost of Maintenance Order by Vehicle Type"
            yAxisName="Vehicle Type"
            loading={loading}
            error={error}
            onRetry={retry}
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
