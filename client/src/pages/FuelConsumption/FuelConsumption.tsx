import React from 'react';

import { useFleetOverview } from './useFleetOverview';
import { useFuelStats } from './useFuelStats';
import { useFuelEfficiency } from './useFuelEfficiency';
import { useEvStats } from './useEvStats';
import { useMakeModelOptions } from './useMakeModelOptions';
import DashboardHeader from './DashboardHeader';
import TypeDistributionPie from './TypeDistributionPie';
import CostByTypePie from './CostByTypePie';
import FuelConsumptionLineChart from './FuelConsumptionLineChart';
import EvConsumptionLineChart from './EvConsumptionLineChart';
import StatsCardGrid from './StatsCardGrid';

const FuelConsumption: React.FC = () => {
  const fleet = useFleetOverview();
  const fuelStats = useFuelStats();
  const makeModelOpts = useMakeModelOptions(fuelStats.vehClass);
  const efficiency = useFuelEfficiency(
    fuelStats.year,
    fuelStats.month,
    fuelStats.vehClass,
    fuelStats.makeModel,
  );
  const evStats = useEvStats(fuelStats.year, fuelStats.month);

  const statsLoading: boolean =
    fuelStats.statsLoading || efficiency.loading || evStats.loading;
  const statsError: string | null =
    fuelStats.statsError || efficiency.error || evStats.error;
  const handleStatsRetry = (): void => {
    fuelStats.retry();
    efficiency.retry();
    evStats.retry();
  };

  return (
    <div className="min-h-full bg-white p-6">
      <DashboardHeader
        years={fuelStats.years}
        year={fuelStats.year}
        month={fuelStats.month}
        vehClass={fuelStats.vehClass}
        makeModel={fuelStats.makeModel}
        makeModelOptions={makeModelOpts.options}
        makeModelOptionsLoading={makeModelOpts.loading}
        yearsLoading={fuelStats.yearsLoading}
        onYearChange={fuelStats.setYear}
        onMonthChange={fuelStats.setMonth}
        onVehClassChange={fuelStats.setVehClass}
        onMakeModelChange={fuelStats.setMakeModel}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[3fr_7fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <TypeDistributionPie
            className="h-[376px] lg:flex-1 xl:h-[376px] xl:flex-none"
            data={fleet.data?.classDistribution ?? []}
            loading={fleet.loading}
            error={fleet.error}
            onRetry={() => {
              void fleet.refresh();
            }}
          />
          <CostByTypePie
            className="h-[324.5px] lg:flex-1 xl:h-[324.5px] xl:flex-none"
            data={fuelStats.costByClass}
            loading={fuelStats.statsLoading}
            error={fuelStats.statsError}
            onRetry={fuelStats.retry}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <FuelConsumptionLineChart
              data={fuelStats.monthly}
              year={fuelStats.year}
              loading={fuelStats.statsLoading}
              error={fuelStats.statsError}
              onRetry={fuelStats.retry}
            />
            <EvConsumptionLineChart
              data={evStats.data?.monthly ?? []}
              year={fuelStats.year}
              loading={evStats.loading}
              error={evStats.error}
              onRetry={evStats.retry}
            />
          </div>
          <StatsCardGrid
            fuelTotals={fuelStats.totals}
            efficiency={efficiency.data}
            evData={evStats.data}
            year={fuelStats.year}
            loading={statsLoading}
            error={statsError}
            onRetry={handleStatsRetry}
          />
        </div>
      </div>
    </div>
  );
};

export default FuelConsumption;
