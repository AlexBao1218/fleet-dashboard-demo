import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';

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
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  deleteEvMonthly,
  uploadEvMonthly,
} from '@client/src/api/ev-monthly';
import {
  SERVER_PROCESS_LIMIT_BYTES,
  buildFileSizeErrorMessage,
} from '@client/src/utils/upload-error';
import type { EvMonthlyUploadResponse } from '@shared/ev-monthly';

export interface EvElectricityCardProps {
  onUploaded: () => Promise<void>;
}

const EV_ELECTRICITY_HINT =
  "上传当月的用电汇总表（.xlsx）。月份默认取自文件名，如有不符请手动修改。";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const FILE_MONTH_PATTERN = /(\d{6})/;

const AMOUNT_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const formatAmount = (value: number): string => {
  return value.toLocaleString('en-US', AMOUNT_FORMAT_OPTIONS);
};

const extractMonthFromFileName = (fileName: string): string => {
  const match: RegExpExecArray | null = FILE_MONTH_PATTERN.exec(fileName);
  if (!match) return '';
  const digits: string = match[1];
  const monthPart: number = Number(digits.slice(4));
  if (monthPart < 1 || monthPart > 12) return '';
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const isXlsxFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.xlsx');
};

export const EvElectricityCard = ({ onUploaded }: EvElectricityCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<EvMonthlyUploadResponse | null>(null);
  const [deleteMonth, setDeleteMonth] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);

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
    const detectedMonth: string = extractMonthFromFileName(file.name);
    if (detectedMonth) {
      setMonth(detectedMonth);
    }
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
    if (!MONTH_PATTERN.test(month)) {
      setError('请填写有效的月份（格式 YYYY-MM）');
      return;
    }
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const dataloom = await getDataloom();
      const { data, error: uploadError } = await dataloom.storage
        .from(getDefaultBucketId())
        .uploadFile(selectedFile);
      if (uploadError || !data) {
        logger.error(`ev 电量文件上传失败: ${JSON.stringify(uploadError)}`);
        throw new Error('文件上传失败，请稍后重试');
      }
      const parsed = await uploadEvMonthly({
        fileName: selectedFile.name,
        downloadUrl: data.download_url,
        month: month.replace('-', ''),
      });
      setResult(parsed);
      setSelectedFile(null);
      toast.success(`Uploaded: ${selectedFile.name}`);
      await onUploaded();
    } catch (err: unknown) {
      logger.error(`ev 电量上传解析失败: ${JSON.stringify(err)}`);
      setError(err instanceof Error ? err.message : '上传失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [selectedFile, submitting, month, onUploaded]);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!MONTH_PATTERN.test(deleteMonth) || deleting) return;
    setDeleting(true);
    try {
      const response = await deleteEvMonthly(deleteMonth.replace('-', ''));
      toast.success(`Deleted ${response.deletedRows} rows for ${deleteMonth}`);
      await onUploaded();
    } catch (err: unknown) {
      logger.error(`ev 电量按月删除失败: ${JSON.stringify(err)}`);
      toast.error(err instanceof Error ? err.message : '删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  }, [deleteMonth, deleting, onUploaded]);

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">
        EV Electricity
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
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">月份</span>
        <Input
          type="text"
          placeholder="YYYY-MM"
          value={month}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setMonth(event.target.value)
          }
          className="w-40"
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
          </div>
          <p className="mt-2 font-mono text-sm text-foreground tabular-nums">
            本月合计 {formatAmount(result.totalKwh)} kWh，HKD{' '}
            {formatAmount(result.costHkd)}
          </p>
          <p className="mt-2 whitespace-pre-line font-mono text-sm text-muted-foreground">
            {result.warnings}
          </p>
        </div>
      ) : null}
      <p className="mt-4 text-sm text-muted-foreground">{EV_ELECTRICITY_HINT}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-md border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Delete by month</p>
          <p className="text-sm text-muted-foreground">
            删除指定月份的全部 EV Electricity 记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="YYYY-MM"
            value={deleteMonth}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
              setDeleteMonth(event.target.value)
            }
            className="w-40"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={deleting || !MONTH_PATTERN.test(deleteMonth)}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  删除 {deleteMonth} 的 EV Electricity 记录？
                </AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除月份 {deleteMonth} 的全部 EV
                  Electricity 记录，且无法恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
};

export default EvElectricityCard;
