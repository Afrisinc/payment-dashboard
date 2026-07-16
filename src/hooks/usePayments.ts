import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  PaymentFilters,
  PaymentListResponse,
  MerchantPaymentListResponse,
  MerchantPaymentFilters,
  UnwrappedPaymentListResponse,
  UnwrappedMerchantPaymentListResponse,
  ApiError,
} from "@/types/payment";

interface UsePaymentsState {
  loading: boolean;
  error: ApiError | null;
}

export interface UsePaymentsResult {
  loading: boolean;
  error: ApiError | null;
  listAdminPayments: (
    filters?: PaymentFilters,
  ) => Promise<UnwrappedPaymentListResponse>;
  listMerchantPayments: (
    filters?: MerchantPaymentFilters,
  ) => Promise<UnwrappedMerchantPaymentListResponse>;
}

export function usePayments(): UsePaymentsResult {
  const [state, setState] = useState<UsePaymentsState>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const listAdminPayments = useCallback(
    async (filters?: PaymentFilters): Promise<UnwrappedPaymentListResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number | boolean> = {};

        if (filters?.page !== undefined) params.page = filters.page;
        if (filters?.limit !== undefined) params.limit = filters.limit;
        if (filters?.type) params.type = filters.type;
        if (filters?.status) params.status = filters.status;
        if (filters?.provider) params.provider = filters.provider;
        if (filters?.merchant) params.merchant = filters.merchant;
        if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters?.dateTo) params.dateTo = filters.dateTo;
        if (filters?.minAmount !== undefined)
          params.minAmount = filters.minAmount;
        if (filters?.maxAmount !== undefined)
          params.maxAmount = filters.maxAmount;
        if (filters?.search) params.search = filters.search;
        if (filters?.sortBy) params.sortBy = filters.sortBy;
        if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

        const response = await apiClient.get<PaymentListResponse>(
          "/admin/payments",
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

  const listMerchantPayments = useCallback(
    async (
      filters?: MerchantPaymentFilters,
    ): Promise<UnwrappedMerchantPaymentListResponse> => {
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

        const response = await apiClient.get<MerchantPaymentListResponse>(
          "/payments",
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

  return {
    loading: state.loading,
    error: state.error,
    listAdminPayments,
    listMerchantPayments,
  };
}
