import { useState, useEffect } from "react";
import type {
  AppState,
  Page,
  Payment,
  Merchant,
  WebhookDelivery,
} from "@/types";
import { MainLayout } from "@/components/layout/MainLayout";
import { Container } from "@/components/layout/Container";
import { Loader } from "@/components/ui/Loader";
import { Dashboard } from "@/pages/Dashboard";
import { Payments } from "@/pages/Payments";
import { Merchants } from "@/pages/Merchants";
import { Webhooks } from "@/pages/Webhooks";
import { setAuthToken } from "@/lib/api";

const navigationIcons = {
  dashboard: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  payments: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
      <path d="M21 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  merchants: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  webhooks: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const pageLabels: Record<Page, string> = {
  dashboard: "Dashboard",
  payments: "Payments",
  merchants: "Merchants",
  webhooks: "Webhooks",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  security: "Security",
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setAuthToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Mark app as ready after brief delay to ensure auth is set
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const [state, setState] = useState<AppState>({
    currentPage: "dashboard",
    selectedPayment: undefined,
    selectedMerchant: undefined,
    selectedWebhook: undefined,
    searchQuery: "",
    statusFilter: "ALL",
    providerFilter: "ALL",
    typeFilter: "ALL",
  });

  const navigateTo = (page: Page) => {
    setState((prev) => ({
      ...prev,
      currentPage: page,
      selectedPayment: undefined,
      selectedMerchant: undefined,
      selectedWebhook: undefined,
    }));
  };

  const selectPayment = (payment: Payment) => {
    setState((prev) => ({
      ...prev,
      selectedPayment: payment,
    }));
  };

  const selectMerchant = (merchant: Merchant) => {
    setState((prev) => ({
      ...prev,
      selectedMerchant: merchant,
    }));
  };

  const selectWebhook = (webhook: WebhookDelivery) => {
    setState((prev) => ({
      ...prev,
      selectedWebhook: webhook,
    }));
  };

  const closeDrawer = () => {
    setState((prev) => ({
      ...prev,
      selectedPayment: undefined,
      selectedMerchant: undefined,
      selectedWebhook: undefined,
    }));
  };

  const updateFilters = (filters: Partial<AppState>) => {
    setState((prev) => ({
      ...prev,
      ...filters,
    }));
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: navigationIcons.dashboard,
      isActive: state.currentPage === "dashboard",
      onClick: () => navigateTo("dashboard"),
    },
    {
      id: "payments",
      label: "Payments",
      icon: navigationIcons.payments,
      isActive: state.currentPage === "payments",
      onClick: () => navigateTo("payments"),
    },
    {
      id: "merchants",
      label: "Merchants",
      icon: navigationIcons.merchants,
      isActive: state.currentPage === "merchants",
      onClick: () => navigateTo("merchants"),
    },
    {
      id: "webhooks",
      label: "Webhooks",
      icon: navigationIcons.webhooks,
      isActive: state.currentPage === "webhooks",
      onClick: () => navigateTo("webhooks"),
    },
  ];

  const renderPage = () => {
    switch (state.currentPage) {
      case "dashboard":
        return <Dashboard onSelectPayment={selectPayment} />;
      case "payments":
        return (
          <Payments
            selectedPayment={state.selectedPayment}
            onSelectPayment={selectPayment}
            onCloseDrawer={closeDrawer}
            searchQuery={state.searchQuery}
            statusFilter={state.statusFilter}
            providerFilter={state.providerFilter}
            typeFilter={state.typeFilter}
            onUpdateFilters={updateFilters}
          />
        );
      case "merchants":
        return (
          <Merchants
            selectedMerchant={state.selectedMerchant}
            onSelectMerchant={selectMerchant}
            onCloseDrawer={closeDrawer}
          />
        );
      case "webhooks":
        return (
          <Webhooks
            selectedWebhook={state.selectedWebhook}
            onSelectWebhook={selectWebhook}
            onCloseDrawer={closeDrawer}
          />
        );
      default:
        return (
          <Container>
            <h1 className="text-2xl font-bold">
              {pageLabels[state.currentPage]}
            </h1>
            <p className="text-fg-muted">This page is coming soon.</p>
          </Container>
        );
    }
  };

  if (!isReady) {
    return (
      <Loader
        message="Initializing dashboard..."
        submessage="Authenticating your session"
      />
    );
  }

  return <MainLayout navItems={navItems}>{renderPage()}</MainLayout>;
}
