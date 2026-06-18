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
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Filter,
} from "lucide-react"
import {
  fetchAllAdditionalInformationRequests,
  fetchAdditionalInformationRequest,
  ADDITIONAL_INFO_STATUS_LABELS,
  type AdditionalInformationRequest,
  type AdditionalInformationStatus,
} from "@/lib/api/manufacturer-additional-information"
import AdditionalInformationDetailPanel, {
  AdditionalInfoStatusBadge,
} from "@/components/admin/additional-information-detail-panel"

const PER_PAGE = 10

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "expired", label: "Expired" },
]

export default function ReviewManagementPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<AdditionalInformationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<AdditionalInformationRequest | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true)
      const filterStatus =
        statusFilter === "all" ? undefined : (statusFilter as AdditionalInformationStatus)
      const response = await fetchAllAdditionalInformationRequests(
        currentPage,
        PER_PAGE,
        filterStatus
      )
      setRequests(response.data || [])
      if (response.meta) {
        setTotalPages(response.meta.last_page)
        setTotalItems(response.meta.total)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load information requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, toast])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const openPanel = async (request: AdditionalInformationRequest) => {
    try {
      const detail = await fetchAdditionalInformationRequest(request.id)
      setSelectedRequest(detail)
      setPanelOpen(true)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load request details.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—"
    try {
      return format(new Date(dateStr), "MMM d, yyyy")
    } catch {
      return dateStr
    }
  }

  const manufacturerLabel = (request: AdditionalInformationRequest) =>
    request.manufacturer?.company_name ||
    request.manufacturer?.name ||
    request.manufacturer?.email ||
    "—"

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Review Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
            Track admin information requests and manufacturer submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
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
            <p className="mt-4 font-medium text-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ScanEye className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-medium text-foreground">No information requests</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? `No requests with status "${ADDITIONAL_INFO_STATUS_LABELS[statusFilter as AdditionalInformationStatus] || statusFilter}".`
                : "Create a request from the Manufacturer Registrations page when you need more from an applicant."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden sm:block lg:px-6">
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <Table className="min-w-[700px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[22%]">Manufacturer</TableHead>
                    <TableHead className="w-[30%]">Message</TableHead>
                    <TableHead className="w-[14%]">Requested Types</TableHead>
                    <TableHead className="w-[10%]">Status</TableHead>
                    <TableHead className="w-[12%]">Requested</TableHead>
                    <TableHead className="w-[8%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-2">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium leading-snug">
                              {manufacturerLabel(request)}
                            </p>
                            {request.manufacturer?.email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {request.manufacturer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {request.message}
                        </p>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1">
                          {request.allowed_type_labels.slice(0, 2).map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                          {request.allowed_type_labels.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{request.allowed_type_labels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <AdditionalInfoStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="align-top whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openPanel(request)}
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

          <div className="flex flex-col gap-3 sm:hidden">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">
                        {manufacturerLabel(request)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {request.message}
                      </p>
                    </div>
                    <AdditionalInfoStatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(request.created_at)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openPanel(request)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalItems} request{totalItems !== 1 && "s"} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedRequest && (
        <AdditionalInformationDetailPanel
          open={panelOpen}
          onOpenChange={(o) => {
            setPanelOpen(o)
            if (!o) setSelectedRequest(null)
          }}
          request={selectedRequest}
        />
      )}
    </div>
  )
}
