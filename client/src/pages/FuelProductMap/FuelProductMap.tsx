import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';

import {
  createFuelProductMap,
  deleteFuelProductMap,
  listFuelProductMaps,
  updateFuelProductMap,
} from '@client/src/api/fuel-product-map';

import type {
  FuelProductMapItem,
  SaveFuelProductMapRequest,
} from '@shared/fuel-product-map';

import FuelProductMapDialog from './FuelProductMapDialog';
import FuelProductMapTable from './FuelProductMapTable';

interface DialogState {
  mode: 'create' | 'edit';
  item: FuelProductMapItem | null;
}

const FuelProductMap = () => {
  const [items, setItems] = useState<FuelProductMapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<FuelProductMapItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await listFuelProductMaps();
      setItems(response.items);
    } catch (error: unknown) {
      logger.error(`Failed to load fuel product maps: ${JSON.stringify(error)}`);
      setLoadError('Failed to load fuel product mappings. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDialogSubmit = async (values: SaveFuelProductMapRequest) => {
    if (dialogState === null) {
      return;
    }
    setSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        await createFuelProductMap(values);
        toast.success('Mapping created');
      } else if (dialogState.item !== null) {
        await updateFuelProductMap(dialogState.item.id, values);
        toast.success('Mapping updated');
      }
      setDialogState(null);
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) {
      return;
    }
    setDeleting(true);
    try {
      await deleteFuelProductMap(deleteTarget.id);
      toast.success('Mapping deleted');
      setDeleteTarget(null);
      await refresh();
    } catch (error: unknown) {
      logger.error(`Failed to delete mapping: ${JSON.stringify(error)}`);
      toast.error('Failed to delete the mapping. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Fuel Product Map
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintain supplier product name to fuel type translations.
          </p>
        </div>
        <Button
          data-ai-section-type="button"
          onClick={() => setDialogState({ mode: 'create', item: null })}
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      {loadError !== null ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-card p-6">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : (
        <FuelProductMapTable
          items={items}
          loading={loading}
          onEdit={(item: FuelProductMapItem) =>
            setDialogState({ mode: 'edit', item })
          }
          onDelete={(item: FuelProductMapItem) => setDeleteTarget(item)}
        />
      )}

      <FuelProductMapDialog
        open={dialogState !== null}
        mode={dialogState?.mode ?? 'create'}
        initial={dialogState?.item ?? null}
        submitting={submitting}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onSubmit={handleDialogSubmit}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.supplier} —{' '}
              {deleteTarget?.productName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                void handleDeleteConfirm();
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};

export default FuelProductMap;
