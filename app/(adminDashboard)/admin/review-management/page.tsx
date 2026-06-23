"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  ScanEye,
  Shield,
  Camera,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  ReviewRequest,
  ReviewRequestStatus,
} from "@/lib/api/admin-reviews"
import {
  fetchAllReviewRequests,
} from "@/lib/api/admin-reviews"
import { useTranslation } from "@/lib/i18n"
import ReviewSubmissionsPanel, {
  ReviewStatusBadge,
} from "@/components/admin/review-submissions-panel"

const PER_PAGE = 10

export default function ReviewManagementPage() {
  const { t } = useTranslation()
  const p = t.admin.pages.reviewManagement
  const c = t.admin.common
  const rs = t.admin.reviewStatus
  const rt = t.admin.reviewType
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Panel state
  const [selectedReview, setSelectedReview] = useState<ReviewRequest | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      const filterStatus = statusFilter === "all" ? undefined : (statusFilter as ReviewRequestStatus)
      const response = await fetchAllReviewRequests(currentPage, PER_PAGE, filterStatus)
      setReviews(response.data || [])
      if (response.meta) {
        setTotalPages(response.meta.last_page)
        setTotalItems(response.meta.total)
      }
    } catch {
      toast({
        title: c.error,
        description: p.loadFailed,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, toast])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const openPanel = (review: ReviewRequest) => {
    setSelectedReview(review)
    setPanelOpen(true)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    try {
      return format(new Date(dateStr), "MMM d, yyyy")
    } catch {
      return dateStr
    }
  }

  const statusOptions: { value: string; label: string }[] = [
    { value: "all", label: c.allStatuses },
    { value: "pending", label: rs.pending },
    { value: "submitted", label: rs.submitted },
    { value: "approved", label: rs.approved },
    { value: "rejected", label: rs.rejected },
    { value: "re_requested", label: rs.re_requested },
    { value: "completed", label: rs.completed },
  ]

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {p.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            {p.subtitle}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={p.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 font-medium text-foreground">{c.loading}</p>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ScanEye className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-medium text-foreground">{p.noRequests}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? p.noReviewsWithStatus.replace(
                    "{status}",
                    rs[statusFilter as keyof typeof rs] || statusFilter
                  )
                : c.noReviewRequestsYet}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden sm:block lg:px-6">
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <Table className="min-w-[700px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">{p.tableManufacturer}</TableHead>
                    <TableHead className="w-[18%]">{p.tableReviewType}</TableHead>
                    <TableHead className="w-[12%]">{p.tableReviewCode}</TableHead>
                    <TableHead className="w-[10%]">{p.tableStatus}</TableHead>
                    <TableHead className="w-[12%]">{p.tableRequested}</TableHead>
                    <TableHead className="w-[12%] text-right">{p.tableAreas}</TableHead>
                    <TableHead className="w-[8%] text-right">{p.tableActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={String(review.id)} className="group">
                      <TableCell className="align-top">
                        <div className="flex items-start gap-2">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-sm leading-snug">
                              {review.company_name || review.manufacturer_name || "—"}
                            </p>
                            {review.manufacturer_email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {review.manufacturer_email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Camera className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {rt[review.review_type as keyof typeof rt] || review.review_type}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-secondary" />
                          <span className="font-mono text-sm font-bold text-secondary">
                            {review.review_code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <ReviewStatusBadge status={review.status} />
                      </TableCell>
                      <TableCell className="align-top whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Badge variant="outline" className="text-xs">
                          {review.requested_areas.length === 1
                            ? c.areasCount.replace("{count}", "1")
                            : c.areasCountPlural.replace("{count}", String(review.requested_areas.length))}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openPanel(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {reviews.map((review) => (
              <Card key={String(review.id)}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-snug">
                        {review.company_name || review.manufacturer_name || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rt[review.review_type as keyof typeof rt] || review.review_type}
                      </p>
                    </div>
                    <ReviewStatusBadge status={review.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-md bg-secondary/5 border border-secondary/10 px-2 py-1">
                      <Shield className="h-3 w-3 text-secondary" />
                      <span className="font-mono text-xs font-bold text-secondary">
                        {review.review_code}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      <Clock className="mr-0.5 inline h-3 w-3" />
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openPanel(review)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {c.viewDetails}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalItems === 1
                ? c.reviewsTotal.replace("{count}", String(totalItems))
                : c.reviewsTotalPlural.replace("{count}", String(totalItems))}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {c.pageOf.replace("{page}", String(currentPage)).replace("{lastPage}", String(totalPages))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Review submissions detail panel */}
      {selectedReview && (
        <ReviewSubmissionsPanel
          open={panelOpen}
          onOpenChange={(o) => {
            setPanelOpen(o)
            if (!o) setSelectedReview(null)
          }}
          review={selectedReview}
          onStatusChange={loadReviews}
        />
      )}
    </div>
  )
}
