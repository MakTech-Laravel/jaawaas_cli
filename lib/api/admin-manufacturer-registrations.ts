/**
 * Manufacturer registration row — list + full review detail (static JSON / future API).
 */
export interface ManufacturerApplication {
  id: number | string
  email: string
  company_name?: string
  first_name?: string
  last_name?: string
  country?: string
  city?: string
  company_website?: string
  status?: string
  created_at?: string
  notes?: string
  /** Extended fields for admin review */
  phone?: string
  terms_accepted?: boolean
  device_name?: string
  business_license_file?: string
  factory_images?: string[]
  primary_industry?: string
  employee_count?: string
  tax_id?: string
  business_registration_id?: string
  application_reference?: string
}
