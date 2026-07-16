export type PaymentStatus = "SUCCESSFUL" | "PENDING" | "FAILED" | "PROCESSING";
export type PaymentType = "mobile" | "card" | "stripe";
export type PaymentProvider = "ITEC" | "Paypack" | "Stripe" | "PesaPal";
export type MerchantStatus = "active" | "inactive" | "suspended";

export interface Payment {
  id: string;
  type: PaymentType;
  ref: string;
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  phoneNumber: string;
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

export interface WebhookDelivery {
  id: string;
  merchantId: string;
  status: "DELIVERED" | "FAILED" | "RETRYING" | "PENDING";
  attempt: number;
  timestamp: string;
  payload: Record<string, unknown>;
  response?: string;
}

export interface WebhookConfig {
  url: string;
}

export type WebhookDeliveryListResponse = PaginatedApiResponse<WebhookDelivery>;
export type UnwrappedWebhookDeliveryListResponse =
  PaginatedData<WebhookDelivery>;

export interface WebhookDeliveryFilters {
  page?: number;
  limit?: number;
  status?: "DELIVERED" | "FAILED" | "RETRYING" | "PENDING";
  merchantId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
  details?: Record<string, unknown>;
}
