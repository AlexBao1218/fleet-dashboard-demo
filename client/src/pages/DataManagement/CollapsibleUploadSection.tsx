import type { ComponentType } from 'react';
import dayjs from 'dayjs';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@client/src/components/ui/accordion';

import UploadHistoryTable from '../UploadCenter/UploadHistoryTable';
import { useUploadLogs } from '../UploadCenter/useUploadLogs';

export interface CollapsibleUploadSectionProps {
  value: string;
  title: string;
  fileType: string;
  UploadCard: ComponentType<{ onUploaded: () => Promise<void> }>;
}

const CollapsibleUploadSection = ({
  value,
  title,
  fileType,
  UploadCard,
}: CollapsibleUploadSectionProps) => {
  const { items, loading, refresh } = useUploadLogs(fileType);
  const latest = items[0];

  const summary: string = loading
    ? 'Loading…'
    : latest
      ? `Last upload ${dayjs(latest.uploadedAt).format('YYYY-MM-DD')} · read ${latest.rowsRead} · added ${latest.rowsAdded}`
      : 'No uploads yet';

  return (
    <AccordionItem
      value={value}
      className="rounded-md border border-border bg-card px-6"
    >
      <AccordionTrigger>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
            {summary}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-6">
        <UploadCard onUploaded={refresh} />
        <UploadHistoryTable items={items} loading={loading} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default CollapsibleUploadSection;
