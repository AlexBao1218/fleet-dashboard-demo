import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@client/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';

import type {
  FuelProductMapItem,
  SaveFuelProductMapRequest,
} from '@shared/fuel-product-map';

const fuelProductMapSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  productName: z.string().min(1, 'Product name is required'),
  fuelType: z.enum(['Petrol', 'Diesel']),
});

type FuelProductMapFormValues = z.infer<typeof fuelProductMapSchema>;

function extractServerMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message: unknown = data.message;
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }
    }
  }
  return 'Failed to save the mapping. Please try again.';
}

interface FuelProductMapDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: FuelProductMapItem | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SaveFuelProductMapRequest) => Promise<void>;
}

const FuelProductMapDialog = ({
  open,
  mode,
  initial,
  submitting,
  onOpenChange,
  onSubmit,
}: FuelProductMapDialogProps) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FuelProductMapFormValues>({
    resolver: zodResolver(fuelProductMapSchema),
    defaultValues: {
      supplier: '',
      productName: '',
      fuelType: 'Petrol',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        supplier: initial?.supplier ?? '',
        productName: initial?.productName ?? '',
        fuelType: initial?.fuelType ?? 'Petrol',
      });
      setServerError(null);
    }
  }, [open, initial, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setServerError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    setServerError(null);
    try {
      await onSubmit({
        supplier: data.supplier,
        productName: data.productName,
        fuelType: data.fuelType,
      });
    } catch (error: unknown) {
      setServerError(extractServerMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'create' ? 'New Mapping' : 'Edit Mapping'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a supplier product to fuel type mapping.'
              : 'Update this supplier product to fuel type mapping.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Supplier <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Supplier A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Product Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Unleaded 95" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fuel Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError !== null && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FuelProductMapDialog;
