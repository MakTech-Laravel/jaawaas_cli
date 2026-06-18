import { apiClient, publicApiClient } from "./client"
import { getApiErrorMessage } from "./errors"

export type AdditionalInformationType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"

export type AdditionalInformationStatus = "pending" | "submitted" | "expired"

export interface AdditionalInformationResponseItem {
  id: number
  type: AdditionalInformationType
  type_label: string
  message?: string | null
  file_path?: string | null
  file_url?: string | null
  video_url?: string | null
  is_video?: boolean
  original_name?: string | null
  mime_type?: string | null
  file_size?: number | null
  created_at?: string | null
}

export interface AdditionalInformationManufacturer {
  id: number
  email: string
  name?: string | null
  company_name?: string | null
  manufacture_status?: string | null
  manufacture_status_label?: string | null
}

export interface AdditionalInformationRequest {
  id: number
  user_id?: number
  token?: string
  message: string
  allowed_types: AdditionalInformationType[]
  allowed_type_labels: string[]
  status: AdditionalInformationStatus
  status_label: string
  expires_at?: string | null
  submitted_at?: string | null
  created_at?: string | null
  requested_by?: {
    id: number
    name: string
    email: string
  } | null
  responses?: AdditionalInformationResponseItem[]
  manufacturer?: AdditionalInformationManufacturer | null
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

export interface ApiListResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta?: PaginationMeta
}

export interface ApiItemResponse<T> {
  success: boolean
  message: string
  data: T
}

export const ADDITIONAL_INFO_TYPE_LABELS: Record<AdditionalInformationType, string> = {
  text: "Text message",
  image: "Image",
  video: "Video",
  audio: "Audio",
  document: "Document",
}

export const ADDITIONAL_INFO_STATUS_LABELS: Record<AdditionalInformationStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  expired: "Expired",
}

export interface CreateAdditionalInformationPayload {
  message: string
  allowed_types: AdditionalInformationType[]
}

export interface SubmitAdditionalInformationItem {
  type: AdditionalInformationType
  message?: string
  file?: File | null
  video?: File | null
}

function unwrapList<T>(payload: unknown): { data: T[]; meta?: PaginationMeta } {
  const body = payload as ApiListResponse<T>
  return {
    data: Array.isArray(body?.data) ? body.data : [],
    meta: body?.meta,
  }
}

function unwrapItem<T>(payload: unknown): T {
  const body = payload as ApiItemResponse<T>
  return body.data
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function fetchAllAdditionalInformationRequests(
  page = 1,
  perPage = 10,
  status?: AdditionalInformationStatus
): Promise<ApiListResponse<AdditionalInformationRequest>> {
  try {
    const params: Record<string, string | number> = { page, per_page: perPage }
    if (status) params.status = status

    const response = await apiClient.get("/admin/manufacturer-additional-information", { params })
    const { data, meta } = unwrapList<AdditionalInformationRequest>(response.data)

    return {
      success: true,
      message: "OK",
      data,
      meta,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load information requests"))
  }
}

export async function fetchAdditionalInformationRequest(
  id: number | string
): Promise<AdditionalInformationRequest> {
  try {
    const response = await apiClient.get(`/admin/manufacturer-additional-information/${id}`)
    return unwrapItem<AdditionalInformationRequest>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load request details"))
  }
}

export async function createAdditionalInformationRequest(
  manufacturerId: number | string,
  payload: CreateAdditionalInformationPayload
): Promise<AdditionalInformationRequest> {
  try {
    const response = await apiClient.post(
      `/admin/manufacturer/${manufacturerId}/additional-information`,
      payload
    )
    return unwrapItem<AdditionalInformationRequest>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create information request"))
  }
}

// ─── Manufacturer (authenticated) ───────────────────────────────────────────

export async function fetchMyAdditionalInformationRequests(
  status?: AdditionalInformationStatus
): Promise<AdditionalInformationRequest[]> {
  try {
    const params = status ? { status } : undefined
    const response = await apiClient.get("/manufacturer/additional-information-requests", { params })
    const { data } = unwrapList<AdditionalInformationRequest>(response.data)
    return data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load your requests"))
  }
}

export async function submitMyAdditionalInformation(
  requestId: number | string,
  responses: SubmitAdditionalInformationItem[]
): Promise<AdditionalInformationRequest> {
  const formData = new FormData()
  responses.forEach((item, index) => {
    formData.append(`responses[${index}][type]`, item.type)
    if (item.message) {
      formData.append(`responses[${index}][message]`, item.message)
    }
    if (item.file) {
      formData.append(`responses[${index}][file]`, item.file)
    }
    if (item.video) {
      formData.append(`responses[${index}][video]`, item.video)
    }
  })

  try {
    const response = await apiClient.post(
      `/manufacturer/additional-information-requests/${requestId}/submit`,
      formData
    )
    return unwrapItem<AdditionalInformationRequest>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to submit information"))
  }
}

// ─── Public token flow (email link fallback) ─────────────────────────────────

export async function fetchPublicAdditionalInformation(
  token: string
): Promise<AdditionalInformationRequest> {
  try {
    const response = await publicApiClient.get(`/manufacturer/additional-information/${token}`)
    return unwrapItem<AdditionalInformationRequest>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This submission link is invalid or expired"))
  }
}

export async function submitPublicAdditionalInformation(
  token: string,
  responses: SubmitAdditionalInformationItem[]
): Promise<AdditionalInformationRequest> {
  const formData = new FormData()
  responses.forEach((item, index) => {
    formData.append(`responses[${index}][type]`, item.type)
    if (item.message) {
      formData.append(`responses[${index}][message]`, item.message)
    }
    if (item.file) {
      formData.append(`responses[${index}][file]`, item.file)
    }
    if (item.video) {
      formData.append(`responses[${index}][video]`, item.video)
    }
  })

  try {
    const response = await publicApiClient.post(
      `/manufacturer/additional-information/${token}`,
      formData
    )
    return unwrapItem<AdditionalInformationRequest>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to submit information"))
  }
}
