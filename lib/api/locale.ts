import { readPreferredLanguage } from "./client"

const SUPPORTED_CONTENT_LOCALES = new Set(["en", "es", "ar", "he", "zh_CN"])

/**
 * Locale used when saving translatable CMS content (legal pages, etc.).
 * Aligns with Accept-Language sent to the API and falls back to English.
 */
export function getApiContentLocale(): string {
  const raw = readPreferredLanguage()

  if (SUPPORTED_CONTENT_LOCALES.has(raw)) {
    return raw
  }

  if (raw === "zh" || raw.startsWith("zh")) {
    return "zh_CN"
  }

  return "en"
}

function unwrapApiData(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload
  }

  const record = payload as Record<string, unknown>

  if ("data" in record) {
    const inner = record.data
    if (Array.isArray(inner)) {
      return inner
    }
    if (inner && typeof inner === "object" && "data" in (inner as Record<string, unknown>)) {
      const nested = (inner as Record<string, unknown>).data
      if (Array.isArray(nested)) {
        return nested
      }
    }
    return inner
  }

  return payload
}

export function unwrapApiList(payload: unknown): unknown[] {
  const data = unwrapApiData(payload)
  return Array.isArray(data) ? data : []
}

export function unwrapApiItem(payload: unknown): unknown {
  return unwrapApiData(payload)
}
