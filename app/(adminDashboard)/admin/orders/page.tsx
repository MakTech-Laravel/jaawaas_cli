"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatOrderDate,
  ORDER_STATUS_FLOW,
} from "@/lib/orders-context"
import { getAdminOrders, getAdminOrderStats, type ApiOrder, type OrderStats } from "@/lib/api/orders"
import { useTranslation } from "@/lib/i18n"
import {
  PackageCheck,
  Package,
  Briefcase,
  Factory,
  User,
  Search,
  DollarSign,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"
import { AdminStatCard } from "@/components/admin/admin-stat-card"
import { AdminPagination } from "@/components/admin/admin-pagination"
import type { OrderMeta } from "@/lib/api/orders"

const statusColors: Record<string, string> = {
  created: "bg-blue-100 text-blue-700",
  "in-production": "bg-amber-100 text-amber-700",
  ready: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function AdminOrdersPage() {
  const { t } = useTranslation()
  const p = t.admin.pages.orders
  const c = t.admin.common
  const orderStatus = t.admin.orderStatus

  const getOrderStatusLabel = (status: string) => {
    const key = status.replace(/-/g, "_") as keyof typeof orderStatus
    return orderStatus[key] ?? status
  }

  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<OrderMeta | null>(null)
  const perPage = 20
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    async function fetchStats() {
      const res = await getAdminOrderStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true)
      const res = await getAdminOrders({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      
      if (res.success) {
        setOrders(res.data)
        setMeta(res.meta ?? null)
      }
      setIsLoading(false)
    }
    
    fetchOrders()
  }, [debouncedSearch, statusFilter, page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-foreground">{p.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {p.subtitle}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AdminStatCard 
            icon={Layers} 
            title={p.totalOrders} 
            value={stats.total} 
            layout="vertical"
            contentClassName="pt-6 pb-6 px-6"
          />
          <AdminStatCard 
            icon={Clock} 
            title={p.activeOrders} 
            value={stats.active} 
            layout="vertical"
            contentClassName="pt-6 pb-6 px-6"
          />
          <AdminStatCard 
            icon={CheckCircle2} 
            title={p.completedOrders} 
            value={stats.completed} 
            layout="vertical"
            contentClassName="pt-6 pb-6 px-6"
          />
          <AdminStatCard 
            icon={DollarSign} 
            title={p.totalValue} 
            value={formatCurrency(stats.totalValue, "USD")} 
            layout="vertical"
            contentClassName="pt-6 pb-6 px-6"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.searchOrders}
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{orderStatus.all}</option>
            {ORDER_STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {getOrderStatusLabel(s)}
              </option>
            ))}
            <option value="cancelled">{orderStatus.cancelled}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{p.tableId}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{p.tableTitle}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden md:table-cell">{p.tableBuyer}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">{p.tableSeller}</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground hidden sm:table-cell">{p.tableValue}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{p.tableStatus}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden xl:table-cell">{p.tableCreated}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <PackageCheck className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">{p.noMatching}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  return (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-foreground">{o.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              "bg-primary/10 text-primary",
                            )}
                          >
                            <Package className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{o.title}</p>
                            <p className="text-xs text-muted-foreground">{c.productOrder}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate" title={o.buyerEmail}>{o.buyerCompany || o.buyerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Factory className="h-3 w-3" />
                          <span className="truncate">{o.manufacturerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground hidden sm:table-cell">
                        {formatCurrency(o.totalAmount, o.currencyCode)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[o.status] || statusColors.created} variant="secondary">
                          {getOrderStatusLabel(o.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">
                        {formatOrderDate(o.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          <div className="border-t border-border px-4 py-3">
            <AdminPagination
              page={page}
              meta={meta}
              itemCount={orders.length}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

