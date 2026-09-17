import { useEffect, useState } from 'react';

import { Button } from '@client/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Textarea } from '@client/src/components/ui/textarea';
import { Spinner } from '@client/src/components/ui/spinner';

interface EditDocDialogProps {
  open: boolean;
  initialValue: string;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (markdown: string) => void;
}

const EditDocDialog = ({
  open,
  initialValue,
  saving,
  onOpenChange,
  onSave,
}: EditDocDialogProps) => {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-5xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Edit system guide</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 py-4">
          <Textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            className="h-full min-h-full w-full resize-none font-mono text-xs leading-5"
            spellCheck={false}
          />
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(value);
            }}
            disabled={saving}
          >
            {saving && <Spinner className="h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocDialog;
