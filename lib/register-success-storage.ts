export const REGISTER_SUCCESS_STORAGE_KEY = "sourcenest_register_success"

export type RegisterSuccessPayload = {
  message: string
  manufactureStatus?: string | null
  /** True when registration returned a session (e.g. buyer). */
  isLoggedIn?: boolean
  /** Post-login dashboard path from signup result. */
  dashboardPath?: string
}

export function clearRegisterSuccessPayload() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(REGISTER_SUCCESS_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
