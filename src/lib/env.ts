declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

/** Get environment variable with runtime injection support. */
export function getEnv(key: string): string {
  if (typeof window !== "undefined" && window.__ENV__) {
    const value = window.__ENV__[key];
    if (value && !value.startsWith("__")) {
      return value;
    }
  }
  return (import.meta.env[key] as string) || "";
}

export const API_BASE_URL =
  getEnv("VITE_API_BASE_URL") || "http://localhost:3000/api/v1";

export const AUTH_UI_URL =
  getEnv("VITE_AUTH_UI_URL") || "http://localhost:8098";
