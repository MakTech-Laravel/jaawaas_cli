import { apiClient } from "./client"
import { getApiErrorMessage } from "./errors"

export interface CreateRFQPayload {
  product_id: number
  quantity: number
  quantity_unit: string
  target_price: number
  target_currency_code: string
  required_delivery_date: string
  shipping_terms: string
  destination_country: string
  destination_port_city: string
  packaging_details: string
  additional_requirements?: string
}

export interface RFQResponse {
  success: boolean
  message?: string
  data?: {
    id: number
    product_id: number
    quantity: number
    quantity_unit: string
    target_price: string
    target_currency_code: string
    required_delivery_date: string
    shipping_terms: string
    destination_country: string
    destination_port_city: string
    packaging_details: string
    additional_requirements: string | null
    status: string
    created_at: string
    updated_at: string
  }
}

// Create a new RFQ (Request for Quotation)
export async function createRFQ(payload: CreateRFQPayload): Promise<RFQResponse> {
  try {
    const response = await apiClient.post("/buyer/rfqs", payload)
    
    return {
      success: response.data?.success ?? true,
      message: response.data?.message,
      data: response.data?.data,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to create RFQ."),
    }
  }
}

export interface ManufacturerRFQ {
  id: number
  rfq_number: string
  status: string
  created_at: string
  quantity: number
  quantity_unit: string
  target_price: string | null
  target_currency_code: string | null
  required_delivery_date: string
  shipping_terms: string
  destination_country: string
  destination_port_city: string
  packaging_details: string
  additional_requirements: string | null
  manufacturer_reply: string | null
  quoted_price: string | null
  quote_currency_code: string | null
  minimum_order_quantity: number | null
  lead_time_days: number | null
  quote_valid_until: string | null
  quoted_at: string | null
  buyer_action_at: string | null
  product: {
    id: number
    name: string
    slug: string
  }
  buyer: {
    id: number
    name: string
    email: string
  }
  send_quote_endpoint: string
  reply_endpoint: string
}

export interface GetManufacturerRFQsResponse {
  success: boolean
  message: string
  data: ManufacturerRFQ[]
  meta?: any
  links?: any
}

export interface GetManufacturerRFQResponse {
  success: boolean
  message: string
  data: ManufacturerRFQ | null
}

// Fetch Manufacturer RFQs
export async function getManufacturerRFQs(page: number = 1): Promise<GetManufacturerRFQsResponse> {
  try {
    const response = await apiClient.get<GetManufacturerRFQsResponse>(`/manufacturer/rfqs?page=${page}`)
    return response.data
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to fetch inquiries."),
      data: []
    }
  }
}

// Fetch Manufacturer RFQ Details
export async function getManufacturerRFQ(id: string | number): Promise<GetManufacturerRFQResponse> {
  try {
    const response = await apiClient.get<GetManufacturerRFQResponse>(`/manufacturer/rfqs/${id}`)
    return response.data
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to fetch inquiry details."),
      data: null
    }
  }
}

export interface ManufacturerQuotePayload {
  quoted_price: number
  quote_currency_code: string
  minimum_order_quantity: number
  lead_time_days: number
  quote_valid_until: string
  manufacturer_reply: string
}

export interface SubmitManufacturerQuoteResponse {
  success: boolean
  message: string
}

// Submit Quote
export async function submitManufacturerQuote(id: string | number, payload: ManufacturerQuotePayload): Promise<SubmitManufacturerQuoteResponse> {
  try {
    const response = await apiClient.post<SubmitManufacturerQuoteResponse>(`/manufacturer/rfqs/${id}/quote`, payload)
    return response.data
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to submit quote."),
    }
  }
}
