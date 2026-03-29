import { apiClient, publicApiClient } from "./client";

export interface AccountActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function requestAccountDeletion(password: string, reason: string) {
  const { data } = await apiClient.post<AccountActionResponse>("/account/delete-request", {
    password,
    reason,
  });
  return data;
}

export async function requestRestoreDeleteAccount(email: string, password: string) {
  const { data } = await publicApiClient.post<AccountActionResponse>(
    "/account/restore-delete/request",
    { email, password }
  );
  return data;
}

export async function verifyRestoreDeleteAccount(email: string, otp: string) {
  const { data } = await publicApiClient.post<AccountActionResponse>(
    "/account/restore-delete/verify",
    { email, otp }
  );
  return data;
}

export async function deactivateAccount(password: string, reason?: string) {
  const { data } = await apiClient.post<AccountActionResponse>("/account/deactivate", {
    password,
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });
  return data;
}

export async function activateAccount(password: string) {
  const { data } = await apiClient.post<AccountActionResponse>("/account/activate", {
    password,
  });
  return data;
}
