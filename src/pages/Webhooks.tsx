import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/Drawer";
import { useWebhooks } from "@/hooks/useWebhooks";
import { useMerchants } from "@/hooks/useMerchants";
import { formatDateTime, formatRelative } from "@/lib/datetime";
import type {
  ApiError,
  Merchant,
  Pagination,
  WebhookDelivery,
  WebhookDeliveryStatus,
} from "@/types/payment";

const PAGE_SIZE = 25;

interface WebhooksProps {
  selectedWebhook?: WebhookDelivery;
  onSelectWebhook: (webhook: WebhookDelivery) => void;
  onCloseDrawer: () => void;
}

type BadgeVariant = "success" | "warning" | "processing" | "destructive";

/** PENDING covers both "queued" (never tried) and "retrying" (failed, retry scheduled) */
function describeStatus(d: WebhookDelivery): {
  label: string;
  variant: BadgeVariant;
} {
  if (d.status === "DELIVERED")
    return { label: "Delivered", variant: "success" };
  if (d.status === "FAILED") return { label: "Failed", variant: "destructive" };
  if (d.attempts > 0) return { label: "Retrying", variant: "warning" };
  return { label: "Queued", variant: "processing" };
}

function responseCodeVariant(code: number): BadgeVariant {
  if (code >= 200 && code < 300) return "success";
  if (code >= 400 && code < 500) return "warning";
  return "destructive";
}

/** Payment summary from the payload sent to the merchant */
function payloadSummary(payload: Record<string, unknown>): {
  orderId?: string;
  amount?: string;
  paymentStatus?: string;
} {
  const data =
    payload && typeof payload.data === "object" && payload.data !== null
      ? (payload.data as Record<string, unknown>)
      : {};
  const amount =
    typeof data.amount === "number"
      ? `${data.amount.toLocaleString("en-US")} ${String(data.currency ?? "").toUpperCase()}`.trim()
      : undefined;

  return {
    orderId: typeof data.orderId === "string" ? data.orderId : undefined,
    amount,
    paymentStatus: typeof data.status === "string" ? data.status : undefined,
  };
}

export function Webhooks({
  selectedWebhook,
  onSelectWebhook,
  onCloseDrawer,
}: WebhooksProps) {
  const { loading, error, listWebhookDeliveries, retryWebhookDelivery } =
    useWebhooks();
  const { listMerchants } = useMerchants();

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [status, setStatus] = useState<WebhookDeliveryStatus | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    hasMore: false,
  });
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    listMerchants({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" })
      .then((response) => setMerchants(response.data ?? []))
      .catch(() => {
        // Merchant filter is optional; deliveries still load for all merchants
      });
  }, [listMerchants]);

  const fetchDeliveries = useCallback(async () => {
    try {
      const response = await listWebhookDeliveries({
        page,
        limit: PAGE_SIZE,
        merchantId: merchantId || undefined,
        status: status || undefined,
      });
      setDeliveries(response.data ?? []);
      setPagination(response.pagination);
    } catch {
      // Surfaced through the hook's error state
    }
  }, [listWebhookDeliveries, page, merchantId, status]);

  useEffect(() => {
    void fetchDeliveries();
  }, [fetchDeliveries]);

  const handleRetry = async (delivery: WebhookDelivery) => {
    setRetryingId(delivery.id);
    setRetryError(null);
    try {
      const updated = await retryWebhookDelivery(delivery.id);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d)),
      );
      if (selectedWebhook?.id === updated.id) onSelectWebhook(updated);
    } catch (err) {
      setRetryError((err as ApiError).message || "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / Math.max(1, pagination.pageSize)),
  );
  const showMerchantColumn = !merchantId;

  return (
    <Container className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Webhooks</h1>
          <p className="text-xs text-fg-muted">
            Payment notifications sent to merchant endpoints
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void fetchDeliveries()}
          disabled={loading}
          className="gap-1.5"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={loading ? "animate-spin" : undefined}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Merchant"
            value={merchantId}
            onChange={(e) => {
              setMerchantId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All merchants</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as WebhookDeliveryStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="PENDING">Pending / retrying</option>
            <option value="FAILED">Failed</option>
          </Select>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-fg-muted">
              Webhook URL
            </span>
            <p className="text-xs font-mono text-fg break-all py-2">
              {merchantId
                ? (merchants.find((m) => m.id === merchantId)?.webhookUrl ??
                  "Not configured")
                : "Select a merchant"}
            </p>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error loading webhooks: {error.message}
          </p>
        </Card>
      )}
      {retryError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">{retryError}</p>
        </Card>
      )}

      {/* Delivery Logs */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Delivery Logs</h2>
        {loading && deliveries.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-8">
            Loading deliveries…
          </div>
        ) : deliveries.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-8">
            No webhook deliveries found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Event</TableHead>
                  <TableHead>Payment</TableHead>
                  {showMerchantColumn && <TableHead>Merchant</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Last attempt</TableHead>
                  <TableHead>Next retry / Delivered</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => {
                  const statusInfo = describeStatus(delivery);
                  const summary = payloadSummary(delivery.payload);
                  return (
                    <TableRow
                      key={delivery.id}
                      onClick={() => onSelectWebhook(delivery)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="text-primary-500 font-mono text-xs">
                          {delivery.eventType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-fg">
                            {summary.orderId ?? "—"}
                          </span>
                          {summary.amount && (
                            <span className="text-xs text-fg-muted">
                              {summary.amount}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {showMerchantColumn && (
                        <TableCell className="text-xs text-fg-muted">
                          {delivery.merchantName ?? "—"}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                          {delivery.errorMessage && (
                            <span
                              className="text-xs text-fg-muted max-w-[200px] truncate"
                              title={delivery.errorMessage}
                            >
                              {delivery.errorMessage}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-fg font-mono">
                        {delivery.attempts} / {delivery.maxAttempts}
                      </TableCell>
                      <TableCell>
                        {delivery.responseCode !== null ? (
                          <Badge
                            variant={responseCodeVariant(delivery.responseCode)}
                            className="font-mono"
                          >
                            {delivery.responseCode}
                          </Badge>
                        ) : (
                          <span
                            className="text-xs text-fg-muted"
                            title="No HTTP response received"
                          >
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-fg-muted whitespace-nowrap">
                        {formatDateTime(delivery.lastAttempt)}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {delivery.deliveredAt ? (
                          <span className="text-success-light">
                            {formatDateTime(delivery.deliveredAt)}
                          </span>
                        ) : delivery.nextRetry ? (
                          <span
                            className="text-warning-light"
                            title={formatDateTime(delivery.nextRetry)}
                          >
                            {formatRelative(delivery.nextRetry)}
                          </span>
                        ) : (
                          <span className="text-fg-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-fg-muted whitespace-nowrap">
                        {formatDateTime(delivery.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      {/* Delivery Detail Drawer */}
      <Drawer
        isOpen={!!selectedWebhook}
        onClose={onCloseDrawer}
        width="lg"
        title="Delivery details"
      >
        {selectedWebhook && (
          <DeliveryDetails
            delivery={selectedWebhook}
            retrying={retryingId === selectedWebhook.id}
            onRetry={() => void handleRetry(selectedWebhook)}
            onClose={onCloseDrawer}
          />
        )}
      </Drawer>
    </Container>
  );
}

function DeliveryDetails({
  delivery,
  retrying,
  onRetry,
  onClose,
}: {
  delivery: WebhookDelivery;
  retrying: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  const statusInfo = describeStatus(delivery);
  const summary = payloadSummary(delivery.payload);

  return (
    <>
      <DrawerContent>
        <div className="flex flex-col gap-6">
          {/* Overview */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-sm text-fg">
                {delivery.eventType}
              </span>
              <span className="text-xs text-fg-muted">
                {delivery.merchantName ?? delivery.merchantId}
              </span>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Attempts">
              {delivery.attempts} / {delivery.maxAttempts}
            </Stat>
            <Stat label="HTTP response">{delivery.responseCode ?? "None"}</Stat>
            <Stat label="Payment status">{summary.paymentStatus ?? "—"}</Stat>
          </div>

          {delivery.errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <h4 className="text-xs font-semibold text-destructive mb-1">
                Last error
              </h4>
              <p className="text-xs text-destructive/90 font-mono break-words">
                {delivery.errorMessage}
              </p>
            </div>
          )}

          {/* Timeline */}
          <Section title="Timeline">
            <Field label="Created">{formatDateTime(delivery.createdAt)}</Field>
            <Field label="Last attempt">
              {formatDateTime(delivery.lastAttempt)}
            </Field>
            <Field label="Next retry">
              {delivery.nextRetry
                ? `${formatDateTime(delivery.nextRetry)} (${formatRelative(delivery.nextRetry)})`
                : "—"}
            </Field>
            <Field label="Delivered">
              {formatDateTime(delivery.deliveredAt)}
            </Field>
          </Section>

          {/* Identifiers */}
          <Section title="Identifiers">
            <Field label="Delivery ID" copy={delivery.id} mono>
              {delivery.id}
            </Field>
            <Field label="Payment ID" copy={delivery.paymentId} mono>
              {delivery.paymentId}
            </Field>
            <Field label="Order ID" copy={summary.orderId} mono>
              {summary.orderId ?? "—"}
            </Field>
            <Field label="Amount">{summary.amount ?? "—"}</Field>
            <Field label="Merchant ID" copy={delivery.merchantId} mono>
              {delivery.merchantId}
            </Field>
            <Field
              label="Endpoint"
              copy={delivery.webhookUrl ?? undefined}
              mono
            >
              {delivery.webhookUrl ?? "Not configured"}
            </Field>
          </Section>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-fg-muted uppercase">
                Payload
              </h3>
              <CopyButton value={JSON.stringify(delivery.payload, null, 2)} />
            </div>
            <pre className="bg-bg-muted rounded-lg p-3 font-mono text-xs text-fg-muted overflow-auto max-h-80">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          </div>
        </div>
      </DrawerContent>
      <DrawerFooter className="justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {delivery.status !== "DELIVERED" && (
          <Button
            onClick={onRetry}
            disabled={retrying}
            className="disabled:opacity-60 disabled:cursor-wait"
          >
            {retrying ? "Retrying…" : "Retry delivery"}
          </Button>
        )}
      </DrawerFooter>
    </>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <span className="block text-xs text-fg-muted mb-1">{label}</span>
      <span className="text-sm font-semibold text-fg font-mono">
        {children}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-fg-muted uppercase mb-2">
        {title}
      </h3>
      <dl className="rounded-lg border border-border divide-y divide-border">
        {children}
      </dl>
    </div>
  );
}

function Field({
  label,
  children,
  copy,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  copy?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <dt className="text-xs text-fg-muted flex-none">{label}</dt>
      <dd className="flex items-center gap-2 min-w-0">
        <span
          className={
            mono
              ? "text-xs font-mono text-fg break-all text-right"
              : "text-xs text-fg text-right"
          }
        >
          {children}
        </span>
        {copy && <CopyButton value={copy} />}
      </dd>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context): nothing to do
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex-none text-xs text-primary-400 hover:text-primary-300"
      aria-label="Copy"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
