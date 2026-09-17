import { cn } from '@/lib/utils';
import { REDACTED_LABEL } from '@/lib/brand';

interface RedactedProps {
  /** Just "Redacted" — for tight table cells */
  short?: boolean;
  className?: string;
}

/** Grey bar standing in for a record-level value withheld from the public demo. */
export function Redacted({ short = false, className }: RedactedProps) {
  return (
    <span
      title={REDACTED_LABEL}
      aria-label={REDACTED_LABEL}
      className={cn(
        'inline-flex max-w-full select-none items-center whitespace-nowrap rounded-sm bg-muted px-1.5 text-[11px] font-normal leading-5 text-muted-foreground',
        className,
      )}
    >
      {short ? 'Redacted' : REDACTED_LABEL}
    </span>
  );
}
