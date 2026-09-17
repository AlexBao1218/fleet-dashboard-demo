import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import { Calendar } from '@client/src/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

import { createManualEntry } from '@client/src/api/fuel-transaction';
import { listFuelProductMaps } from '@client/src/api/fuel-product-map';
import type { FuelProductMapItem } from '@shared/fuel-product-map';
import type { ManualEntryRequest } from '@shared/fuel-transaction';

export interface ManualEntryCardProps {
  onSaved: () => Promise<void>;
}

const MANUAL_HINT =
  'Supplier B 和 Supplier C 每月只有十几笔，在此逐笔录入。从 2026 年 9 月起填写；2026 年 8 月及之前的已由历史导入覆盖。同一供应商同一单据号再次提交会覆盖原记录。';

const manualEntrySchema = z.object({
  supplier: z.enum(['Supplier B', 'Supplier C'], {
    message: '请选择供应商',
  }),
  txnDate: z.date({ message: '请选择日期' }),
  plate: z.string().min(1, '请输入车牌号'),
  productName: z.string().min(1, '请选择产品'),
  litresStr: z
    .string()
    .min(1, '请输入加油量')
    .refine((v) => Number(v) > 0, '加油量必须大于 0'),
  costHkdStr: z
    .string()
    .min(1, '请输入金额')
    .refine((v) => Number(v) >= 0, '金额不能为负数'),
  docNo: z.string().min(1, '请输入单据号'),
});

type ManualEntryFormData = z.infer<typeof manualEntrySchema>;

const SUPPLIER_OPTIONS = ['Supplier B', 'Supplier C'] as const;

export const ManualEntryCard = ({ onSaved }: ManualEntryCardProps) => {
  const [productOptions, setProductOptions] = useState<FuelProductMapItem[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [serverError, setServerError] = useState<string>('');

  const form = useForm<ManualEntryFormData>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      supplier: 'Supplier B',
      txnDate: undefined,
      plate: '',
      productName: '',
      litresStr: '',
      costHkdStr: '',
      docNo: '',
    },
  });

  const watchedSupplier = form.watch('supplier');

  const loadProducts = useCallback(async (supplier: string): Promise<void> => {
    try {
      const response = await listFuelProductMaps(supplier);
      setProductOptions(response.items);
    } catch (error: unknown) {
      logger.error(`加载产品映射失败: ${JSON.stringify(error)}`);
      setProductOptions([]);
    }
  }, []);

  useEffect(() => {
    form.setValue('productName', '');
    void loadProducts(watchedSupplier);
  }, [watchedSupplier, loadProducts, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true);
    setSuccessMsg('');
    setServerError('');
    try {
      const request: ManualEntryRequest = {
        supplier: data.supplier,
        txnDate: dayjs(data.txnDate).format('YYYY-MM-DD'),
        plate: data.plate,
        productName: data.productName,
        litres: Number(data.litresStr),
        costHkd: Number(data.costHkdStr),
        docNo: data.docNo,
      };
      await createManualEntry(request);
      form.reset({
        supplier: data.supplier,
        txnDate: undefined,
        plate: '',
        productName: '',
        litresStr: '',
        costHkdStr: '',
        docNo: '',
      });
      setSuccessMsg('Saved');
      await onSaved();
    } catch (error: unknown) {
      logger.error(`手工录入提交失败: ${JSON.stringify(error)}`);
      setServerError(
        error instanceof Error ? error.message : '提交失败，请稍后重试',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-heading text-base font-semibold text-foreground">
        Manual Entry
      </h2>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Supplier <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPLIER_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="txnDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value ? 'text-muted-foreground' : ''
                          }`}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value
                            ? dayjs(field.value).format('YYYY-MM-DD')
                            : 'Pick a date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Plate <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. AB1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Product <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productOptions.map((p) => (
                        <SelectItem key={p.id} value={p.productName}>
                          {p.productName} ({p.fuelType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="litresStr"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Litres <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costHkdStr"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Cost HKD <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="docNo"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Doc No. <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Document number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {serverError ? (
            <div
              className="rounded-md p-3"
              style={{ backgroundColor: 'hsl(0 60% 96%)' }}
            >
              <p className="text-sm" style={{ color: 'hsl(0 60% 34%)' }}>
                {serverError}
              </p>
            </div>
          ) : null}
          {successMsg ? (
            <div
              className="rounded-md p-3"
              style={{ backgroundColor: 'hsl(150 30% 95%)' }}
            >
              <p className="text-sm" style={{ color: 'hsl(155 55% 25%)' }}>
                {successMsg}
              </p>
            </div>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save entry'}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-sm text-muted-foreground">{MANUAL_HINT}</p>
    </section>
  );
};

export default ManualEntryCard;
