import { Info } from 'lucide-react';

import { SYNTHETIC_LABEL, SYNTHETIC_NOTE } from '@/lib/brand';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@client/src/components/ui/tooltip';

/** Small chip beside a dashboard's "Data up to" line; the tooltip carries the explanation. */
export function SyntheticBadge({ className = '' }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex cursor-default items-center gap-1 rounded-sm border border-border bg-muted px-1.5 py-px text-[11px] font-medium leading-4 text-muted-foreground ${className}`}
        >
          <Info className="size-3" />
          {SYNTHETIC_LABEL}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] text-xs leading-relaxed">{SYNTHETIC_NOTE}</TooltipContent>
    </Tooltip>
  );
}
