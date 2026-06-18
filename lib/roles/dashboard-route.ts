export type UserRole = "buyer" | "manufacturer" | "admin";

export function normalizeUserRole(role: string): UserRole {
  switch (role.toLowerCase()) {
    case "admin":
      return "admin";
    case "manufacturer":
      return "manufacturer";
    case "buyer":
    default:
      return "buyer";
  }
}

/** Manufacturer is not yet approved — should use /review, not the full dashboard. */
export function isManufacturerPendingReview(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return (
    normalized === "pending" ||
    normalized === "pending_approval" ||
    normalized === "needs_more_info"
  );
}

export function getDashboardPathByRole(role: string, status?: string | null): string {
  switch (normalizeUserRole(role)) {
    case "admin":
      return "/admin";
    case "manufacturer":
      if (isManufacturerPendingReview(status)) {
        return "/review";
      }
      return "/dashboard/manufacturer";
    case "buyer":
    default:
      return "/dashboard/buyer";
  }
}
