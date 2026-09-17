import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import { uploadElogbook } from '@client/src/api/elogbook-trip';
import {
  SERVER_PROCESS_LIMIT_BYTES,
  buildFileSizeErrorMessage,
} from '@client/src/utils/upload-error';
import type { ElogbookUploadResponse } from '@shared/elogbook-trip';

export interface ElogbookUploadCardProps {
  onUploaded: () => Promise<void>;
}

const ELOGBOOK_HINT =
  '上传 elogbook 系统导出的 Vehicle Transaction Report（.xlsx）。每月导出当月即可，重叠的记录会被覆盖。';

const isXlsxFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.xlsx');
};

export const ElogbookUploadCard = ({ onUploaded }: ElogbookUploadCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ElogbookUploadResponse | null>(null);

  const acceptFile = useCallback((file: File | undefined): void => {
    if (!file) return;
    if (!isXlsxFile(file)) {
      setSelectedFile(null);
      setResult(null);
      setError('仅支持 .xlsx 文件');
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
        logger.error(`elogbook 文件上传失败: ${JSON.stringify(uploadError)}`);
        throw new Error('文件上传失败，请稍后重试');
      }
      const parsed = await uploadElogbook({
        fileName: selectedFile.name,
        downloadUrl: data.download_url,
      });
      setResult(parsed);
      setSelectedFile(null);
      toast.success(`Uploaded: ${selectedFile.name}`);
      await onUploaded();
    } catch (err: unknown) {
      logger.error(`elogbook 上传解析失败: ${JSON.stringify(err)}`);
      setError(err instanceof Error ? err.message : '上传失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [selectedFile, submitting, onUploaded]);

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Elogbook
      </h2>
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
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          dragging
            ? 'border-primary bg-accent'
            : 'border-primary/40 hover:border-primary'
        }`}
      >
        <div className="flex items-center gap-2 text-primary">
          <Upload className="size-5" />
          <FileSpreadsheet className="size-5" />
        </div>
        <p className="text-sm text-foreground">Click or drag a .xlsx file here</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
      {error ? (
        <div
          className="mt-2 rounded-md p-3"
          style={{ backgroundColor: 'hsl(0 60% 96%)' }}
        >
          <p className="text-sm" style={{ color: 'hsl(0 60% 34%)' }}>
            {error}
          </p>
        </div>
      ) : null}
      {selectedFile ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="min-w-0 truncate font-mono text-sm text-foreground tabular-nums">
            {selectedFile.name}
          </p>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Uploading…' : 'Confirm upload'}
          </Button>
        </div>
      ) : null}
      {result ? (
        <div className="mt-3 rounded-md border border-border p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm tabular-nums">
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
            <span>
              <span className="text-muted-foreground">valid</span>{' '}
              {result.validCount}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line font-mono text-sm text-muted-foreground">
            {result.warnings}
          </p>
        </div>
      ) : null}
      <p className="mt-4 text-sm text-muted-foreground">{ELOGBOOK_HINT}</p>
    </section>
  );
};

export default ElogbookUploadCard;
