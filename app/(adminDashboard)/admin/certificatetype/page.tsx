"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
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
  Search
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CertificateType {
  id: string
  name: string
  description: string
  category: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  usageCount: number
}

const categories = ["ISO", "Quality Management", "Environmental", "Safety", "Food & Agriculture", "Regulatory", "Industry Specific", "Other"]

const initialTypes: CertificateType[] = [
  { id: "1", name: "ISO 9001:2015", description: "Quality Management System", category: "ISO", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 45 },
  { id: "2", name: "ISO 14001:2015", description: "Environmental Management System", category: "ISO", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 32 },
  { id: "3", name: "ISO 45001", description: "Occupational Health & Safety", category: "ISO", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 28 },
  { id: "4", name: "CE Certification", description: "EU Conformity Assessment", category: "Regulatory", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 56 },
  { id: "5", name: "RoHS Compliance", description: "Restriction of Hazardous Substances", category: "Regulatory", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 41 },
  { id: "6", name: "BSCI Audit", description: "Business Social Compliance Initiative", category: "Quality Management", status: "active", createdAt: "2024-01-15", updatedAt: "2024-01-15", usageCount: 23 },
  { id: "7", name: "FDA Registration", description: "US Food & Drug Administration", category: "Food & Agriculture", status: "active", createdAt: "2024-01-20", updatedAt: "2024-01-20", usageCount: 19 },
  { id: "8", name: "REACH Compliance", description: "EU Chemical Regulations", category: "Regulatory", status: "inactive", createdAt: "2024-01-15", updatedAt: "2024-02-01", usageCount: 8 },
]

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700" },
}

export default function AdminCertificateTypePage() {
  const [types, setTypes] = useState<CertificateType[]>(initialTypes)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingType, setEditingType] = useState<CertificateType | null>(null)
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [newType, setNewType] = useState({
    name: "",
    description: "",
    category: "",
    status: "active" as "active" | "inactive",
  })
  const [editType, setEditType] = useState({
    name: "",
    description: "",
    category: "",
    status: "active" as "active" | "inactive",
  })

  const deleteType = (id: string) => {
    setTypes(prev => prev.filter(t => t.id !== id))
    setDeletingTypeId(null)
  }

  const addType = () => {
    if (newType.name && newType.category) {
      const now = new Date().toISOString().split('T')[0]
      setTypes(prev => [{
        id: `type-${Date.now()}`,
        name: newType.name,
        description: newType.description,
        category: newType.category,
        status: newType.status,
        createdAt: now,
        updatedAt: now,
        usageCount: 0
      }, ...prev])
      setNewType({ name: "", description: "", category: "", status: "active" })
      setShowAddDialog(false)
    }
  }

  const openEditDialog = (type: CertificateType) => {
    setEditingType(type)
    setEditType({
      name: type.name,
      description: type.description,
      category: type.category,
      status: type.status,
    })
    setShowEditDialog(true)
  }

  const saveEditType = () => {
    if (editingType && editType.name && editType.category) {
      const now = new Date().toISOString().split('T')[0]
      setTypes(prev => prev.map(t =>
        t.id === editingType.id
          ? { ...t, ...editType, updatedAt: now }
          : t
      ))
      setShowEditDialog(false)
      setEditingType(null)
    }
  }

  const filteredTypes = types.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || type.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Certificate Types</h1>
          <p className="mt-1 text-muted-foreground">
            Manage certification types available for manufacturers
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
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
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-xs">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Types Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTypes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="px-4 py-3">Name</TableHead>
                    <TableHead className="px-4 py-3">Description</TableHead>
                    <TableHead className="px-4 py-3">Category</TableHead>
                    <TableHead className="px-4 py-3 text-right">Usage</TableHead>
                    <TableHead className="px-4 py-3 text-center">Status</TableHead>
                    <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTypes.map((type) => (
                    <TableRow key={type.id} className="border-b hover:bg-muted/50 transition-colors">
                      <TableCell className="px-4 py-3 font-medium">{type.name}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">{type.description}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline">{type.category}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-medium">{type.usageCount}</TableCell>
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
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certificate Type</DialogTitle>
            <DialogDescription>
              Create a new certificate type for manufacturers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Name</Label>
              <Input
                placeholder="e.g., ISO 9001:2015"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the certificate"
                value={newType.description}
                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newType.category}
                onValueChange={(value) => setNewType({ ...newType, category: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newType.status}
                onValueChange={(value) => setNewType({ ...newType, status: value as "active" | "inactive" })}
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={addType}>Add Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Certificate Type Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Certificate Type</DialogTitle>
            <DialogDescription>
              Update certificate type details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Name</Label>
              <Input
                placeholder="e.g., ISO 9001:2015"
                value={editType.name}
                onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of the certificate"
                value={editType.description}
                onChange={(e) => setEditType({ ...editType, description: e.target.value })}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editType.category}
                onValueChange={(value) => setEditType({ ...editType, category: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editType.status}
                onValueChange={(value) => setEditType({ ...editType, status: value as "active" | "inactive" })}
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
              <div className="text-sm text-muted-foreground space-y-1 pt-2">
                <p>Created: {editingType.createdAt}</p>
                <p>Last Updated: {editingType.updatedAt}</p>
                <p>Usage Count: {editingType.usageCount}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={saveEditType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTypeId} onOpenChange={() => setDeletingTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate Type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this certificate type. Existing certificates using this type will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTypeId && deleteType(deletingTypeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}