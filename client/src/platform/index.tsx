/**
 * Local replacement for `@lark-apaas/client-toolkit`.
 *
 * The original app ran inside Feishu 妙搭, whose runtime injected logging,
 * user identity, file storage, an authenticated axios instance for the NestJS
 * backend and an Ant Design table wrapper. This shim keeps the same import
 * surface so page code is untouched, answers API calls from the in-browser
 * backend, and refuses the platform-only pieces (file storage, sign-in) with
 * an explicit notice. Aliased in vite.config.ts and tsconfig.app.json.
 */
import React, { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEMO_USER_NAME, NOT_AVAILABLE } from '@/lib/brand'
import { BackendError, handleRequest, type HttpMethod } from './backend'

// ---- logger ----
const tag = '[demo]'
export const logger = {
  info: (...a: unknown[]) => console.info(tag, ...a),
  warn: (...a: unknown[]) => console.warn(tag, ...a),
  error: (...a: unknown[]) => console.error(tag, ...a),
  debug: (...a: unknown[]) => console.debug(tag, ...a),
}

// ---- current user ----
export interface IUserProfile {
  user_id?: string
  name?: string
  email?: string
  avatar?: string
}
export const DEMO_USER: IUserProfile = { user_id: 'demo-user', name: DEMO_USER_NAME }
export const useCurrentUserProfile = (): Partial<IUserProfile> => DEMO_USER
export const getCurrentUserProfile = async () => DEMO_USER

// ---- file storage (dataloom) ----
// Uploads needed the platform's object storage and the server-side parsers for
// each supplier's export format. Neither exists here, so the upload cards get
// a clear refusal rather than a fake success.
export const getDefaultBucketId = (): string => 'demo-bucket'

interface UploadResult {
  data: { download_url: string } | null
  error: { message: string } | null
}
const storageNotAvailable = async (_file: File): Promise<UploadResult> => {
  throw new Error(`File upload: ${NOT_AVAILABLE}`)
}

export const getDataloom = async () => ({
  storage: {
    from: (_bucket: string) => ({ uploadFile: storageNotAvailable }),
  },
  service: {
    session: {
      signOut: async () => ({ error: { message: NOT_AVAILABLE } }),
      redirectToLogin: () => {
        window.alert(`Sign in: ${NOT_AVAILABLE}`)
      },
    },
  },
})

export const getEnv = () => ({ NODE_ENV: 'demo' })

// ---- links ----
export interface UniversalLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string
}
export const UniversalLink = forwardRef<HTMLAnchorElement, UniversalLinkProps>(function UniversalLink(
  { to = '', children, ...rest },
  ref,
) {
  if (/^(https?:|mailto:|data:|blob:)/.test(to)) {
    return (
      <a ref={ref} href={to} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link ref={ref} to={to} {...rest}>
      {children}
    </Link>
  )
})

// ---- app shell ----
export const AppContainer: React.FC<{ children?: ReactNode; defaultTheme?: string }> = ({ children }) => (
  <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
)

export const ErrorRender: React.FC<{ error: unknown; resetErrorBoundary?: (...args: unknown[]) => void }> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="p-8 font-sans">
    <h2 className="text-lg font-semibold">Something went wrong</h2>
    <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
      {error instanceof Error ? error.message : String(error)}
    </pre>
    {resetErrorBoundary && (
      <button type="button" className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => resetErrorBoundary()}>
        Retry
      </button>
    )}
  </div>
)

export const NotFoundRender: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background font-sans">
    <p className="text-4xl font-semibold text-foreground">404</p>
    <p className="text-sm text-muted-foreground">Page not found</p>
    <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
      Back to dashboard
    </Link>
  </div>
)

// ---- backend axios ----
// Same call shape as the platform's authenticated axios instance; requests are
// answered by the in-browser backend instead of the NestJS server.
interface AxiosLikeResponse<T> {
  data: T
}
interface AxiosLikeConfig {
  url?: string
  method?: string
  data?: unknown
  params?: Record<string, unknown>
  responseType?: string
}

async function request<T>(method: HttpMethod, url: string, body?: unknown, config?: AxiosLikeConfig): Promise<AxiosLikeResponse<T>> {
  const params = Object.fromEntries(
    Object.entries(config?.params ?? {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)]),
  )
  try {
    const data = await handleRequest(method, url, body, { params })
    return { data: data as T }
  } catch (err: unknown) {
    if (err instanceof BackendError) logger.warn(`${method.toUpperCase()} ${url} → ${err.response.status} ${err.message}`)
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- axios(config) resolves to AxiosResponse<any>
type Callable = <T = any>(config: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
interface AxiosLike extends Callable {
  get: <T = unknown>(url: string, config?: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
  post: <T = unknown>(url: string, body?: unknown, config?: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
  put: <T = unknown>(url: string, body?: unknown, config?: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
  patch: <T = unknown>(url: string, body?: unknown, config?: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
  delete: <T = unknown>(url: string, config?: AxiosLikeConfig) => Promise<AxiosLikeResponse<T>>
}

const callable: Callable = (config) =>
  request(((config.method ?? 'get').toLowerCase() as HttpMethod), config.url ?? '', config.data, config)

export const axiosForBackend: AxiosLike = Object.assign(callable, {
  get: <T,>(url: string, config?: AxiosLikeConfig) => request<T>('get', url, undefined, config),
  post: <T,>(url: string, body?: unknown, config?: AxiosLikeConfig) => request<T>('post', url, body, config),
  put: <T,>(url: string, body?: unknown, config?: AxiosLikeConfig) => request<T>('put', url, body, config),
  patch: <T,>(url: string, body?: unknown, config?: AxiosLikeConfig) => request<T>('patch', url, body, config),
  delete: <T,>(url: string, config?: AxiosLikeConfig) => request<T>('delete', url, undefined, config),
})

// ---- antd-table ----
// The platform re-exported Ant Design's Table. The pages use a small subset of
// its API (columns with dataIndex/render/width/align, rowKey, loading,
// locale.emptyText, scroll); this renders that subset with the shadcn table.
export interface TableColumnType<T> {
  title?: ReactNode
  dataIndex?: keyof T | string
  key?: string
  width?: number | string
  align?: 'left' | 'right' | 'center'
  render?: (value: any, record: T, index: number) => ReactNode // eslint-disable-line @typescript-eslint/no-explicit-any
}
export type TableColumnsType<T> = TableColumnType<T>[]

export interface TableProps<T> {
  columns: TableColumnsType<T>
  dataSource: T[]
  rowKey?: keyof T | ((record: T) => string)
  loading?: boolean
  size?: 'small' | 'middle' | 'large'
  pagination?: false | Record<string, unknown>
  scroll?: { x?: number | string; y?: number | string }
  locale?: { emptyText?: ReactNode }
  className?: string
}

const ALIGN: Record<NonNullable<TableColumnType<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

export function Table<T extends object>({ columns, dataSource, rowKey = 'id' as keyof T, loading, scroll, locale, className }: TableProps<T>) {
  const keyOf = (record: T, index: number): string =>
    typeof rowKey === 'function' ? rowKey(record) : String((record as Record<string, unknown>)[rowKey as string] ?? index)
  const minWidth = typeof scroll?.x === 'number' ? `${scroll.x}px` : scroll?.x
  const maxHeight = typeof scroll?.y === 'number' ? `${scroll.y}px` : scroll?.y

  return (
    <div className={className} style={{ maxHeight, overflowY: maxHeight ? 'auto' : undefined }}>
      <UiTable style={{ minWidth }}>
        <TableHeader className="bg-accent/60">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={col.key ?? String(col.dataIndex ?? i)}
                style={{ width: col.width }}
                className={`h-11 whitespace-nowrap font-semibold ${ALIGN[col.align ?? 'left']}`}
              >
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && dataSource.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : dataSource.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {locale?.emptyText ?? <span className="text-sm text-muted-foreground">No data</span>}
              </TableCell>
            </TableRow>
          ) : (
            dataSource.map((record, rowIndex) => (
              <TableRow key={keyOf(record, rowIndex)} className={loading ? 'opacity-60' : undefined}>
                {columns.map((col, i) => {
                  const value = col.dataIndex !== undefined ? (record as Record<string, unknown>)[col.dataIndex as string] : undefined
                  return (
                    <TableCell key={col.key ?? String(col.dataIndex ?? i)} className={`h-12 ${ALIGN[col.align ?? 'left']}`}>
                      {col.render ? col.render(value, record, rowIndex) : (value as ReactNode)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </UiTable>
    </div>
  )
}

export { Toaster }
