import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  MerchantListResponse,
  UnwrappedMerchantListResponse,
  MerchantFilters,
  WebhookConfig,
  CreateMerchantRequest,
  CreateMerchantResponse,
  WebhookConfigResponse,
  UpdateWebhookRequest,
  Merchant,
  ApiError,
} from "@/types/payment";

interface UseMerchantsState {
  loading: boolean;
  error: ApiError | null;
}

export interface UseMerchantsResult {
  loading: boolean;
  error: ApiError | null;
  listMerchants: (
    filters?: MerchantFilters,
  ) => Promise<UnwrappedMerchantListResponse>;
  createMerchant: (data: CreateMerchantRequest) => Promise<Merchant>;
  configureWebhook: (
    merchantId: string,
    config: WebhookConfig,
  ) => Promise<void>;
  getWebhookConfig: (merchantId: string) => Promise<WebhookConfigResponse>;
  updateWebhookConfig: (
    merchantId: string,
    data: UpdateWebhookRequest,
  ) => Promise<WebhookConfigResponse>;
  deleteWebhookConfig: (merchantId: string) => Promise<void>;
}

export function useMerchants(): UseMerchantsResult {
  const [state, setState] = useState<UseMerchantsState>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const listMerchants = useCallback(
    async (
      filters?: MerchantFilters,
    ): Promise<UnwrappedMerchantListResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number | boolean> = {};

        if (filters?.page !== undefined) params.page = filters.page;
        if (filters?.limit !== undefined) params.limit = filters.limit;
        if (filters?.status) params.status = filters.status;
        if (filters?.search) params.search = filters.search;
        if (filters?.sortBy) params.sortBy = filters.sortBy;
        if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

        const response = await apiClient.get<MerchantListResponse>(
          "/admin/merchants",
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

  const createMerchant = useCallback(
    async (data: CreateMerchantRequest): Promise<Merchant> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<CreateMerchantResponse>(
          "/admin/merchants",
          data,
        );
        return response.data;
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

  const configureWebhook = useCallback(
    async (merchantId: string, config: WebhookConfig): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await apiClient.post(`/admin/merchants/${merchantId}/webhook`, config);
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

  const getWebhookConfig = useCallback(
    async (merchantId: string): Promise<WebhookConfigResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<WebhookConfigResponse>(
          `/admin/merchants/${merchantId}/webhook`,
        );
        return response;
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

  const updateWebhookConfig = useCallback(
    async (
      merchantId: string,
      data: UpdateWebhookRequest,
    ): Promise<WebhookConfigResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.put<WebhookConfigResponse>(
          `/admin/merchants/${merchantId}/webhook`,
          data,
        );
        return response;
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

  const deleteWebhookConfig = useCallback(
    async (merchantId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await apiClient.delete(`/admin/merchants/${merchantId}/webhook`);
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
    listMerchants,
    createMerchant,
    configureWebhook,
    getWebhookConfig,
    updateWebhookConfig,
    deleteWebhookConfig,
  };
}
