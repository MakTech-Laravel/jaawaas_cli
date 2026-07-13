/** API locale codes used for Accept-Language and CMS content saves. */
const API_CONTENT_LOCALES = new Set(["en", "ar", "he", "zh_CN"])

/**
 * Read the raw locale code stored in the browser (frontend i18n code).
 * Does not map to API codes — use {@link mapToApiLocale} for API requests.
 */
export function readRawLanguageFromStorage(): string {
  if (typeof window === "undefined") {
    return "en"
  }

  const languageCandidates = [
    localStorage.getItem("sourcenest_lang"),
    localStorage.getItem("locale"),
    localStorage.getItem("language"),
  ]

  for (const candidate of languageCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }

  return "en"
}

/**
 * Map a frontend locale code to the API content / Accept-Language code.
 *
 * The UI still uses `es` as the Chinese language-slot code (localStorage / i18n).
 * The backend stores and serves Chinese CMS/API content as `zh_CN`.
 */
export function mapToApiLocale(code: string): string {
  const trimmed = code.trim()

  // UI Chinese slot + legacy/storage Chinese codes → backend zh_CN
  if (trimmed === "es" || trimmed === "zh" || trimmed.startsWith("zh")) {
    return "zh_CN"
  }

  if (API_CONTENT_LOCALES.has(trimmed)) {
    return trimmed
  }

  return "en"
}

/**
 * Locale sent as `Accept-Language` on API requests.
 * Aligns with {@link getApiContentLocale} for CMS saves.
 */
export function readPreferredLanguage(): string {
  return mapToApiLocale(readRawLanguageFromStorage())
}

/**
 * Locale used when saving translatable CMS content (legal pages, etc.).
 * Matches Accept-Language sent to the API.
 */
export function getApiContentLocale(): string {
  return readPreferredLanguage()
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
