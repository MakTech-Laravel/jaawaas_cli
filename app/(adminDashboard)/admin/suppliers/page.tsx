"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchSuppliers, deleteManufacturer, rejectManufacturer } from "@/lib/api/admin-manufacturer-registrations"
import type { ManufacturerApplication, ManufacturerRegistrationResponse } from "@/lib/api/admin-manufacturer-registrations"
import { getConversations } from "@/lib/api/messages"
import { apiClient } from "@/lib/api/client"
import { 
  Search,
  Factory,
  MoreVertical,
  CheckCircle,
  X,
  Eye,
  Star,
  MapPin,
  Ban,
  MessageSquare,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Mail,
  FileQuestion,
  FileText,
  Globe,
  Camera,
  ExternalLink,
  Building2,
  Loader2
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n"
import { AdminPagination } from "@/components/admin/admin-pagination"
import type { PaginationMeta } from "@/lib/api/admin-manufacturer-registrations"

type SupplierStatus = "draft" | "pending" | "approved" | "rejected" | "suspended" | "needs_info" | "active" | "deactivated"

interface VerificationDocuments {
  businessLicense?: { name: string; uploadedAt: string }
  website?: string
  city: string
  country: string
  factoryPhotos?: { name: string }[]
  additionalNotes?: string
}

interface Supplier extends ManufacturerApplication {
  verification?: string
  submittedAt?: string
  verificationDocs?: VerificationDocuments
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  deactivated: "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
  needs_info: "bg-blue-100 text-blue-700",
}

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  active: "default",
  deactivated: "outline",
  rejected: "destructive",
  suspended: "destructive",
  needs_info: "outline",
}

const PER_PAGE = 10

export default function AdminSuppliersPage() {
  const { t } = useTranslation()
  const p = t.admin.pages.suppliers
  const c = t.admin.common
  const supplierStatus = t.admin.supplierStatus

  const getStatusConfig = (statusKey: string) => {
    const key = statusKey as keyof typeof supplierStatus
    return {
      label: supplierStatus[key] ?? supplierStatus.draft,
      variant: statusVariants[statusKey] ?? "outline",
      color: statusColors[statusKey] ?? statusColors.draft,
    }
  }
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSuppliers, setSelectedSuppliers] = useState<(string | number)[]>([])
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null)
  const [infoRequest, setInfoRequest] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<(string | number) | null>(null)
  const [rejecting, setRejecting] = useState<boolean>(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  // Load suppliers from API
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true)
        const response = await fetchSuppliers(currentPage, PER_PAGE, {
          search: debouncedSearch || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        })
        const filtered = response.data.filter(
          (row) => (row.manufacture_status || row.status) !== "pending",
        )
        setSuppliers(filtered)
        setMeta(response.meta ?? null)
      } catch (err) {
        toast({
          title: c.error,
          description: p.loadFailed,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadSuppliers()
  }, [currentPage, debouncedSearch, statusFilter, toast, p.loadFailed])

  const filteredSuppliers = suppliers

  const allSelected = filteredSuppliers.length > 0 && selectedSuppliers.length === filteredSuppliers.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSuppliers([])
    } else {
      setSelectedSuppliers(filteredSuppliers.map(s => s.id))
    }
  }

  const toggleSelect = (id: string | number) => {
    setSelectedSuppliers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const deleteSupplier = async (supplierId: string | number) => {
    try {
      setDeleting(supplierId)
      await deleteManufacturer(supplierId)
      setSuppliers(prev => prev.filter(s => s.id !== supplierId))
      setSelectedSuppliers(prev => prev.filter(x => x !== supplierId))
      
      toast({
        title: c.success,
        description: p.deleteSuccess,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : p.deleteFailed
      toast({
        title: c.error,
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const bulkDelete = async () => {
    for (const id of selectedSuppliers) {
      await deleteSupplier(id)
    }
    setSelectedSuppliers([])
  }

  const openReview = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setShowReviewDialog(true)
  }

  const openInfoRequest = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setInfoRequest("")
    setShowInfoDialog(true)
  }

  const openReject = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleSendMessageAction = async (supplier: Supplier) => {
    setSendingMessage(true)
    try {
      toast({
        title: p.openingConversation,
        description: p.settingUpChat,
      })
      const adminId = user?.id || 1
      
      // First, check if a conversation already exists with this supplier
      const existingConvs = await getConversations()
      const existingConv = existingConvs.find(c => 
        c.participants.some(p => String(p.id) === String(supplier.id))
      )
      
      if (existingConv) {
        router.push(`/admin/messages?conversation=${existingConv.id}`)
        return
      }

      // If not, create a new one
      const response = await apiClient.post("/conversations", {
        participant_ids: [Number(adminId), Number(supplier.id)]
      })
      const apiData = response.data?.data || response.data
      
      if (apiData && apiData.id) {
        router.push(`/admin/messages?conversation=${apiData.id}`)
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`)
      }
    } catch (error: any) {
      toast({
        title: c.error,
        description: (error.response?.data?.message || JSON.stringify(error.response?.data)) || error.message || p.openConversationFailed,
        variant: "destructive",
      })
      setSendingMessage(false)
    }
  }

  const submitInfoRequest = () => {
    if (currentSupplier) {
      // Mark as needs_info (would need API call in real implementation)
      setShowInfoDialog(false)
      toast({
        title: c.success,
        description: p.infoRequestSent,
      })
    }
  }

  const submitRejection = async () => {
    if (!currentSupplier) return
    if (!rejectReason.trim()) {
      toast({
        title: c.error,
        description: c.rejectReasonRequired,
        variant: "destructive",
      })
      return
    }

    setRejecting(true)
    try {
      await rejectManufacturer(currentSupplier.id, rejectReason)
      setSuppliers(prev => prev.filter(s => s.id !== currentSupplier.id))
      setShowRejectDialog(false)
      toast({
        title: c.success,
        description: p.rejectSuccess,
      })
    } catch (error: any) {
      toast({
        title: c.error,
        description: error.message || p.rejectFailed,
        variant: "destructive",
      })
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">{p.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {p.subtitle}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={c.searchSuppliers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={c.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{c.allStatus}</SelectItem>
              <SelectItem value="draft">{supplierStatus.draft}</SelectItem>
              <SelectItem value="approved">{supplierStatus.approved}</SelectItem>
              <SelectItem value="active">{supplierStatus.active}</SelectItem>
              <SelectItem value="deactivated">{supplierStatus.deactivated}</SelectItem>
              <SelectItem value="rejected">{supplierStatus.rejected}</SelectItem>
              <SelectItem value="suspended">{supplierStatus.suspended}</SelectItem>
              <SelectItem value="needs_info">{supplierStatus.needs_info}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <span className="text-sm font-medium">{c.selectedCount.replace("{count}", String(selectedSuppliers.length))}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={bulkDelete} disabled={deleting !== null}>
              <Trash2 className="mr-1 h-3 w-3" />
              {c.delete}
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedSuppliers([])}>
            {c.clear}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{p.loading}</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{p.noSuppliers}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
          {/* Header Row */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
            <div className="flex-1">{p.tableSupplier}</div>
            <div className="w-32">{c.status}</div>
            <div className="w-24">{c.rating}</div>
            <div className="w-32">{c.actions}</div>
          </div>

          {filteredSuppliers.map((supplier) => {
            const displayName = [supplier.first_name, supplier.last_name].filter(Boolean).join(" ") || "—"
            const displayCompany = supplier.company_name || supplier.company?.company_name || "—"
            const statusKey = (supplier.manufacture_status || supplier.status || "draft").toLowerCase()
            const config = getStatusConfig(statusKey)

            return (
              <div key={supplier.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <Checkbox 
                    checked={selectedSuppliers.includes(supplier.id)} 
                    onCheckedChange={() => toggleSelect(supplier.id)}
                  />
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Factory className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{displayName}</h3>
                      <p className="text-sm text-muted-foreground">{displayCompany}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-32 shrink-0">
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="w-24 shrink-0 text-sm text-muted-foreground">
                    {c.na}
                  </div>

                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openReview(supplier)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {c.viewDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessageAction(supplier)} disabled={sendingMessage}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {sendingMessage ? c.opening : p.sendMessage}
                        </DropdownMenuItem>
                        {/* 
                        <DropdownMenuItem onClick={() => openInfoRequest(supplier)}>
                          <FileQuestion className="mr-2 h-4 w-4 text-blue-600" />
                          Request More Info
                        </DropdownMenuItem>
                        */}
                        <DropdownMenuItem onClick={() => openReject(supplier)}>
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          {c.reject}
                        </DropdownMenuItem>
                        {/*
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4 text-orange-600" />
                          Suspend
                        </DropdownMenuItem>
                        */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteSupplier(supplier.id)}
                          disabled={deleting === supplier.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleting === supplier.id ? c.deleting : c.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })}
          </div>

          <AdminPagination
            page={currentPage}
            meta={meta}
            itemCount={filteredSuppliers.length}
            onPageChange={setCurrentPage}
            className="px-1"
          />
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{p.supplierDetails}</DialogTitle>
            <DialogDescription>
              {p.supplierDetailsDesc}
            </DialogDescription>
          </DialogHeader>
          {currentSupplier && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  <Factory className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {[currentSupplier.first_name, currentSupplier.last_name].filter(Boolean).join(" ")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{currentSupplier.company_name || currentSupplier.company?.company_name}</p>
                </div>
                <Badge className={getStatusConfig((currentSupplier.manufacture_status || currentSupplier.status)?.toLowerCase() || "draft").color}>
                  {getStatusConfig((currentSupplier.manufacture_status || currentSupplier.status)?.toLowerCase() || "draft").label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{c.emailColon}</span>
                  <p className="font-medium">{currentSupplier.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              {c.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{p.requestInfo}</DialogTitle>
            <DialogDescription>
              {p.requestInfoDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{c.message}</Label>
              <Textarea 
                placeholder={c.messagePlaceholder}
                value={infoRequest}
                onChange={(e) => setInfoRequest(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>{c.cancel}</Button>
            <Button onClick={submitInfoRequest}>{p.sendRequest}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {p.rejectSupplier}
            </DialogTitle>
            <DialogDescription>
              {p.rejectSupplierDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{p.reasonForRejection}</Label>
              <Textarea 
                placeholder={c.rejectPlaceholder}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={rejecting}>{c.cancel}</Button>
            <Button variant="destructive" onClick={submitRejection} disabled={rejecting}>
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {c.rejecting}
                </>
              ) : (
                p.rejectSupplierButton
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
