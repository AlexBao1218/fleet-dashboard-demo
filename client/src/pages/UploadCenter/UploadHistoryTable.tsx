import dayjs from 'dayjs';

import {
  Table,
  type TableColumnsType,
} from '@lark-apaas/client-toolkit/antd-table';

import type { UploadLog } from '@shared/upload-log';

export interface UploadHistoryTableProps {
  items: UploadLog[];
  loading: boolean;
}

const numberColumnClass = 'font-mono text-right tabular-nums';

const columns: TableColumnsType<UploadLog> = [
  {
    title: 'File name',
    dataIndex: 'fileName',
    key: 'fileName',
    width: 220,
    render: (value: string) => (
      <span className="block truncate font-mono tabular-nums">{value}</span>
    ),
  },
  {
    title: 'Uploaded at',
    dataIndex: 'uploadedAt',
    key: 'uploadedAt',
    width: 160,
    render: (value: string) => (
      <span className="font-mono tabular-nums">
        {dayjs(value).format('YYYY-MM-DD HH:mm')}
      </span>
    ),
  },
  {
    title: 'Uploaded by',
    dataIndex: 'uploadedBy',
    key: 'uploadedBy',
    width: 140,
  },
  {
    title: 'Rows read',
    dataIndex: 'rowsRead',
    key: 'rowsRead',
    width: 100,
    align: 'right',
    render: (value: number) => (
      <span className={numberColumnClass}>{value}</span>
    ),
  },
  {
    title: 'Rows added',
    dataIndex: 'rowsAdded',
    key: 'rowsAdded',
    width: 100,
    align: 'right',
    render: (value: number) => (
      <span className={numberColumnClass}>{value}</span>
    ),
  },
  {
    title: 'Rows updated',
    dataIndex: 'rowsUpdated',
    key: 'rowsUpdated',
    width: 110,
    align: 'right',
    render: (value: number) => (
      <span className={numberColumnClass}>{value}</span>
    ),
  },
  {
    title: 'Rows rejected',
    dataIndex: 'rowsRejected',
    key: 'rowsRejected',
    width: 110,
    align: 'right',
    render: (value: number) => (
      <span className={numberColumnClass}>{value}</span>
    ),
  },
  {
    title: 'Warnings',
    dataIndex: 'warnings',
    key: 'warnings',
    render: (value: string) => (
      <span className="font-mono text-muted-foreground tabular-nums">
        {value}
      </span>
    ),
  },
];

export const UploadHistoryTable = ({ items, loading }: UploadHistoryTableProps) => {
  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading mb-4 text-base font-semibold text-foreground">
        Upload history
      </h2>
      <Table<UploadLog>
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1100, y: 500 }}
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

export default UploadHistoryTable;
