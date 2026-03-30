import { apiClient } from "./client";
import { LoginInput, LoginResponse } from "@/lib/types";

export async function login(data: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/login", data);
  return response.data;
}

/** Same envelope as login; `data` may be null when manufacturer registration is pending review. */
export async function register(formData: FormData): Promise<LoginResponse> {
  // Override the global JSON Content-Type so Axios handles the multipart boundary correctly
  const response = await apiClient.post<LoginResponse>("/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

type SocialLoginEnvelope = LoginResponse & {
  setup_token?: string
}

export async function googleTokenLogin(input: {
  token: string
  role: "buyer" | "manufacturer" | "admin"
}): Promise<SocialLoginEnvelope> {
  const response = await apiClient.post<SocialLoginEnvelope>("/auth/google/token", input)
  return response.data
}

export async function completeSocialProfile(setupToken: string): Promise<LoginResponse> {
  const form = new FormData()
  form.append("setup_token", setupToken)

  const response = await apiClient.post<LoginResponse>("/auth/social/complete-profile", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}