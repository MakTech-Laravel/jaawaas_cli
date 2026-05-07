"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Award,
  Trash2,
  MoreVertical,
  Plus,
  Edit,
  Search,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  CertificateType,
  getAdminCertificateTypes,
  createAdminCertificateType,
  updateAdminCertificateType,
  deleteAdminCertificateType,
  CreateCertificateTypeInput,
} from "@/lib/api/admin-certificate-types"

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700" },
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
}

export default function AdminCertificateTypePage() {
  const { toast } = useToast()
  const [types, setTypes] = useState<CertificateType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingType, setEditingType] = useState<CertificateType | null>(null)
  const [deletingTypeId, setDeletingTypeId] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const [newType, setNewType] = useState({
    name: "",
    slug: "",
    status: "active" as "active" | "inactive",
  })
  const [editType, setEditType] = useState({
    name: "",
    slug: "",
    status: "active" as "active" | "inactive",
  })

  // Load certificate types on component mount and when page/search changes
  useEffect(() => {
    loadCertificateTypes()
  }, [currentPage, searchQuery])

  const loadCertificateTypes = async (page: number = currentPage, search: string = searchQuery) => {
    setIsLoading(true)
    try {
      const response = await getAdminCertificateTypes(search, page, perPage)
      if (response.success) {
        setTypes(response.data)
        // Update pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.last_page)
          setTotalItems(response.pagination.total)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load certificate types",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteType = async (id: string | number) => {
    setIsSubmitting(true)
    try {
      const response = await deleteAdminCertificateType(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Certificate type deleted successfully",
        })
        // Reload the current page
        await loadCertificateTypes(currentPage, searchQuery)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete certificate type",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setDeletingTypeId(null)
    }
  }

  const addType = async () => {
    if (!newType.name.trim() || !newType.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Ensure status is valid
    const status = (newType.status === "active" || newType.status === "inactive") 
      ? newType.status 
      : "active"

    setIsSubmitting(true)
    try {
      const response = await createAdminCertificateType({
        name: newType.name,
        slug: newType.slug,
        status: status,
      })

      if (response.success) {
        setNewType({ name: "", slug: "", status: "active" })
        setShowAddDialog(false)
        setCurrentPage(1) // Reset to first page
        toast({
          title: "Success",
          description: response.message || "Certificate type created successfully",
        })
        // Reload page 1 to show the new item
        await loadCertificateTypes(1, searchQuery)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create certificate type",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (type: CertificateType) => {
    setEditingType(type)
    setEditType({
      name: type.name,
      slug: type.slug,
      status: type.status,
    })
    setShowEditDialog(true)
  }

  const saveEditType = async () => {
    if (!editingType || !editType.name.trim() || !editType.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Ensure status is valid
    const status = (editType.status === "active" || editType.status === "inactive") 
      ? editType.status 
      : "active"

    setIsSubmitting(true)
    try {
      const response = await updateAdminCertificateType(editingType.id, {
        name: editType.name,
        slug: editType.slug,
        status: status,
      })

      if (response.success) {
        setShowEditDialog(false)
        setEditingType(null)
        toast({
          title: "Success",
          description: response.message || "Certificate type updated successfully",
        })
        // Reload the current page
        await loadCertificateTypes(currentPage, searchQuery)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update certificate type",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Certificate Types</h1>
          <p className="mt-1 text-muted-foreground">
            Manage certification types available for manufacturers
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          Add Certificate Type
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex-1">
              <Label className="text-xs">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Types Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading certificate types...</p>
            </div>
          ) : types.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="px-4 py-3">Name</TableHead>
                      <TableHead className="px-4 py-3">Slug</TableHead>
                      <TableHead className="px-4 py-3 text-center">Status</TableHead>
                      <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type.id} className="border-b hover:bg-muted/50 transition-colors">
                      <TableCell className="px-4 py-3 font-medium">{type.name}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground font-mono">{type.slug}</TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge className={statusConfig[type.status].color}>
                          {statusConfig[type.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(type)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingTypeId(type.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination Controls */}
              <div className="border-t px-4 py-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {types.length > 0 ? (currentPage - 1) * perPage + 1 : 0} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} items
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and adjacent pages
                        if (page === 1 || page === totalPages) return true
                        if (page === currentPage) return true
                        if (Math.abs(page - currentPage) <= 1) return true
                        return false
                      })
                      .map((page, idx, arr) => (
                        <div key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 py-1 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            disabled={isLoading}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No certificate types found</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                Add Certificate Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Certificate Type Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) {
          setNewType({ name: "", slug: "", status: "active" })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certificate Type</DialogTitle>
            <DialogDescription>
              Create a new certificate type for manufacturers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Name *</Label>
              <Input
                placeholder="e.g., ISO 9001:2015"
                value={newType.name}
                onChange={(e) => {
                  const newName = e.target.value
                  setNewType({ ...newType, name: newName, slug: generateSlug(newName) })
                }}
                className="mt-2"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                placeholder="e.g., iso_9001_2015"
                value={newType.slug}
                onChange={(e) => setNewType({ ...newType, slug: e.target.value })}
                className="mt-2"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-generated from the certificate name. You can edit it if needed (lowercase, underscores only)
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newType.status}
                onValueChange={(value) => setNewType({ ...newType, status: value as "active" | "inactive" })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={addType} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Type"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Certificate Type Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) {
          setEditingType(null)
          setEditType({ name: "", slug: "", status: "active" })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Certificate Type</DialogTitle>
            <DialogDescription>
              Update certificate type details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Name *</Label>
              <Input
                placeholder="e.g., ISO 9001:2015"
                value={editType.name}
                onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                className="mt-2"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                placeholder="e.g., iso_9001_2015"
                value={editType.slug}
                onChange={(e) => setEditType({ ...editType, slug: e.target.value })}
                className="mt-2"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                A unique identifier used in the system (lowercase, hyphens or underscores)
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editType.status}
                onValueChange={(value) => setEditType({ ...editType, status: value as "active" | "inactive" })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingType && (
              <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                <p>Created: {editingType.created_at || "N/A"}</p>
                <p>Last Updated: {editingType.updated_at || "N/A"}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={saveEditType} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTypeId} onOpenChange={() => setDeletingTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate Type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this certificate type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTypeId && deleteType(deletingTypeId)}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}