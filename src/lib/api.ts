import type { ApiError } from "@/types/payment";
import { API_BASE_URL, AUTH_UI_URL } from "./env";

const API_TOKEN_KEY = "payment_dashboard_token";

function getAuthToken(): string | null {
  return localStorage.getItem(API_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(API_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(API_TOKEN_KEY);
}

export function logout(): void {
  clearAuthToken();
  localStorage.clear();
  window.location.href = AUTH_UI_URL;
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: FetchOptions = {},
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const headers = this.getHeaders();

    const config: RequestInit = {
      method: options.method,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error: ApiError = {
        code: String(response.status),
        message: `HTTP ${response.status}`,
      };

      try {
        const errorData = await response.json();
        if (errorData.error) {
          error.code = errorData.error.code || error.code;
          error.message = errorData.error.message || error.message;
          error.details = errorData.error.details;
        }
      } catch {
        // Ignore parse errors, use default error message
      }

      throw error;
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, params);
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body }, params);
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body }, params);
  }

  delete<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, params);
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body }, params);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
