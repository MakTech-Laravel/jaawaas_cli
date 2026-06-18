"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Video,
  Mic,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { isManufacturerPendingReview } from "@/lib/roles/dashboard-route"
import {
  ADDITIONAL_INFO_STATUS_LABELS,
  ADDITIONAL_INFO_TYPE_LABELS,
  type AdditionalInformationRequest,
  type AdditionalInformationStatus,
  type AdditionalInformationType,
  type SubmitAdditionalInformationItem,
  fetchMyAdditionalInformationRequests,
  fetchPublicAdditionalInformation,
  submitMyAdditionalInformation,
  submitPublicAdditionalInformation,
} from "@/lib/api/manufacturer-additional-information"

const TYPE_ICONS: Record<AdditionalInformationType, React.ElementType> = {
  text: MessageSquare,
  image: ImageIcon,
  video: Video,
  audio: Mic,
  document: FileText,
}

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

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—"
  try {
    return format(new Date(dateStr), "MMM d, yyyy")
  } catch {
    return dateStr
  }
}

interface RequestFormState {
  text: string
  files: Partial<Record<AdditionalInformationType, File | null>>
}

interface AdditionalInformationCenterProps {
  /** Public email-link token; when set, uses unauthenticated API */
  token?: string | null
  /** Standalone layout for /review (pending applicants) */
  variant?: "dashboard" | "standalone"
  companyName?: string
  userEmail?: string
}

export default function AdditionalInformationCenter({
  token = null,
  variant = "dashboard",
  companyName,
  userEmail,
}: AdditionalInformationCenterProps) {
  const { toast } = useToast()
  const { user, token: authToken, isLoading: authLoading, logout } = useAuth()
  const [requests, setRequests] = useState<AdditionalInformationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const [forms, setForms] = useState<Record<number, RequestFormState>>({})

  const canUsePublicApi = Boolean(token?.trim())
  const canUseAuthenticatedApi =
    Boolean(authToken) && user?.role === "manufacturer"

  const loadRequests = useCallback(async () => {
    if (!canUsePublicApi && !canUseAuthenticatedApi) {
      if (authLoading) {
        return
      }
      setRequests([])
      setError(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (canUsePublicApi && token) {
        const item = await fetchPublicAdditionalInformation(token)
        setRequests([item])
      } else {
        const items = await fetchMyAdditionalInformationRequests()
        setRequests(items)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load requests."
      setError(message)
      setRequests([])
      toast({
        title: "Could not load requests",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [token, canUsePublicApi, canUseAuthenticatedApi, authLoading, toast])

  useEffect(() => {
    if (authLoading) {
      return
    }
    void loadRequests()
  }, [loadRequests, authLoading])

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  )
  const completedRequests = useMemo(
    () => requests.filter((r) => r.status !== "pending"),
    [requests]
  )

  const getForm = (requestId: number): RequestFormState =>
    forms[requestId] ?? { text: "", files: {} }

  const updateForm = (requestId: number, patch: Partial<RequestFormState>) => {
    setForms((prev) => ({
      ...prev,
      [requestId]: { ...getForm(requestId), ...patch },
    }))
  }

  const buildResponses = (
    request: AdditionalInformationRequest,
    form: RequestFormState
  ): SubmitAdditionalInformationItem[] => {
    const responses: SubmitAdditionalInformationItem[] = []

    for (const type of request.allowed_types) {
      if (type === "text") {
        const message = form.text.trim()
        if (message) responses.push({ type, message })
        continue
      }

      const file = form.files[type]
      if (file) {
        responses.push(
          type === "video" ? { type, video: file } : { type, file }
        )
      }
    }

    return responses
  }

  const handleSubmit = async (request: AdditionalInformationRequest) => {
    const form = getForm(request.id)
    const responses = buildResponses(request, form)

    if (responses.length === 0) {
      toast({
        title: "Nothing to submit",
        description: "Please fill in at least one requested item.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingId(request.id)
      if (token) {
        await submitPublicAdditionalInformation(token, responses)
      } else {
        await submitMyAdditionalInformation(request.id, responses)
      }

      toast({
        title: "Submitted",
        description: "Your information has been sent to the admin team.",
      })

      setForms((prev) => {
        const next = { ...prev }
        delete next[request.id]
        return next
      })
      await loadRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit.",
        variant: "destructive",
      })
    } finally {
      setSubmittingId(null)
    }
  }

  const renderTypeInput = (request: AdditionalInformationRequest, type: AdditionalInformationType) => {
    const form = getForm(request.id)
    const Icon = TYPE_ICONS[type]

    if (type === "text") {
      return (
        <div key={type} className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {ADDITIONAL_INFO_TYPE_LABELS[type]}
          </Label>
          <Textarea
            value={form.text}
            onChange={(e) => updateForm(request.id, { text: e.target.value })}
            placeholder="Type your response..."
            className="min-h-24 resize-none"
          />
        </div>
      )
    }

    const accept =
      type === "image"
        ? "image/*"
        : type === "video"
          ? "video/*"
          : type === "audio"
            ? "audio/*"
            : type === "document"
              ? ".pdf,.doc,.docx,application/pdf"
              : undefined

    return (
      <div key={type} className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {ADDITIONAL_INFO_TYPE_LABELS[type]}
        </Label>
        <Input
          type="file"
          accept={accept}
          onChange={(e) =>
            updateForm(request.id, {
              files: { ...form.files, [type]: e.target.files?.[0] ?? null },
            })
          }
        />
        {form.files[type] && (
          <p className="text-xs text-muted-foreground">
            Selected: {form.files[type]?.name}
          </p>
        )}
      </div>
    )
  }

  const content = (
    <div className="space-y-6">
      {error && !loading && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:text-left">
            <AlertCircle className="h-8 w-8 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-destructive">Failed to load requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadRequests()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading requests...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            {variant === "standalone" && !canUsePublicApi && !canUseAuthenticatedApi ? (
              <>
                <Clock className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-medium">Sign in to continue</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Sign in with your manufacturer account to see what the admin team needs from you.
                </p>
              </>
            ) : variant === "standalone" && canUseAuthenticatedApi ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-medium">No pending requests</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  When an admin asks for more information, it will appear here for you to submit.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-medium">No requests right now</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  When an admin needs more information, it will appear here.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Action Required</h2>
                <Badge variant="outline">{pendingRequests.length} pending</Badge>
              </div>

              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">Admin Request</CardTitle>
                        <CardDescription className="mt-1">
                          Requested {formatDate(request.created_at)}
                          {request.expires_at && (
                            <> · Expires {formatDate(request.expires_at)}</>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={cn("font-semibold", statusBadgeClass(request.status))}>
                        {ADDITIONAL_INFO_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Message from admin
                      </p>
                      <p className="mt-1 text-sm">{request.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {request.allowed_type_labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      {request.allowed_types.map((type) => renderTypeInput(request, type))}
                    </div>

                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => handleSubmit(request)}
                      disabled={submittingId === request.id}
                    >
                      {submittingId === request.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit Response
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {completedRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Previous Submissions</h2>
              {completedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">{request.message}</CardTitle>
                      <Badge className={cn("font-semibold", statusBadgeClass(request.status))}>
                        {ADDITIONAL_INFO_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      Submitted {formatDate(request.submitted_at || request.created_at)}
                    </CardDescription>
                  </CardHeader>
                  {request.responses && request.responses.length > 0 && (
                    <CardContent className="space-y-2">
                      {request.responses.map((response) => (
                        <div
                          key={response.id}
                          className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                        >
                          <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{response.type_label}</p>
                            {response.message && (
                              <p className="mt-0.5 text-muted-foreground">{response.message}</p>
                            )}
                            {(response.file_url || response.video_url) && (
                              <a
                                href={response.video_url || response.file_url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-block text-xs text-primary hover:underline"
                              >
                                View attachment
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )

  if (variant === "standalone") {
    const displayName =
      companyName ||
      user?.company ||
      user?.name ||
      userEmail ||
      user?.email

    return (
      <div className="min-h-screen bg-linear-to-b from-muted/50 to-muted/20">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">SN</span>
              </div>
              <span className="font-serif text-lg font-medium">SourceNest</span>
            </div>
            <div className="flex items-center gap-3">
              {displayName && (
                <p className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:block">
                  {displayName}
                </p>
              )}
              {(canUsePublicApi || canUseAuthenticatedApi) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => void loadRequests()}
                  disabled={loading}
                  title="Refresh"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              )}
              {user && (
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-medium tracking-tight">Review Center</h1>
            <p className="mt-2 text-muted-foreground">
              Respond to admin requests while your manufacturer account is under review.
            </p>
            {(isManufacturerPendingReview(user?.manufacturerStatus) || !user) && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                Account pending approval
              </div>
            )}
          </div>
          {content}
        </main>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight md:text-3xl">Review Center</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          View and respond to information requests from the admin team.
        </p>
      </div>
      {content}
    </div>
  )
}
