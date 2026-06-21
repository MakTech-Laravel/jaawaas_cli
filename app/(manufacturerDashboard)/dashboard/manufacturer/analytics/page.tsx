"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  FileText,
  Users,
  Globe,
  BarChart3,
  Package
} from "lucide-react"
import { getManufacturerAnalyticsMetrics, AnalyticsMetricItem } from "@/lib/api/manufacturer-analytics"
import ManufacturerStatCard from "@/components/manufacturer/manufacturer-stat-card"

const metricIcons: Record<string, React.ComponentType<any>> = {
  profile_views: Eye,
  inquiries_received: FileText,
  messages: MessageSquare,
  quote_requests: Package,
}

const periodApiMap: Record<string, string> = {
  "7": "last_7_days",
  "30": "last_30_days",
  "90": "last_90_days",
  "365": "last_year"
}

const topProducts = [
  { name: "TWS Wireless Earbuds Pro", views: 1234, inquiries: 45 },
  { name: "Smart Fitness Tracker V3", views: 987, inquiries: 38 },
  { name: "Bluetooth Speaker 20W", views: 756, inquiries: 29 },
  { name: "USB-C Fast Charger 65W", views: 654, inquiries: 24 },
  { name: "Wireless Mouse Ergonomic", views: 543, inquiries: 18 },
]

const topCountries = [
  { country: "United States", flag: "US", percentage: 35 },
  { country: "Germany", flag: "DE", percentage: 18 },
  { country: "United Kingdom", flag: "GB", percentage: 15 },
  { country: "Australia", flag: "AU", percentage: 12 },
  { country: "Canada", flag: "CA", percentage: 10 },
  { country: "Other", flag: "OT", percentage: 10 },
]

export default function ManufacturerAnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetricItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  const loadAnalytics = useCallback(async (selectedPeriod: string) => {
    try {
      setIsLoading(true)
      const apiPeriod = periodApiMap[selectedPeriod] || "last_30_days"
      const res = await getManufacturerAnalyticsMetrics({ period: apiPeriod })
      if (res.success && res.data?.metrics) {
        setMetrics(res.data.metrics)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics(period)
  }, [period, loadAnalytics])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your performance and buyer engagement
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="h-5 w-12 rounded bg-muted" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-8 w-20 rounded bg-muted" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric) => {
            const Icon = metricIcons[metric.key] || Eye
            return (
              <ManufacturerStatCard
                key={metric.key}
                title={metric.label}
                value={metric.value}
                icon={Icon}
                iconClassName="text-muted-foreground"
                iconWrapperClassName="bg-muted"
                trend={{
                  value: metric.change,
                  direction: metric.trend
                }}
              />
            )
          })
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted/50">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">
                  Chart visualization would appear here
                </p>
                <p className="text-sm text-muted-foreground">
                  Showing inquiries, messages, and views over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.views.toLocaleString()} views • {product.inquiries} inquiries
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Buyer Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((item) => (
                <div key={item.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.country}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">2,847</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">423</p>
                <p className="text-sm text-muted-foreground">Messages Started</p>
                <p className="text-xs text-secondary">14.9% conversion</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-sm text-muted-foreground">Quotes Sent</p>
                <p className="text-xs text-secondary">21.0% conversion</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">34</p>
                <p className="text-sm text-muted-foreground">Orders Received</p>
                <p className="text-xs text-secondary">38.2% conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
