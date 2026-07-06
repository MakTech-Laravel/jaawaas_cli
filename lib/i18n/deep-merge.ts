/**
 * Recursively merge locale overrides onto a base locale.
 * Missing keys in `overrides` inherit from `base` (English fallback).
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Record<string, unknown>
): T {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(overrides)) {
    const overrideVal = overrides[key];
    const baseVal = result[key];

    if (
      overrideVal !== null &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>
      );
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }

  return result as T;
}
