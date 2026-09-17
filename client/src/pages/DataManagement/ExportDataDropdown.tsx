import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@client/src/components/ui/dropdown-menu';

import { exportApi } from '@client/src/api';
import {
  EXPORT_TABLE_OPTIONS,
  type ExportTableName,
  type ExportTableOption,
} from '@shared/export';

const ExportDataDropdown = () => {
  const [downloading, setDownloading] = useState<ExportTableName | null>(null);

  const handleSelect = async (tableName: ExportTableName): Promise<void> => {
    if (downloading !== null) {
      return;
    }
    setDownloading(tableName);
    try {
      await exportApi.downloadTableCsv(tableName);
    } catch (error: unknown) {
      logger.error(`Failed to export ${tableName}: ${JSON.stringify(error)}`);
      toast.error('Export failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={downloading !== null}
          data-ai-section-type="button"
        >
          {downloading !== null ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Export data
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {EXPORT_TABLE_OPTIONS.map((option: ExportTableOption) => (
          <DropdownMenuItem
            key={option.value}
            disabled={downloading !== null}
            onSelect={() => void handleSelect(option.value)}
          >
            <span className="font-mono tabular-nums">{option.label}</span>
            {downloading === option.value ? (
              <Loader2 className="ml-auto size-3.5 animate-spin text-muted-foreground" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDataDropdown;
