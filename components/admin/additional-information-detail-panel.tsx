"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, MessageSquare, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_INFO_STATUS_LABELS,
  type AdditionalInformationRequest,
  type AdditionalInformationStatus,
} from "@/lib/api/manufacturer-additional-information"

function statusBadgeClass(status: AdditionalInformationStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
    case "submitted":
      return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
    case "expired":
      return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
    default:
      return ""
  }
}

export function AdditionalInfoStatusBadge({ status }: { status: AdditionalInformationStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-semibold", statusBadgeClass(status))}>
      {ADDITIONAL_INFO_STATUS_LABELS[status]}
    </Badge>
  )
}

interface AdditionalInformationDetailPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: AdditionalInformationRequest
}

export default function AdditionalInformationDetailPanel({
  open,
  onOpenChange,
  request,
}: AdditionalInformationDetailPanelProps) {
  const manufacturerName =
    request.manufacturer?.company_name ||
    request.manufacturer?.name ||
    request.manufacturer?.email ||
    "Manufacturer"

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—"
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-3 border-b px-5 pb-5 pt-5 text-left sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold">Information Request</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {manufacturerName}
              </DialogDescription>
            </div>
            <AdditionalInfoStatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2.5 py-1">
              <Clock className="h-3.5 w-3.5" />
              Requested {formatDate(request.created_at)}
            </span>
            {request.submitted_at && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2.5 py-1">
                Submitted {formatDate(request.submitted_at)}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/20 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Admin Message
              </h4>
              <p className="text-sm">{request.message}</p>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requested Types
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {request.allowed_type_labels.map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {request.responses && request.responses.length > 0 ? (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  Submitted Responses
                  <Badge variant="outline">{request.responses.length}</Badge>
                </h4>
                {request.responses.map((response) => (
                  <div
                    key={response.id}
                    className="rounded-lg border bg-card px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{response.type_label}</p>
                        {response.message && (
                          <p className="mt-1 text-sm text-muted-foreground">{response.message}</p>
                        )}
                        {(response.file_url || response.video_url) && (
                          <a
                            href={response.video_url || response.file_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                          >
                            Open attachment
                            {response.original_name ? ` (${response.original_name})` : ""}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-10 text-center">
                <p className="text-sm font-medium">No submission yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The manufacturer has not responded to this request.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
