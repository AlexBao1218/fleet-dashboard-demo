import dayjs from 'dayjs';

import type { AppDocLiveStatusResponse } from '@shared/app-doc';

export interface AboutHeading {
  id: string;
  text: string;
}

export function headingId(index: number): string {
  return `doc-heading-${index}`;
}

export function parseHeadings(markdown: string): AboutHeading[] {
  const lines: string[] = markdown.split('\n');
  const headings: AboutHeading[] = [];
  let inFence = false;
  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    const match: RegExpMatchArray | null = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      headings.push({
        id: headingId(headings.length),
        text: match[1],
      });
    }
  }
  return headings;
}

export function formatLastUpdated(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD');
}

export function formatUploadTime(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return dayjs(iso).format('YYYY-MM-DD HH:mm');
}

export function buildLiveStatusMarkdown(
  status: AppDocLiveStatusResponse | null,
): string {
  if (!status) {
    return '';
  }
  const lines: string[] = [];
  lines.push('## Live status');
  lines.push('');
  lines.push('Auto-generated snapshot, not stored in the document.');
  lines.push('');
  lines.push('### Table row counts');
  lines.push('');
  lines.push('| Table | Rows |');
  lines.push('| --- | ---: |');
  for (const table of status.tables) {
    lines.push(`| ${table.label} (\`${table.table}\`) | ${table.rows} |`);
  }
  lines.push('');
  lines.push('### Last upload by data source');
  lines.push('');
  lines.push('| Data source | Last upload |');
  lines.push('| --- | --- |');
  for (const source of status.sources) {
    lines.push(`| ${source.label} | ${formatUploadTime(source.lastUploadAt)} |`);
  }
  return lines.join('\n');
}

export function buildExportMarkdown(
  markdown: string,
  status: AppDocLiveStatusResponse | null,
): string {
  const liveSection: string = buildLiveStatusMarkdown(status);
  if (!liveSection) {
    return markdown;
  }
  return `${markdown.replace(/\s+$/, '')}\n\n---\n\n${liveSection}\n`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

export function downloadMarkdownFile(content: string, fileName: string): void {
  const blob: Blob = new Blob([content], {
    type: 'text/markdown;charset=utf-8',
  });
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
