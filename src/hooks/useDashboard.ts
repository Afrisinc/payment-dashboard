import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  MetricsResponse,
  ChartDataResponse,
  UnwrappedMetricsResponse,
  UnwrappedChartDataResponse,
  ApiError,
} from "@/types/payment";

interface UseDashboardState {
  loading: boolean;
  error: ApiError | null;
}

export interface UseDashboardResult {
  loading: boolean;
  error: ApiError | null;
  getMetrics: (
    dateFrom?: string,
    dateTo?: string,
  ) => Promise<UnwrappedMetricsResponse>;
  getChartData: (
    days?: number,
    groupBy?: "day" | "week" | "month",
  ) => Promise<UnwrappedChartDataResponse>;
}

export function useDashboard(): UseDashboardResult {
  const [state, setState] = useState<UseDashboardState>({
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: ApiError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const getMetrics = useCallback(
    async (
      dateFrom?: string,
      dateTo?: string,
    ): Promise<UnwrappedMetricsResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number | boolean> = {};

        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const response = await apiClient.get<MetricsResponse>(
          "/admin/dashboard/metrics",
          params,
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

  const getChartData = useCallback(
    async (
      days: number = 30,
      groupBy: "day" | "week" | "month" = "day",
    ): Promise<UnwrappedChartDataResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string | number | boolean> = {
          days,
          groupBy,
        };

        const response = await apiClient.get<ChartDataResponse>(
          "/admin/dashboard/chart-data",
          params,
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

  return {
    loading: state.loading,
    error: state.error,
    getMetrics,
    getChartData,
  };
}
