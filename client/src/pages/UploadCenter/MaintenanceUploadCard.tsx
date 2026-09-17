import {
  uploadAvailabilityHistory,
  uploadWorkshopManpower,
  uploadWorkshopOrders,
  uploadWorkshopParts,
  uploadWorkshopThirdParty,
} from '@client/src/api/maintenance';
import type { WorkshopUploadRequest, WorkshopUploadResponse } from '@shared/maintenance';

import MaintenanceFileSlot from './MaintenanceFileSlot';

export interface MaintenanceUploadCardProps {
  onUploaded: () => Promise<void>;
}

interface SlotConfig {
  slotLabel: string;
  expectedFileName: string;
  targetTable: string;
  uploadFn: (body: WorkshopUploadRequest) => Promise<WorkshopUploadResponse>;
}

const MAINTENANCE_SLOTS: SlotConfig[] = [
  {
    slotLabel: 'Orders',
    expectedFileName: 'Maintenance_Order.csv',
    targetTable: 'maint_order',
    uploadFn: uploadWorkshopOrders,
  },
  {
    slotLabel: 'Manpower',
    expectedFileName: 'ManPower.csv',
    targetTable: 'maint_manpower',
    uploadFn: uploadWorkshopManpower,
  },
  {
    slotLabel: 'Parts',
    expectedFileName: 'Part_Usage.csv',
    targetTable: 'maint_part',
    uploadFn: uploadWorkshopParts,
  },
  {
    slotLabel: 'Third Party',
    expectedFileName: 'ThirdPartyCost.csv',
    targetTable: 'maint_third_party',
    uploadFn: uploadWorkshopThirdParty,
  },
  {
    slotLabel: 'Availability history',
    expectedFileName: 'availability_history.csv',
    targetTable: 'availability_month',
    uploadFn: uploadAvailabilityHistory,
  },
];

const MAINTENANCE_HINT =
  '上传 维修系统导出的 4 份 CSV 和 Availability 历史。每份都是全周期导出，直接整份上传即可，同一订单会被覆盖。可以一次传多份，也可以只传其中几份。';

const MaintenanceUploadCard = ({ onUploaded }: MaintenanceUploadCardProps) => {
  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Maintenance (Workshop)
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {MAINTENANCE_SLOTS.map((slot: SlotConfig) => (
          <MaintenanceFileSlot
            key={slot.slotLabel}
            slotLabel={slot.slotLabel}
            expectedFileName={slot.expectedFileName}
            targetTable={slot.targetTable}
            uploadFn={slot.uploadFn}
            onUploaded={onUploaded}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{MAINTENANCE_HINT}</p>
    </section>
  );
};

export default MaintenanceUploadCard;
