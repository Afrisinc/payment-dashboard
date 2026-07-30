export type PaymentType = "MOMO" | "CARD" | "STRIPE";
export type PaymentStatus =
  "SUCCESSFUL" | "PENDING" | "PROCESSING" | "FAILED" | "CANCELLED";
export type Provider = "ITEC" | "PAYPACK" | "STRIPE";
export type WebhookDeliveryStatus =
  "DELIVERED" | "FAILED" | "RETRYING" | "PENDING";

export type MobilePaymentType = "CASHIN" | "CASHOUT";
export type MobilePaymentStatus = "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
export type MobileProvider = "itec" | "paypack";

export interface MobilePayment {
  id: string;
  ref: string;
  orderId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  type: MobilePaymentType;
  status: MobilePaymentStatus;
  fee: number;
  provider: string | null;
  createdAt: string;
  customerName?: string;
  description?: string;
}

export interface MobileAccountInfo {
  balance: number;
  currency: string;
  merchantName: string;
  inRate: number;
  outRate: number;
}

export interface CashinRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  customerName?: string;
  description?: string;
  provider?: MobileProvider;
}

export interface CashoutRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  recipientName?: string;
  description?: string;
  provider?: MobileProvider;
}

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  provider: Provider;
  merchant: string;
  timestamp: string;
  description?: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  apiKey: string;
  webhookUrl?: string;
  webhookSecret?: string;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  merchantId: string;
  status: WebhookDeliveryStatus;
  attempt: number;
  timestamp: string;
  payload: Record<string, unknown>;
  response?: string;
}

export type Page =
  | "dashboard"
  | "payments"
  | "mobile-payments"
  | "merchants"
  | "webhooks"
  | "reports"
  | "notifications"
  | "settings"
  | "security";

export interface AppState {
  currentPage: Page;
  selectedPayment?: Payment;
  selectedMerchant?: Merchant;
  selectedWebhook?: WebhookDelivery;
  selectedMobilePayment?: MobilePayment;
  searchQuery: string;
  statusFilter: PaymentStatus | "ALL";
  providerFilter: Provider | "ALL";
  typeFilter: PaymentType | "ALL";
}
