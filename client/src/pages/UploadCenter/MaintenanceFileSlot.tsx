import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import {
  SERVER_PROCESS_LIMIT_BYTES,
  buildFileSizeErrorMessage,
} from '@client/src/utils/upload-error';
import type { WorkshopUploadRequest, WorkshopUploadResponse } from '@shared/maintenance';

export interface MaintenanceFileSlotProps {
  slotLabel: string;
  expectedFileName: string;
  targetTable: string;
  uploadFn: (body: WorkshopUploadRequest) => Promise<WorkshopUploadResponse>;
  onUploaded: () => Promise<void>;
}

const isCsvFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.csv');
};

const MaintenanceFileSlot = ({
  slotLabel,
  expectedFileName,
  targetTable,
  uploadFn,
  onUploaded,
}: MaintenanceFileSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<WorkshopUploadResponse | null>(null);

  const acceptFile = useCallback((file: File | undefined): void => {
    if (!file) return;
    if (!isCsvFile(file)) {
      setSelectedFile(null);
      setResult(null);
      setError('仅支持 .csv 文件');
      return;
    }
    if (file.size > SERVER_PROCESS_LIMIT_BYTES) {
      setSelectedFile(null);
      setResult(null);
      setError(buildFileSizeErrorMessage(file.size));
      return;
    }
    setError('');
    setResult(null);
    setSelectedFile(file);
  }, []);

  const handleClick = useCallback((): void => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      acceptFile(event.target.files?.[0]);
      event.target.value = '';
    },
    [acceptFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((): void => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent): void => {
      event.preventDefault();
      setDragging(false);
      acceptFile(event.dataTransfer.files?.[0]);
    },
    [acceptFile],
  );

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (!selectedFile || submitting) return;
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const dataloom = await getDataloom();
      const { data, error: uploadError } = await dataloom.storage
        .from(getDefaultBucketId())
        .uploadFile(selectedFile);
      if (uploadError || !data) {
        logger.error(
          `Workshop ${slotLabel} 文件上传失败: ${JSON.stringify(uploadError)}`,
        );
        throw new Error('文件上传失败，请稍后重试');
      }
      const parsed = await uploadFn({
        fileName: selectedFile.name,
        downloadUrl: data.download_url,
      });
      setResult(parsed);
      setSelectedFile(null);
      toast.success(`Uploaded: ${selectedFile.name}`);
      await onUploaded();
    } catch (err: unknown) {
      logger.error(`Workshop ${slotLabel} 上传解析失败: ${JSON.stringify(err)}`);
      setError(err instanceof Error ? err.message : '上传失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [selectedFile, submitting, slotLabel, uploadFn, onUploaded]);

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {slotLabel}
        </h3>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          → {targetTable}
        </span>
      </div>
      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
        {expectedFileName}
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          dragging
            ? 'border-primary bg-accent'
            : 'border-primary/40 hover:border-primary'
        }`}
      >
        <div className="flex items-center gap-2 text-primary">
          <Upload className="size-4" />
          <FileSpreadsheet className="size-4" />
        </div>
        <p className="text-xs text-foreground">Click or drag a .csv file here</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
      {error ? (
        <div
          className="mt-2 rounded-md p-2"
          style={{ backgroundColor: 'hsl(0 60% 96%)' }}
        >
          <p className="text-sm" style={{ color: 'hsl(0 60% 34%)' }}>
            {error}
          </p>
        </div>
      ) : null}
      {selectedFile ? (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-mono text-xs text-foreground tabular-nums">
            {selectedFile.name}
          </p>
          <Button size="sm" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Uploading…' : 'Confirm'}
          </Button>
        </div>
      ) : null}
      {result ? (
        <div className="mt-2 rounded-md border border-border p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums">
            <span>
              <span className="text-muted-foreground">read</span>{' '}
              {result.rowsRead}
            </span>
            <span>
              <span className="text-muted-foreground">added</span>{' '}
              {result.rowsAdded}
            </span>
            <span>
              <span className="text-muted-foreground">updated</span>{' '}
              {result.rowsUpdated}
            </span>
            <span>
              <span className="text-muted-foreground">rejected</span>{' '}
              {result.rowsRejected}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-xs text-foreground">
            {result.costSummary}
          </p>
          {result.warnings ? (
            <p className="mt-1.5 whitespace-pre-line font-mono text-xs text-muted-foreground">
              {result.warnings}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default MaintenanceFileSlot;
