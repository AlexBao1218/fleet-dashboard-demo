import { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { headingId } from './about-helpers';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface DocMarkdownProps {
  markdown: string;
  registerHeading?: (id: string, element: HTMLElement | null) => void;
}

const DocMarkdown = ({ markdown, registerHeading }: DocMarkdownProps) => {
  const counterRef = useRef<number>(0);
  counterRef.current = 0;

  const components = useMemo(
    () => ({
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mb-4 mt-2 font-heading text-2xl font-semibold text-foreground">
          {children}
        </h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => {
        const id: string = headingId(counterRef.current);
        counterRef.current += 1;
        return (
          <h2
            id={id}
            ref={(el: HTMLElement | null) => {
              if (registerHeading) {
                registerHeading(id, el);
              }
            }}
            className="mb-3 mt-8 scroll-mt-24 border-b border-border pb-2 font-heading text-xl font-semibold text-foreground"
          >
            {children}
          </h2>
        );
      },
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="mb-2 mt-6 font-heading text-base font-semibold text-foreground">
          {children}
        </h3>
      ),
      h4: ({ children }: { children?: React.ReactNode }) => (
        <h4 className="mb-2 mt-4 text-sm font-semibold text-foreground">
          {children}
        </h4>
      ),
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-3 text-sm leading-6 text-foreground">{children}</p>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
          {children}
        </ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-foreground">
          {children}
        </ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-6">{children}</li>
      ),
      hr: () => <hr className="my-4 border-border" />,
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <UniversalLink
          to={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          {children}
        </UniversalLink>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="mb-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">
          {children}
        </blockquote>
      ),
      code: ({
        children,
        className,
      }: {
        children?: React.ReactNode;
        className?: string;
      }) => {
        const isBlock: boolean = (className ?? '').includes('language-');
        if (isBlock) {
          return (
            <code
              className="block overflow-x-auto rounded-md border border-border bg-accent p-3 font-mono text-xs leading-5 text-foreground"
            >
              {children}
            </code>
          );
        }
        return (
          <code className="rounded bg-accent px-1 py-0.5 font-mono text-xs text-foreground">
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => (
        <pre className="mb-3">{children}</pre>
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }: { children?: React.ReactNode }) => (
        <thead className="bg-accent">{children}</thead>
      ),
      th: ({ children }: { children?: React.ReactNode }) => (
        <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
          {children}
        </th>
      ),
      td: ({ children }: { children?: React.ReactNode }) => (
        <td className="border border-border px-3 py-2 align-top leading-5 text-foreground">
          {children}
        </td>
      ),
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),
    }),
    [registerHeading],
  );

  return (
    <div className="w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default DocMarkdown;
