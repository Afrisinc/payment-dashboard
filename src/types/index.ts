export type PaymentType = "MOMO" | "CARD" | "STRIPE";
export type PaymentStatus =
  "SUCCESSFUL" | "PENDING" | "PROCESSING" | "FAILED" | "CANCELLED";
export type Provider = "ITEC" | "PAYPACK" | "STRIPE";
export type WebhookDeliveryStatus =
  "DELIVERED" | "FAILED" | "RETRYING" | "PENDING";

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
  searchQuery: string;
  statusFilter: PaymentStatus | "ALL";
  providerFilter: Provider | "ALL";
  typeFilter: PaymentType | "ALL";
}
