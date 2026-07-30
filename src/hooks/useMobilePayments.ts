import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  MobilePayment,
  MobileAccountInfo,
  MobilePaymentType,
  MobilePaymentStatus,
  CashinRequest,
  CashoutRequest,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface MobilePaymentFilters {
  page?: number;
  limit?: number;
  status?: MobilePaymentStatus;
  type?: MobilePaymentType;
}

interface ApiError {
  code: string;
  message: string;
}

interface UseMobilePaymentsState {
  loading: boolean;
  error: ApiError | null;
}

export interface UseMobilePaymentsResult {
  loading: boolean;
  error: ApiError | null;
  listPayments: (filters?: MobilePaymentFilters) => Promise<{
    data: MobilePayment[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>;
  getPayment: (id: string) => Promise<MobilePayment>;
  getPaymentByRef: (ref: string) => Promise<MobilePayment>;
  refreshStatus: (ref: string) => Promise<MobilePayment>;
  cashin: (request: CashinRequest) => Promise<MobilePayment>;
  cashout: (request: CashoutRequest) => Promise<MobilePayment>;
  getAccountInfo: () => Promise<MobileAccountInfo>;
}

export function useMobilePayments(): UseMobilePaymentsResult {
  const [state, setState] = useState<UseMobilePaymentsState>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const listPayments = useCallback(
    async (filters?: MobilePaymentFilters) => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number> = {};
        if (filters?.page) params.page = filters.page;
        if (filters?.limit) params.limit = filters.limit;
        if (filters?.status) params.status = filters.status;
        if (filters?.type) params.type = filters.type;

        const response = await apiClient.get<
          PaginatedApiResponse<MobilePayment[]>
        >("/mobile", params);

        return {
          data: response.data,
          pagination: response.pagination,
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

  const getPayment = useCallback(
    async (id: string): Promise<MobilePayment> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ApiResponse<MobilePayment>>(
          `/mobile/${id}`,
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

  const getPaymentByRef = useCallback(
    async (ref: string): Promise<MobilePayment> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ApiResponse<MobilePayment>>(
          `/mobile/ref/${ref}`,
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

  const refreshStatus = useCallback(
    async (id: string): Promise<MobilePayment> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<ApiResponse<MobilePayment>>(
          `/admin/payments/${id}/refresh-status`,
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

  const cashin = useCallback(
    async (request: CashinRequest): Promise<MobilePayment> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<ApiResponse<MobilePayment>>(
          "/mobile/cashin",
          request,
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

  const cashout = useCallback(
    async (request: CashoutRequest): Promise<MobilePayment> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<ApiResponse<MobilePayment>>(
          "/mobile/cashout",
          request,
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

  const getAccountInfo = useCallback(async (): Promise<MobileAccountInfo> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ApiResponse<MobileAccountInfo>>(
        "/mobile/account/info",
      );
      return response.data;
    } catch (err) {
      const error = err as ApiError;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    loading: state.loading,
    error: state.error,
    listPayments,
    getPayment,
    getPaymentByRef,
    refreshStatus,
    cashin,
    cashout,
    getAccountInfo,
  };
}
