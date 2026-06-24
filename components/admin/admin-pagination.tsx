"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface AdminPaginationMeta {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  from?: number | null
  to?: number | null
  currentPage?: number
  lastPage?: number
  perPage?: number
}

interface AdminPaginationProps {
  page: number
  meta?: AdminPaginationMeta | null
  itemCount?: number
  onPageChange: (page: number) => void
  className?: string
  showSummary?: boolean
}

function resolveMeta(
  meta: AdminPaginationMeta | null | undefined,
  page: number,
  itemCount: number,
) {
  const currentPage = meta?.current_page ?? meta?.currentPage ?? page
  const lastPage = meta?.last_page ?? meta?.lastPage ?? 1
  const from = meta?.from ?? (itemCount > 0 ? 1 : 0)
  const to = meta?.to ?? itemCount
  const total = meta?.total ?? itemCount

  return { currentPage, lastPage, from, to, total }
}

export function AdminPagination({
  page,
  meta,
  itemCount = 0,
  onPageChange,
  className,
  showSummary = true,
}: AdminPaginationProps) {
  const { t } = useTranslation()
  const c = t.admin.common
  const { currentPage, lastPage, from, to, total } = resolveMeta(meta, page, itemCount)

  if (lastPage <= 1 && total === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showSummary && (
        <div className="text-sm text-muted-foreground">
          {c.showing
            .replace("{from}", String(from ?? 0))
            .replace("{to}", String(to ?? 0))
            .replace("{total}", String(total))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          {c.previous}
        </Button>
        <div className="text-sm text-muted-foreground">
          {c.pageOf
            .replace("{page}", String(currentPage))
            .replace("{lastPage}", String(lastPage))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
        >
          {c.next}
        </Button>
      </div>
    </div>
  )
}
