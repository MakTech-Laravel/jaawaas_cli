export type GoogleIdCredentialResponse = {
  credential: string
  select_by?: string
}

export type GoogleIdTokenPayload = {
  iss?: string
  aud?: string
  azp?: string
  sub?: string
  email?: string
  email_verified?: boolean
  exp?: number
  iat?: number
  nbf?: number
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: {
            client_id: string
            callback: (response: GoogleIdCredentialResponse) => void
            auto_select?: boolean
            itp_support?: boolean
            use_fedcm_for_prompt?: boolean
          }) => void
          prompt: (momentListener?: (notification: unknown) => void) => void
        }
      }
    }
  }
}

function getGoogleClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID")
  }
  return clientId
}

function base64UrlDecode(input: string): string {
  const pad = "=".repeat((4 - (input.length % 4)) % 4)
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/")
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeGoogleIdTokenPayload(idToken: string): GoogleIdTokenPayload | null {
  try {
    const parts = idToken.split(".")
    if (parts.length < 2) return null
    const payloadJson = base64UrlDecode(parts[1]!)
    return JSON.parse(payloadJson) as GoogleIdTokenPayload
  } catch {
    return null
  }
}

async function waitForGoogleIdentityServices(timeoutMs = 10_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.google?.accounts?.id) return
    await new Promise((r) => setTimeout(r, 50))
  }
  throw new Error("Google Identity Services failed to load")
}

/**
 * Returns a Google ID token (JWT) via Google Identity Services.
 * This relies on One Tap / prompt UX and may be blocked by browser settings.
 */
export async function getGoogleIdToken(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser")
  }

  await waitForGoogleIdentityServices()

  const clientId = getGoogleClientId()

  return await new Promise<string>((resolve, reject) => {
    let settled = false

    window.google!.accounts!.id!.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return
        settled = true
        if (!response?.credential) {
          reject(new Error("No Google credential returned"))
          return
        }
        resolve(response.credential)
      },
      use_fedcm_for_prompt: true,
    })

    window.google!.accounts!.id!.prompt(() => {
      // If the prompt is dismissed/not displayed, Google often provides details
      // on this notification object, but its shape isn't stable enough to type.
      // We rely on the fallback timer below.
    })

    setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error("Google sign-in was cancelled or blocked"))
    }, 60_000)
  })
}

