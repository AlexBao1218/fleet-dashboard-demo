import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, PencilLine } from 'lucide-react';
import { toast } from 'sonner';

import { appDocApi } from '@client/src/api';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { logger } from '@lark-apaas/client-toolkit/logger';

import type { AppDoc, AppDocLiveStatusResponse } from '@shared/app-doc';

import {
  AboutHeading,
  buildExportMarkdown,
  copyToClipboard,
  downloadMarkdownFile,
  formatLastUpdated,
  parseHeadings,
} from './about-helpers';
import DocMarkdown from './DocMarkdown';
import EditDocDialog from './EditDocDialog';
import LiveStatusSection from './LiveStatusSection';

const DOC_KEY = 'system-guide';
const EXPORT_FILE_NAME = 'Fleet-Dashboard-系统说明.md';
const COPY_RESET_MS = 2000;
const SCROLL_SPY_OFFSET = 140;

const AboutTab = () => {
  const [doc, setDoc] = useState<AppDoc | null>(null);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);

  const [liveStatus, setLiveStatus] = useState<AppDocLiveStatusResponse | null>(
    null,
  );
  const [liveLoading, setLiveLoading] = useState<boolean>(true);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const headingElements = useRef<Map<string, HTMLElement>>(new Map());

  const headings: AboutHeading[] = useMemo(() => {
    return doc ? parseHeadings(doc.markdown) : [];
  }, [doc]);

  useEffect(() => {
    let cancelled = false;
    setDocLoading(true);
    setDocError(null);
    appDocApi
      .getAppDoc(DOC_KEY)
      .then((data) => {
        if (!cancelled) {
          setDoc(data);
        }
      })
      .catch((error) => {
        logger.error('Failed to load system guide', error);
        if (!cancelled) {
          setDocError('Failed to load the system guide.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDocLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);
    appDocApi
      .getLiveStatus()
      .then((data) => {
        if (!cancelled) {
          setLiveStatus(data);
        }
      })
      .catch((error) => {
        logger.error('Failed to load live status', error);
        if (!cancelled) {
          setLiveError('Could not load live status.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLiveLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const registerHeading = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        headingElements.current.set(id, element);
      } else {
        headingElements.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }
    const handleScroll = () => {
      const scrollY: number = window.scrollY + SCROLL_SPY_OFFSET;
      let current: string | null = null;
      for (const heading of headings) {
        const element: HTMLElement | undefined = headingElements.current.get(
          heading.id,
        );
        if (!element) {
          continue;
        }
        const top: number =
          element.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollY) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current ?? headings[0].id);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element: HTMLElement | undefined = headingElements.current.get(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const handleCopy = async () => {
    if (!doc) {
      return;
    }
    const content: string = buildExportMarkdown(doc.markdown, liveStatus);
    const ok: boolean = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      toast.success('Copied as Markdown');
      window.setTimeout(() => {
        setCopied(false);
      }, COPY_RESET_MS);
    } else {
      toast.error('Copy failed. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!doc) {
      return;
    }
    const content: string = buildExportMarkdown(doc.markdown, liveStatus);
    downloadMarkdownFile(content, EXPORT_FILE_NAME);
    toast.success('Downloaded .md file');
  };

  const handleSave = async (markdown: string) => {
    if (!doc) {
      return;
    }
    setSaving(true);
    try {
      const updated: AppDoc = await appDocApi.updateAppDoc(DOC_KEY, {
        markdown,
      });
      setDoc(updated);
      setEditOpen(false);
      toast.success('Saved');
    } catch (error) {
      logger.error('Failed to save document', error);
      toast.error('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (docLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (docError || !doc) {
    return (
      <div className="rounded-md border border-border bg-accent p-6 text-sm text-muted-foreground">
        {docError ?? 'Document not found.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Last updated{' '}
          <span className="font-mono tabular-nums text-foreground">
            {formatLastUpdated(doc.updatedAt)}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy as Markdown'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download .md
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditOpen(true);
            }}
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-1 border-l border-border">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToHeading(heading.id);
                    }}
                    className={
                      'block w-full border-l-2 py-1 pl-3 text-left text-xs transition-colors ' +
                      (activeId === heading.id
                        ? 'border-primary font-medium text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground')
                    }
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <article className="min-w-0 max-w-[880px]">
          <DocMarkdown markdown={doc.markdown} registerHeading={registerHeading} />
          <LiveStatusSection
            status={liveStatus}
            loading={liveLoading}
            error={liveError}
          />
        </article>
      </div>

      <EditDocDialog
        open={editOpen}
        initialValue={doc.markdown}
        saving={saving}
        onOpenChange={setEditOpen}
        onSave={handleSave}
      />
    </div>
  );
};

export default AboutTab;
