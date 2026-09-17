import type { ComponentType } from 'react';

import { Accordion } from '@client/src/components/ui/accordion';

import AccidentUploadCard from '../UploadCenter/AccidentUploadCard';
import FuelCardUploadCard from '../UploadCenter/FuelCardUploadCard';
import ElogbookUploadCard from '../UploadCenter/ElogbookUploadCard';
import EvElectricityCard from '../UploadCenter/EvElectricityCard';
import FleetUploadCard from '../UploadCenter/FleetUploadCard';
import HistoryUploadCard from '../UploadCenter/HistoryUploadCard';
import MaintenanceUploadCard from '../UploadCenter/MaintenanceUploadCard';

import CollapsibleUploadSection from './CollapsibleUploadSection';

interface UploadSectionConfig {
  value: string;
  title: string;
  fileType: string;
  Card: ComponentType<{ onUploaded: () => Promise<void> }>;
}

const UPLOAD_SECTIONS: UploadSectionConfig[] = [
  { value: 'fleet', title: 'Fleet List', fileType: 'fleet', Card: FleetUploadCard },
  { value: 'fuel_card', title: 'Fuel Card', fileType: 'fuel_card', Card: FuelCardUploadCard },
  { value: 'elogbook', title: 'Elogbook', fileType: 'elogbook', Card: ElogbookUploadCard },
  { value: 'ev', title: 'EV Electricity', fileType: 'ev', Card: EvElectricityCard },
  { value: 'maint', title: 'Maintenance (Workshop)', fileType: 'maint', Card: MaintenanceUploadCard },
  { value: 'accident', title: 'Accident Records', fileType: 'accident', Card: AccidentUploadCard },
  { value: 'history', title: 'History Import', fileType: 'history', Card: HistoryUploadCard },
];

const UploadTab = () => {
  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      className="flex flex-col gap-4"
    >
      {UPLOAD_SECTIONS.map((section: UploadSectionConfig) => (
        <CollapsibleUploadSection
          key={section.value}
          value={section.value}
          title={section.title}
          fileType={section.fileType}
          UploadCard={section.Card}
        />
      ))}
    </Accordion>
  );
};

export default UploadTab;
