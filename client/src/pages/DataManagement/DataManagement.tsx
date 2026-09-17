import { useSearchParams } from 'react-router-dom';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@client/src/components/ui/tabs';

import AboutTab from './AboutTab';
import ExportDataDropdown from './ExportDataDropdown';
import HistoryTab from './HistoryTab';
import ManualEntryTab from './ManualEntryTab';
import ReferenceTablesTab from './ReferenceTablesTab';
import UploadTab from './UploadTab';

export type DataManagementTab =
  | 'upload'
  | 'manual'
  | 'reference'
  | 'history'
  | 'about';

const TAB_VALUES: DataManagementTab[] = [
  'upload',
  'manual',
  'reference',
  'history',
  'about',
];

function parseTab(raw: string | null): DataManagementTab {
  if (raw !== null && (TAB_VALUES as string[]).includes(raw)) {
    return raw as DataManagementTab;
  }
  return 'upload';
}

const DataManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: DataManagementTab = parseTab(searchParams.get('tab'));

  const handleTabChange = (value: string): void => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Data Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload fleet data, maintain reference tables and review history. Demo: uploads are disabled; edits stay in your browser.
            </p>
          </div>
          <ExportDataDropdown />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="reference">Reference Tables</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <UploadTab />
          </TabsContent>
          <TabsContent value="manual" className="mt-4">
            <ManualEntryTab />
          </TabsContent>
          <TabsContent value="reference" className="mt-4">
            <ReferenceTablesTab />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <HistoryTab />
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <AboutTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataManagement;
