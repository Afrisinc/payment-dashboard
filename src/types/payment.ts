export type PaymentStatus = "SUCCESSFUL" | "PENDING" | "FAILED" | "PROCESSING";
export type PaymentType = "mobile" | "card" | "stripe";
export type PaymentProvider = "ITEC" | "Paypack" | "Stripe" | "PesaPal";
export type MerchantStatus = "active" | "inactive" | "suspended";

export interface Payment {
  id: string;
  type: PaymentType;
  ref: string;
  orderId: string;
  merchant: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  phoneNumber: string;
  feeAmount: number;
  feePercent: number;
  createdAt: string;
}

export interface MerchantPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  provider: PaymentProvider;
  ref: string;
  createdAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  defaultFeePercent: number;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: T[];
  pagination: Pagination;
}

export type PaymentListResponse = PaginatedApiResponse<Payment>;
export type MerchantListResponse = PaginatedApiResponse<Merchant>;
export type MerchantPaymentListResponse = PaginatedApiResponse<MerchantPayment>;

export type UnwrappedPaymentListResponse = PaginatedData<Payment>;
export type UnwrappedMerchantListResponse = PaginatedData<Merchant>;
export type UnwrappedMerchantPaymentListResponse =
  PaginatedData<MerchantPayment>;

export interface PaymentFilters {
  page?: number;
  limit?: number;
  type?: PaymentType;
  status?: PaymentStatus;
  provider?: PaymentProvider;
  merchant?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MerchantFilters {
  page?: number;
  limit?: number;
  status?: MerchantStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MerchantPaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DashboardMetrics {
  totalTransactions: number;
  totalTransactionsToday: number;
  totalVolume: number;
  totalVolumeToday: number;
  successRate: number;
  failedCount: number;
  pendingCount: number;
  averageTransactionTime: number;
  volumeByType: {
    mobile: number;
    card: number;
    stripe: number;
  };
}

export type MetricsResponse = ApiResponseWrapper<DashboardMetrics>;
export type UnwrappedMetricsResponse = DashboardMetrics;

export interface VolumeByDay {
  date: string;
  amount: number;
  count: number;
}

export interface StatusDistribution {
  SUCCESSFUL: number;
  PENDING: number;
  FAILED: number;
  PROCESSING: number;
}

export interface ProviderDistribution {
  ITEC: number;
  Paypack: number;
  Stripe: number;
  PesaPal: number;
}

export interface TopMerchant {
  merchantId: string;
  merchantName: string;
  volume: number;
  count: number;
}

export interface TransactionTrend {
  date: string;
  count: number;
}

export interface ChartData {
  volumeByDay: VolumeByDay[];
  statusDistribution: StatusDistribution;
  providerDistribution: ProviderDistribution;
  topMerchants: TopMerchant[];
  transactionTrend: TransactionTrend[];
}

export type ChartDataResponse = ApiResponseWrapper<ChartData>;
export type UnwrappedChartDataResponse = ChartData;

export type WebhookDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED";

/** Merchant webhook delivery log entry (GET /admin/webhooks) */
export interface WebhookDelivery {
  id: string;
  merchantId: string;
  merchantName: string | null;
  /** Merchant webhook URL as currently configured */
  webhookUrl: string | null;
  paymentId: string;
  eventType: string;
  /** Exact body sent to the merchant */
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  lastAttempt: string | null;
  nextRetry: string | null;
  /** HTTP status returned by the merchant endpoint */
  responseCode: number | null;
  errorMessage: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

export interface WebhookConfig {
  url: string;
}

export type WebhookDeliveryListResponse = PaginatedApiResponse<WebhookDelivery>;
export type UnwrappedWebhookDeliveryListResponse =
  PaginatedData<WebhookDelivery>;
export type WebhookDeliveryResponse = ApiResponseWrapper<WebhookDelivery>;

export interface WebhookDeliveryFilters {
  page?: number;
  limit?: number;
  status?: WebhookDeliveryStatus;
  merchantId?: string;
}

export interface CreateMerchantRequest {
  name: string;
  email: string;
  defaultFeePercent: number;
}

export interface CreateMerchantResponse {
  success: boolean;
  resp_code: number;
  resp_msg: string;
  data: Merchant;
}

export interface WebhookConfigResponse {
  id: string;
  webhookUrl: string;
  webhookSecret: string;
}

export interface UpdateWebhookRequest {
  webhookUrl: string;
}

export interface ApiError {
  code: string;
  message: string;
  /** HTTP status; undefined when the request never got a response (network failure) */
  status?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Payouts (ITEC cashout on behalf of a merchant)
// ============================================================================

export type PayoutStatus = "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";

export interface MerchantBalance {
  merchantId: string;
  collected: number;
  collectionFees: number;
  paidOut: number;
  pendingPayouts: number;
  available: number;
  currency: string;
  payoutsEnabled: boolean;
}

export interface Payout {
  id: string;
  ref: string;
  orderId: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  type: "CASHIN" | "CASHOUT";
  provider: string | null;
  phoneNumber: string;
  customerName: string | null;
  fee: number;
  failureReason: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface CreatePayoutRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  recipientName?: string;
  description?: string;
}

export interface PayoutResult {
  id: string;
  ref: string;
  orderId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  status: PayoutStatus;
  createdAt: string;
}

export type MerchantBalanceResponse = ApiResponseWrapper<MerchantBalance>;
export type PayoutListResponse = PaginatedApiResponse<Payout>;
export type PayoutResultResponse = ApiResponseWrapper<PayoutResult>;
