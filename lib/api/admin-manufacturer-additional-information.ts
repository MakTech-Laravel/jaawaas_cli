import { apiClient } from "./client"
import type {
  AdditionalInformationRequest,
  AdditionalInformationResponseType,
} from "./manufacturer-additional-information"

function normalizeAdditionalInformationRequest(raw: unknown): AdditionalInformationRequest | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const record = raw as Record<string, unknown>
  if (typeof record.id !== "number" && typeof record.id !== "string") {
    return null
  }

  return raw as AdditionalInformationRequest
}

export async function createManufacturerAdditionalInformationRequest(
  manufacturerId: number | string,
  payload: {
    message: string
    allowed_types: AdditionalInformationResponseType[]
  }
): Promise<{ success: boolean; message: string; data?: AdditionalInformationRequest }> {
  const response = await apiClient.post(
    `/admin/manufacturer/${manufacturerId}/additional-information`,
    payload
  )

  const body = response.data as {
    success?: boolean
    message?: string
    data?: unknown
  }

  return {
    success: body.success !== false,
    message: typeof body.message === "string" ? body.message : "Request sent.",
    data: normalizeAdditionalInformationRequest(body.data) ?? undefined,
  }
}

export async function fetchManufacturerAdditionalInformationRequests(
  manufacturerId: number | string
): Promise<AdditionalInformationRequest[]> {
  const response = await apiClient.get(
    `/admin/manufacturer/${manufacturerId}/additional-information`
  )

  const data = (response.data as { data?: unknown })?.data ?? response.data
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .map((item) => normalizeAdditionalInformationRequest(item))
    .filter((item): item is AdditionalInformationRequest => item !== null)
}
