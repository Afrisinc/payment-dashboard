import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { PayoutDrawer } from "@/components/payouts/PayoutDrawer";
import { useMerchants } from "@/hooks/useMerchants";
import { usePayouts } from "@/hooks/usePayouts";
import { formatRwf } from "@/lib/money";
import { formatRwandaPhone } from "@/lib/phone";
import type {
  ApiError,
  Merchant,
  MerchantBalance,
  Pagination,
  Payout,
  PayoutStatus,
} from "@/types/payment";

const PAGE_SIZE = 20;
/** Refresh cadence while payouts are still in flight */
const LIVE_REFRESH_MS = 15_000;
const SELECTED_MERCHANT_KEY = "payouts_selected_merchant";

const statusVariant: Record<
  PayoutStatus,
  "success" | "warning" | "processing" | "destructive"
> = {
  SUCCESSFUL: "success",
  PENDING: "warning",
  PROCESSING: "processing",
  FAILED: "destructive",
};

const statusLabel: Record<PayoutStatus, string> = {
  SUCCESSFUL: "Paid",
  PENDING: "Pending",
  PROCESSING: "Processing",
  FAILED: "Failed",
};

function readStoredMerchant(): string {
  try {
    return localStorage.getItem(SELECTED_MERCHANT_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeMerchant(id: string): void {
  try {
    localStorage.setItem(SELECTED_MERCHANT_KEY, id);
  } catch {
    // Storage unavailable: selection simply isn't remembered
  }
}

export function Payouts() {
  const { listMerchants } = useMerchants();
  const { getMerchantBalance, listPayouts } = usePayouts();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantsError, setMerchantsError] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string>(readStoredMerchant);

  const [balance, setBalance] = useState<MerchantBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    hasMore: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selectedMerchant = merchants.find((m) => m.id === merchantId);
  const requestSeq = useRef(0);

  useEffect(() => {
    listMerchants({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" })
      .then((response) => {
        const list = response.data ?? [];
        setMerchants(list);
        setMerchantId((current) =>
          list.some((m) => m.id === current) ? current : "",
        );
      })
      .catch((err: ApiError) =>
        setMerchantsError(err.message || "Failed to load merchants"),
      );
  }, [listMerchants]);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!merchantId) return;
      const seq = ++requestSeq.current;
      if (!options.silent) setLoading(true);

      try {
        const [balanceData, payoutPage] = await Promise.all([
          getMerchantBalance(merchantId),
          listPayouts(merchantId, page, PAGE_SIZE),
        ]);
        // Ignore responses that arrive after the merchant or page changed
        if (seq !== requestSeq.current) return;
        setBalance(balanceData);
        setPayouts(payoutPage.data);
        setPagination(payoutPage.pagination);
        setLoadError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setLoadError((err as ApiError).message || "Failed to load payouts");
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [merchantId, page, getMerchantBalance, listPayouts],
  );

  useEffect(() => {
    setBalance(null);
    setPayouts([]);
    setLoadError(null);
    void refresh();
  }, [refresh]);

  // Keep in-flight payouts live without manual refresh
  const hasInFlight = payouts.some(
    (p) => p.status === "PENDING" || p.status === "PROCESSING",
  );
  useEffect(() => {
    if (!hasInFlight) return;
    const timer = setInterval(
      () => void refresh({ silent: true }),
      LIVE_REFRESH_MS,
    );
    return () => clearInterval(timer);
  }, [hasInFlight, refresh]);

  const handleMerchantChange = (id: string) => {
    setMerchantId(id);
    setPage(1);
    storeMerchant(id);
  };

  const sendDisabledReason = useMemo(() => {
    if (!selectedMerchant) return "Select a merchant first";
    if (!balance) return "Loading balance…";
    if (!balance.payoutsEnabled)
      return "Payouts are disabled on the server (ADMIN_PAYOUTS_ENABLED)";
    if (!selectedMerchant.isActive) return "Merchant account is inactive";
    if (balance.available <= 0) return "No available balance to pay out";
    return null;
  }, [selectedMerchant, balance]);

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / Math.max(1, pagination.pageSize)),
  );

  return (
    <Container className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Payouts</h1>
          <p className="text-xs text-fg-muted">
            Send mobile money payouts through ITEC on behalf of a merchant
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="w-64">
            <Select
              label="Merchant"
              value={merchantId}
              onChange={(e) => handleMerchantChange(e.target.value)}
              className="w-full"
            >
              <option value="">Select a merchant…</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="secondary"
            onClick={() => void refresh()}
            disabled={!merchantId || loading}
            aria-label="Refresh"
            className="h-[38px] gap-1.5"
          >
            <RefreshIcon spinning={loading} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            disabled={sendDisabledReason !== null}
            title={sendDisabledReason ?? undefined}
            className="h-[38px] gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon />
            New payout
          </Button>
        </div>
      </div>

      {merchantsError && <ErrorBanner message={merchantsError} />}
      {loadError && (
        <ErrorBanner
          message={loadError}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
            >
              Retry
            </Button>
          }
        />
      )}

      {!merchantId ? (
        <Card className="py-12 text-center">
          <p className="text-sm font-semibold text-fg mb-1">
            Choose a merchant to get started
          </p>
          <p className="text-xs text-fg-muted">
            Their available balance and payout history will appear here.
          </p>
        </Card>
      ) : (
        <>
          {balance && !balance.payoutsEnabled && (
            <Card className="bg-warning/10 border-warning/30">
              <p className="text-xs text-warning-light">
                <span className="font-bold">Payouts are read-only.</span>{" "}
                Sending is disabled on the server until admin authentication is
                enforced. Set{" "}
                <code className="font-mono">ADMIN_PAYOUTS_ENABLED=true</code> on
                the payment service to enable it.
              </p>
            </Card>
          )}

          {/* Balance */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-primary-500/40">
              <StatLabel>Available to pay out</StatLabel>
              <div className="text-2xl font-bold text-fg mb-1 font-mono">
                {balance ? formatRwf(balance.available) : "—"}
              </div>
              <p className="text-xs text-fg-muted">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Loading…"}
              </p>
            </Card>
            <Card>
              <StatLabel>Collected</StatLabel>
              <div className="text-2xl font-bold text-fg mb-1 font-mono">
                {balance ? formatRwf(balance.collected) : "—"}
              </div>
              <p className="text-xs text-fg-muted">
                {balance
                  ? `${formatRwf(balance.collectionFees)} in fees`
                  : "Successful collections"}
              </p>
            </Card>
            <Card>
              <StatLabel>Paid out</StatLabel>
              <div className="text-2xl font-bold text-fg mb-1 font-mono">
                {balance ? formatRwf(balance.paidOut) : "—"}
              </div>
              <p className="text-xs text-fg-muted">Successful payouts</p>
            </Card>
            <Card>
              <StatLabel>In progress</StatLabel>
              <div className="text-2xl font-bold text-warning-light mb-1 font-mono">
                {balance ? formatRwf(balance.pendingPayouts) : "—"}
              </div>
              <p className="text-xs text-fg-muted">
                Reserved until ITEC confirms
              </p>
            </Card>
          </div>

          {/* History */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Payout history</h2>
              {hasInFlight && (
                <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  Updating live
                </span>
              )}
            </div>

            {loading && payouts.length === 0 ? (
              <div className="text-xs text-fg-muted text-center py-8">
                Loading payouts…
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-fg mb-1">No payouts yet</p>
                <p className="text-xs text-fg-muted">
                  Payouts sent for {selectedMerchant?.name ?? "this merchant"}{" "}
                  will be listed here.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-fg">
                              {payout.customerName || "—"}
                            </span>
                            <span className="text-xs font-mono text-fg-muted">
                              {formatRwandaPhone(payout.phoneNumber)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatRwf(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={statusVariant[payout.status]}>
                              {statusLabel[payout.status]}
                            </Badge>
                            {payout.failureReason && (
                              <span
                                className="text-xs text-fg-muted max-w-[240px] truncate"
                                title={payout.failureReason}
                              >
                                {payout.failureReason}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="font-mono text-xs text-fg-muted"
                            title={`Order ${payout.orderId}`}
                          >
                            {payout.ref.startsWith("pending_")
                              ? "Awaiting ITEC"
                              : payout.ref}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(payout.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-fg-muted">
                    Page {pagination.page} of {totalPages} ({pagination.total}{" "}
                    total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!pagination.hasMore || loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {/* Mounted only while open so every payout starts from a clean form */}
      {isDrawerOpen && selectedMerchant && balance && (
        <PayoutDrawer
          merchant={selectedMerchant}
          available={balance.available}
          onClose={() => setIsDrawerOpen(false)}
          onSubmitted={() => {
            setPage(1);
            void refresh({ silent: true });
          }}
        />
      )}
    </Container>
  );
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-medium text-fg-muted mb-2">
      {children}
    </span>
  );
}

function ErrorBanner({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="bg-destructive/10 border-destructive/20 flex items-center justify-between gap-3 py-3">
      <p className="text-xs text-destructive">{message}</p>
      {action}
    </Card>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={spinning ? "animate-spin" : undefined}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
