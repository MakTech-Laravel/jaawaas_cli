"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  FileSearch,
  ScanEye,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ManufacturerApplication } from "@/lib/api/admin-manufacturer-registrations"
import {
  createAdditionalInformationRequest,
  ADDITIONAL_INFO_TYPE_LABELS,
  type AdditionalInformationType,
} from "@/lib/api/manufacturer-additional-information"

interface RequestReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manufacturer: ManufacturerApplication
}

const TYPE_OPTIONS: {
  value: AdditionalInformationType
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    value: "text",
    label: ADDITIONAL_INFO_TYPE_LABELS.text,
    description: "Written explanation or clarification",
    icon: MessageSquare,
  },
  {
    value: "image",
    label: ADDITIONAL_INFO_TYPE_LABELS.image,
    description: "Photos of facilities, products, or documents",
    icon: ImageIcon,
  },
  {
    value: "video",
    label: ADDITIONAL_INFO_TYPE_LABELS.video,
    description: "Factory walkthrough or process video",
    icon: Video,
  },
  {
    value: "audio",
    label: ADDITIONAL_INFO_TYPE_LABELS.audio,
    description: "Voice note or audio explanation",
    icon: Mic,
  },
  {
    value: "document",
    label: ADDITIONAL_INFO_TYPE_LABELS.document,
    description: "PDF, license, certificate, or other files",
    icon: FileText,
  },
]

export default function RequestReviewDialog({
  open,
  onOpenChange,
  manufacturer,
}: RequestReviewDialogProps) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [allowedTypes, setAllowedTypes] = useState<AdditionalInformationType[]>([
    "text",
    "document",
  ])

  const toggleType = (type: AdditionalInformationType) => {
    setAllowedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please describe what you need from the manufacturer.",
        variant: "destructive",
      })
      return
    }

    if (allowedTypes.length === 0) {
      toast({
        title: "Select response types",
        description: "Choose at least one type of information the manufacturer can submit.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await createAdditionalInformationRequest(manufacturer.id, {
        message: message.trim(),
        allowed_types: allowedTypes,
      })

      toast({
        title: "Request sent",
        description: `The manufacturer will see this in their Review Center and receive an email.`,
      })

      setMessage("")
      setAllowedTypes(["text", "document"])
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const companyName =
    manufacturer.company_name?.trim() ||
    [manufacturer.first_name, manufacturer.last_name].filter(Boolean).join(" ") ||
    manufacturer.email

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogHeader className="shrink-0 space-y-3 border-b border-border bg-linear-to-r from-secondary/5 to-transparent px-5 pb-5 pt-5 text-left sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-secondary/20 to-secondary/10 shadow-sm">
              <ScanEye className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold leading-tight">
                Request More Information
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Ask <span className="font-medium text-foreground">{companyName}</span> to submit
                additional details for review.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Message to manufacturer *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what you need — e.g. updated business license, factory photos..."
                className="min-h-28 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Allowed response types *</Label>
              <div className="grid gap-2">
                {TYPE_OPTIONS.map((option) => {
                  const selected = allowedTypes.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                        selected
                          ? "border-secondary/30 bg-secondary/5"
                          : "border-border hover:bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleType(option.value)}
                        className="mt-0.5 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{option.label}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200/60 bg-blue-50/50 px-4 py-3 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <p className="font-semibold">Where this appears:</p>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5">
                <li>
                  Pending applicants sign in and land on <strong>/review</strong> to respond
                </li>
                <li>
                  Approved manufacturers use <strong>Review Center</strong> in the dashboard
                </li>
                <li>You can track all requests in <strong>Review Management</strong></li>
                <li>An email with a submission link is also sent</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FileSearch className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
