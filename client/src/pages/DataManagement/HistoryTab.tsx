import { useState } from 'react';
import dayjs from 'dayjs';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Table,
  type TableColumnsType,
} from '@lark-apaas/client-toolkit/antd-table';

import { Button } from '@client/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

import { exportApi } from '@client/src/api';
import type { UploadLog } from '@shared/upload-log';

import { useUploadLogs } from '../UploadCenter/useUploadLogs';

interface FileTypeOption {
  value: string;
  label: string;
}

const FILE_TYPE_OPTIONS: FileTypeOption[] = [
  { value: 'all', label: 'All types' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'fuel_card', label: 'Fuel Card' },
  { value: 'elogbook', label: 'Elogbook' },
  { value: 'ev', label: 'EV' },
  { value: 'maint', label: 'Maintenance (Workshop)' },
  { value: 'accident', label: 'Accident' },
  { value: 'history', label: 'History Import' },
];

const FILE_TYPE_LABELS: Record<string, string> = {
  fleet: 'Fleet',
  fuel_card: 'Fuel Card',
  elogbook: 'Elogbook',
  ev: 'EV',
  maint: 'Maintenance (Workshop)',
  accident: 'Accident',
  history: 'History Import',
};

const numberColumnClass = 'font-mono text-right tabular-nums';

const HistoryTab = () => {
  const [fileType, setFileType] = useState<string>('all');
  const { items, loading } = useUploadLogs(fileType);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [exporting, setExporting] = useState<boolean>(false);

  const toggleExpanded = (id: string): void => {
    setExpandedIds((prev: ReadonlySet<string>) => {
      const next = new Set<string>(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    try {
      await exportApi.downloadTableCsv('upload_log');
    } catch (error: unknown) {
      logger.error(`Failed to export upload_log: ${JSON.stringify(error)}`);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const columns: TableColumnsType<UploadLog> = [
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 150,
      render: (value: string) => (
        <span className="font-mono tabular-nums">
          {dayjs(value).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: 'File Type',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 160,
      render: (value: string) => FILE_TYPE_LABELS[value] ?? value,
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 220,
      render: (value: string) => (
        <span className="block truncate font-mono tabular-nums">{value}</span>
      ),
    },
    {
      title: 'Read',
      dataIndex: 'rowsRead',
      key: 'rowsRead',
      width: 90,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{value}</span>
      ),
    },
    {
      title: 'Added',
      dataIndex: 'rowsAdded',
      key: 'rowsAdded',
      width: 90,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{value}</span>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'rowsUpdated',
      key: 'rowsUpdated',
      width: 90,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{value}</span>
      ),
    },
    {
      title: 'Rejected',
      dataIndex: 'rowsRejected',
      key: 'rowsRejected',
      width: 90,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{value}</span>
      ),
    },
    {
      title: 'Warnings',
      dataIndex: 'warnings',
      key: 'warnings',
      render: (value: string, record: UploadLog) => {
        const expanded = expandedIds.has(record.id);
        if (!value) {
          return (
            <span className="font-mono text-muted-foreground tabular-nums">
              —
            </span>
          );
        }
        return (
          <div className="flex flex-col items-start gap-1">
            <span
              className={`font-mono text-muted-foreground tabular-nums ${
                expanded
                  ? 'whitespace-pre-line break-words'
                  : 'line-clamp-1 break-all'
              }`}
            >
              {value}
            </span>
            <button
              type="button"
              onClick={() => toggleExpanded(record.id)}
              className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Upload history
        </h2>
        <div className="flex items-center gap-2">
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="File type" />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_OPTIONS.map((option: FileTypeOption) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={exporting}
            onClick={() => void handleExport()}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>
      <Table<UploadLog>
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1250, y: 500 }}
        pagination={false}
        locale={{
          emptyText: (
            <div className="py-8 text-sm text-muted-foreground">
              No uploads yet
            </div>
          ),
        }}
      />
    </section>
  );
};

export default HistoryTab;
