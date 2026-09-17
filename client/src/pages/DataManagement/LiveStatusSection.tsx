import { Skeleton } from '@client/src/components/ui/skeleton';

import type { AppDocLiveStatusResponse } from '@shared/app-doc';

import { formatUploadTime } from './about-helpers';

interface LiveStatusSectionProps {
  status: AppDocLiveStatusResponse | null;
  loading: boolean;
  error: string | null;
}

const LiveStatusSection = ({
  status,
  loading,
  error,
}: LiveStatusSectionProps) => {
  return (
    <section id="doc-live-status" className="scroll-mt-24">
      <h2 className="mb-3 mt-8 border-b border-border pb-2 font-heading text-xl font-semibold text-foreground">
        Live status
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Auto-generated snapshot, not stored in the document.
      </p>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-border bg-accent p-4 text-sm text-muted-foreground">
          Failed to load live status: {error}
        </div>
      )}

      {!loading && !error && status && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Table row counts
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-accent">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">
                    Table
                  </th>
                  <th className="border border-border px-3 py-2 text-right font-semibold">
                    Rows
                  </th>
                </tr>
              </thead>
              <tbody>
                {status.tables.map((table) => (
                  <tr key={table.table}>
                    <td className="border border-border px-3 py-2">
                      {table.label}{' '}
                      <span className="font-mono text-xs text-muted-foreground">
                        {table.table}
                      </span>
                    </td>
                    <td className="border border-border px-3 py-2 text-right font-mono tabular-nums">
                      {table.rows.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Last upload by data source
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-accent">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">
                    Data source
                  </th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">
                    Last upload
                  </th>
                </tr>
              </thead>
              <tbody>
                {status.sources.map((source) => (
                  <tr key={source.fileType}>
                    <td className="border border-border px-3 py-2">
                      {source.label}
                    </td>
                    <td className="border border-border px-3 py-2 font-mono tabular-nums">
                      {formatUploadTime(source.lastUploadAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default LiveStatusSection;
