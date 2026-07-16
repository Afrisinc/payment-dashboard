import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  WebhookDeliveryListResponse,
  UnwrappedWebhookDeliveryListResponse,
  WebhookDeliveryFilters,
  ApiError,
} from "@/types/payment";

interface UseWebhooksState {
  loading: boolean;
  error: ApiError | null;
}

export interface UseWebhooksResult {
  loading: boolean;
  error: ApiError | null;
  listWebhookDeliveries: (
    filters?: WebhookDeliveryFilters,
  ) => Promise<UnwrappedWebhookDeliveryListResponse>;
  retryWebhookDelivery: (deliveryId: string) => Promise<void>;
}

export function useWebhooks(): UseWebhooksResult {
  const [state, setState] = useState<UseWebhooksState>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const listWebhookDeliveries = useCallback(
    async (
      filters?: WebhookDeliveryFilters,
    ): Promise<UnwrappedWebhookDeliveryListResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number | boolean> = {};

        if (filters?.page !== undefined) params.page = filters.page;
        if (filters?.limit !== undefined) params.limit = filters.limit;
        if (filters?.status) params.status = filters.status;
        if (filters?.merchantId) params.merchantId = filters.merchantId;
        if (filters?.search) params.search = filters.search;
        if (filters?.sortBy) params.sortBy = filters.sortBy;
        if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

        const response = await apiClient.get<WebhookDeliveryListResponse>(
          "/admin/webhooks",
          params,
        );
        return {
          data: response.data,
          pagination: response.pagination || {
            total: 0,
            page: 1,
            pageSize: 50,
            hasMore: false,
          },
        };
      } catch (err) {
        const error = err as ApiError;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const retryWebhookDelivery = useCallback(
    async (deliveryId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await apiClient.post(`/admin/webhooks/${deliveryId}/retry`);
      } catch (err) {
        const error = err as ApiError;
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  return {
    loading: state.loading,
    error: state.error,
    listWebhookDeliveries,
    retryWebhookDelivery,
  };
}
