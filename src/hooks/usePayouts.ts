import { useCallback } from "react";
import { apiClient } from "@/lib/api";
import type {
  ApiError,
  CreatePayoutRequest,
  MerchantBalance,
  MerchantBalanceResponse,
  PaginatedData,
  Payout,
  PayoutListResponse,
  PayoutResult,
  PayoutResultResponse,
} from "@/types/payment";

const EMPTY_PAGINATION = { total: 0, page: 1, pageSize: 20, hasMore: false };

/** Normalise thrown values: fetch rejects with a TypeError when the network fails */
export function toApiError(err: unknown): ApiError {
  if (err && typeof err === "object" && "message" in err && "code" in err) {
    return err as ApiError;
  }
  return {
    code: "NETWORK",
    message:
      err instanceof Error
        ? err.message
        : "Network error. Check your connection.",
  };
}

export interface UsePayoutsResult {
  getMerchantBalance: (merchantId: string) => Promise<MerchantBalance>;
  listPayouts: (
    merchantId: string,
    page: number,
    limit?: number,
  ) => Promise<PaginatedData<Payout>>;
  createPayout: (
    merchantId: string,
    data: CreatePayoutRequest,
  ) => Promise<PayoutResult>;
}

export function usePayouts(): UsePayoutsResult {
  const getMerchantBalance = useCallback(
    async (merchantId: string): Promise<MerchantBalance> => {
      try {
        const response = await apiClient.get<MerchantBalanceResponse>(
          `/admin/merchants/${merchantId}/balance`,
        );
        return response.data;
      } catch (err) {
        throw toApiError(err);
      }
    },
    [],
  );

  const listPayouts = useCallback(
    async (
      merchantId: string,
      page: number,
      limit = 20,
    ): Promise<PaginatedData<Payout>> => {
      try {
        const response = await apiClient.get<PayoutListResponse>(
          "/admin/mobile-payments",
          { merchantId, type: "CASHOUT", page, limit },
        );
        return {
          data: response.data ?? [],
          pagination: response.pagination ?? EMPTY_PAGINATION,
        };
      } catch (err) {
        throw toApiError(err);
      }
    },
    [],
  );

  const createPayout = useCallback(
    async (
      merchantId: string,
      data: CreatePayoutRequest,
    ): Promise<PayoutResult> => {
      try {
        const response = await apiClient.post<PayoutResultResponse>(
          `/admin/merchants/${merchantId}/payouts`,
          data,
        );
        return response.data;
      } catch (err) {
        throw toApiError(err);
      }
    },
    [],
  );

  return { getMerchantBalance, listPayouts, createPayout };
}
