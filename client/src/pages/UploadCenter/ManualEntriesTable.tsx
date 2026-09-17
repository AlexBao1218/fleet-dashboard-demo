import { useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import {
  Table,
  type TableColumnsType,
} from '@lark-apaas/client-toolkit/antd-table';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@client/src/components/ui/alert-dialog';

import { deleteManualEntry } from '@client/src/api/fuel-transaction';
import type { ManualEntryItem } from '@shared/fuel-transaction';

export interface ManualEntriesTableProps {
  items: ManualEntryItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const numberColumnClass = 'font-mono text-right tabular-nums';

function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export const ManualEntriesTable = ({
  items,
  loading,
  onRefresh,
}: ManualEntriesTableProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      setDeleting(id);
      try {
        await deleteManualEntry(id);
        await onRefresh();
      } catch (error: unknown) {
        logger.error(`删除手工录入失败: ${JSON.stringify(error)}`);
      } finally {
        setDeleting(null);
      }
    },
    [onRefresh],
  );

  const columns: TableColumnsType<ManualEntryItem> = [
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'txnDate',
      key: 'txnDate',
      width: 110,
      render: (value: string) => (
        <span className="font-mono tabular-nums">{value}</span>
      ),
    },
    {
      title: 'Plate',
      dataIndex: 'plate',
      key: 'plate',
      width: 100,
      render: (value: string) => (
        <span className="font-mono tabular-nums">{value}</span>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      width: 140,
    },
    {
      title: 'Litres',
      dataIndex: 'litres',
      key: 'litres',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Cost HKD',
      dataIndex: 'costHkd',
      key: 'costHkd',
      width: 110,
      align: 'right',
      render: (value: number) => (
        <span className={numberColumnClass}>{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Doc No.',
      dataIndex: 'docNo',
      key: 'docNo',
      width: 120,
      render: (value: string) => (
        <span className="font-mono tabular-nums">{value}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, record: ManualEntryItem) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              disabled={deleting === record.id}
            >
              <Trash2 className="size-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                {record.supplier} — {record.txnDate} — {record.plate} — Doc
                No. {record.docNo}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete(record.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading mb-4 text-base font-semibold text-foreground">
        Recent manual entries
      </h2>
      <Table<ManualEntryItem>
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
        scroll={{ x: 900, y: 400 }}
        pagination={false}
        locale={{
          emptyText: (
            <div className="py-8 text-sm text-muted-foreground">
              No manual entries yet
            </div>
          ),
        }}
      />
    </section>
  );
};

export default ManualEntriesTable;
