import { Table, type TableColumnsType } from '@lark-apaas/client-toolkit/antd-table';
import { Button } from '@client/src/components/ui/button';

import type { FuelProductMapItem, FuelType } from '@shared/fuel-product-map';

import FuelTypeTag from './FuelTypeTag';

interface FuelProductMapTableProps {
  items: FuelProductMapItem[];
  loading: boolean;
  onEdit: (item: FuelProductMapItem) => void;
  onDelete: (item: FuelProductMapItem) => void;
}

const FuelProductMapTable = ({
  items,
  loading,
  onEdit,
  onDelete,
}: FuelProductMapTableProps) => {
  const columns: TableColumnsType<FuelProductMapItem> = [
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      width: 260,
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      width: 300,
    },
    {
      title: 'Fuel Type',
      dataIndex: 'fuelType',
      width: 140,
      render: (value: FuelType) => <FuelTypeTag fuelType={value} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record: FuelProductMapItem) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-primary"
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive"
            onClick={() => onDelete(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      data-ai-section-type="card-list"
      className="rounded-md border border-border bg-card"
    >
      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
        scroll={{ x: 860, y: 500 }}
        pagination={false}
        locale={{
          emptyText: (
            <div className="py-10 text-sm text-muted-foreground">
              No fuel product mappings yet
            </div>
          ),
        }}
      />
    </div>
  );
};

export default FuelProductMapTable;
