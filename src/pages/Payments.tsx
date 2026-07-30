import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { usePayments } from "@/hooks/usePayments";
import type {
  Payment,
  PaymentStatus,
  Provider,
  PaymentType,
  AppState,
} from "@/types";
import type { ApiError } from "@/types/payment";

interface PaymentsProps {
  selectedPayment?: Payment;
  onSelectPayment: (payment: Payment) => void;
  onCloseDrawer: () => void;
  searchQuery: string;
  statusFilter: PaymentStatus | "ALL";
  providerFilter: Provider | "ALL";
  typeFilter: PaymentType | "ALL";
  onUpdateFilters: (filters: Partial<AppState>) => void;
}

export function Payments({
  selectedPayment,
  onSelectPayment,
  onCloseDrawer,
  searchQuery,
  statusFilter,
  providerFilter,
  typeFilter,
  onUpdateFilters,
}: PaymentsProps) {
  const { loading, error, listAdminPayments, refreshPaymentStatus } =
    usePayments();
  const [payments, setPayments] = useState<any[]>([]);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const filters: any = { page: 1, limit: 50 };

        if (statusFilter !== "ALL") filters.status = statusFilter;
        if (typeFilter !== "ALL") {
          filters.type =
            typeFilter === "MOMO" ? "mobile" : typeFilter.toLowerCase();
        }
        if (providerFilter !== "ALL") {
          filters.provider = providerFilter;
        }

        const response = await listAdminPayments(filters);
        setPayments(response.data || []);
      } catch {
        // Error handled by hook
      }
    };

    fetchPayments();
  }, [statusFilter, typeFilter, providerFilter, listAdminPayments]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !searchQuery ||
      payment.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.merchantId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SUCCESSFUL":
        return "success";
      case "PENDING":
        return "warning";
      case "PROCESSING":
        return "processing";
      case "FAILED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const canRetryPayment = (status: string) =>
    status === "PENDING" || status === "PROCESSING" || status === "FAILED";

  const handleRefreshStatus = async (paymentId: string) => {
    setRefreshingId(paymentId);
    setRetryError(null);
    try {
      const response = await refreshPaymentStatus(paymentId);
      const updatedPayment = response.data || response;
      setPayments((prevPayments) =>
        prevPayments.map((p) =>
          p.id === paymentId ? { ...p, ...updatedPayment } : p,
        ),
      );
      if (selectedPayment?.id === paymentId) {
        const mappedPayment: Payment = {
          id: updatedPayment.id,
          reference: updatedPayment.ref,
          amount: selectedPayment.amount,
          type:
            updatedPayment.type === "mobile"
              ? "MOMO"
              : updatedPayment.type.toUpperCase(),
          status: updatedPayment.status,
          provider: updatedPayment.provider,
          merchant: updatedPayment.merchantId,
          timestamp: selectedPayment.timestamp,
        };
        onSelectPayment(mappedPayment);
      }
    } catch (err) {
      const errorMsg =
        (err as ApiError)?.message ||
        "Failed to refresh payment status";
      setRetryError(errorMsg);
      setTimeout(() => setRetryError(null), 5000);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleSelectPayment = (payment: any) => {
    const mappedPayment: Payment = {
      id: payment.id,
      reference: payment.ref,
      amount: payment.amount,
      type: payment.type === "mobile" ? "MOMO" : payment.type.toUpperCase(),
      status: payment.status,
      provider: payment.provider,
      merchant: payment.merchantId,
      timestamp: payment.createdAt,
    };
    onSelectPayment(mappedPayment);
  };

  return (
    <Container className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error loading payments: {error.message || JSON.stringify(error)}
          </p>
        </Card>
      )}

      {retryError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">{retryError}</p>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-4 gap-3">
          <Input
            label="Search by reference or merchant"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            }
          />
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) =>
              onUpdateFilters({
                typeFilter: e.target.value as PaymentType | "ALL",
              })
            }
          >
            <option value="ALL">All Types</option>
            <option value="MOMO">Mobile Money</option>
            <option value="CARD">Card</option>
            <option value="STRIPE">Stripe</option>
          </Select>
          <Select
            label="Provider"
            value={providerFilter}
            onChange={(e) =>
              onUpdateFilters({
                providerFilter: e.target.value as Provider | "ALL",
              })
            }
          >
            <option value="ALL">All Providers</option>
            <option value="ITEC">ITEC</option>
            <option value="PAYPACK">Paypack</option>
            <option value="STRIPE">Stripe</option>
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              onUpdateFilters({
                statusFilter: e.target.value as PaymentStatus | "ALL",
              })
            }
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </Select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        {loading && payments.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-4">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-4">
            No payments found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow key={`${payment.id}-${payment.ref}-${index}`}>
                  <TableCell>
                    <button
                      onClick={() => handleSelectPayment(payment)}
                      className="text-primary-500 hover:underline font-mono text-xs"
                    >
                      {payment.ref}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.amount.toLocaleString()} FRW
                  </TableCell>
                  <TableCell>{payment.type.toUpperCase()}</TableCell>
                  <TableCell>{payment.provider}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {payment.merchantId}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(payment.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {canRetryPayment(payment.status) && (
                      <button
                        onClick={() => handleRefreshStatus(payment.id)}
                        disabled={refreshingId === payment.id}
                        className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400 disabled:opacity-50"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={
                            refreshingId === payment.id ? "animate-spin" : ""
                          }
                        >
                          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                        </svg>
                        {refreshingId === payment.id ? "..." : "Retry"}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Payment Detail Drawer */}
      <Drawer
        isOpen={!!selectedPayment}
        onClose={onCloseDrawer}
        width="md"
        title={selectedPayment?.reference}
      >
        {selectedPayment && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-6">
                {/* Status Section */}
                <div>
                  <h3 className="text-xs font-bold text-fg-muted mb-3 uppercase">
                    Status
                  </h3>
                  <Badge
                    variant={getStatusBadgeVariant(selectedPayment.status)}
                  >
                    {getStatusLabel(selectedPayment.status)}
                  </Badge>
                </div>

                {/* Amount Section */}
                <div>
                  <h3 className="text-xs font-bold text-fg-muted mb-2">
                    Amount
                  </h3>
                  <div className="text-3xl font-bold text-fg mb-1">
                    {selectedPayment.amount.toLocaleString()} FRW
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Reference
                    </h4>
                    <p className="text-xs font-mono text-fg">
                      {selectedPayment.reference}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Type
                    </h4>
                    <p className="text-xs text-fg">{selectedPayment.type}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Provider
                    </h4>
                    <p className="text-xs text-fg">
                      {selectedPayment.provider}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Merchant
                    </h4>
                    <p className="text-xs text-fg">
                      {selectedPayment.merchant}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Timestamp
                    </h4>
                    <p className="text-xs text-fg">
                      {new Date(selectedPayment.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </DrawerContent>
            <DrawerFooter>
              <Button variant="secondary" onClick={onCloseDrawer}>
                Close
              </Button>
            </DrawerFooter>
          </>
        )}
      </Drawer>
    </Container>
  );
}
