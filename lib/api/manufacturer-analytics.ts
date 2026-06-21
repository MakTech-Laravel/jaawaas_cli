import { apiClient } from "./client"
import { getApiErrorMessage } from "./errors"

export interface AnalyticsMetricItem {
  key: string
  label: string
  value: string
  raw_value: number
  change: string
  trend: "up" | "down" | string
}

export interface ManufacturerAnalyticsMetrics {
  period: string
  date_from: string
  date_to: string
  metrics: AnalyticsMetricItem[]
}

export interface GetManufacturerAnalyticsMetricsResponse {
  success: boolean
  message: string
  data: ManufacturerAnalyticsMetrics | null
}

export async function getManufacturerAnalyticsMetrics(params?: { period?: string }): Promise<GetManufacturerAnalyticsMetricsResponse> {
  try {
    const response = await apiClient.get<GetManufacturerAnalyticsMetricsResponse>("/manufacturer/analytics/metrics", { params })
    return {
      success: response.data?.success ?? true,
      message: response.data?.message || "Success",
      data: response.data?.data || null,
    }
  } catch (error) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to fetch manufacturer analytics metrics."),
      data: null,
    }
  }
}
