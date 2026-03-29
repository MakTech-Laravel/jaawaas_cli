import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Do not set a global Content-Type header so requests that send FormData
// can rely on the browser/axios to set the proper multipart boundary.
export const apiClient = axios.create({
  baseURL: API_URL,
});

/** No Authorization header — use for public flows (e.g. restore scheduled deletion). */
export const publicApiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem("sourcenest_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
