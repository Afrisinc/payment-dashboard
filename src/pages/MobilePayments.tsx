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
import { useMobilePayments } from "@/hooks/useMobilePayments";
import type {
  MobilePayment,
  MobilePaymentStatus,
  MobilePaymentType,
  MobileAccountInfo,
  CashinRequest,
  CashoutRequest,
} from "@/types";

interface MobilePaymentsProps {
  selectedMobilePayment?: MobilePayment;
  onSelectMobilePayment: (payment: MobilePayment) => void;
  onCloseDrawer: () => void;
}

type DrawerMode = "details" | "cashin" | "cashout";

export function MobilePayments({
  selectedMobilePayment,
  onSelectMobilePayment,
  onCloseDrawer,
}: MobilePaymentsProps) {
  const {
    loading,
    error,
    listPayments,
    cashin,
    cashout,
    getAccountInfo,
    refreshStatus,
  } = useMobilePayments();

  const [payments, setPayments] = useState<MobilePayment[]>([]);
  const [accountInfo, setAccountInfo] = useState<MobileAccountInfo | null>(
    null,
  );
  const [typeFilter, setTypeFilter] = useState<MobilePaymentType | "ALL">(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<MobilePaymentStatus | "ALL">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("details");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const [cashinForm, setCashinForm] = useState<CashinRequest>({
    orderId: "",
    amount: 0,
    phoneNumber: "",
    customerName: "",
    description: "",
  });

  const [cashoutForm, setCashoutForm] = useState<CashoutRequest>({
    orderId: "",
    amount: 0,
    phoneNumber: "",
    recipientName: "",
    description: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchAccountInfo();
  }, [typeFilter, statusFilter]);

  const fetchPayments = async () => {
    try {
      const filters: {
        type?: MobilePaymentType;
        status?: MobilePaymentStatus;
      } = {};
      if (typeFilter !== "ALL") filters.type = typeFilter;
      if (statusFilter !== "ALL") filters.status = statusFilter;

      const response = await listPayments({ ...filters, page: 1, limit: 50 });
      setPayments(response.data || []);
    } catch {
      // Error handled by hook
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const info = await getAccountInfo();
      setAccountInfo(info);
    } catch {
      // Error handled by hook
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.ref?.toLowerCase().includes(query) ||
      payment.orderId?.toLowerCase().includes(query) ||
      payment.phoneNumber?.includes(query)
    );
  });

  const getStatusBadgeVariant = (status: MobilePaymentStatus) => {
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

  const getTypeBadgeVariant = (type: MobilePaymentType) => {
    return type === "CASHIN" ? "success" : "warning";
  };

  const handleOpenCashin = () => {
    setDrawerMode("cashin");
    setCashinForm({
      orderId: `ORD-${Date.now()}`,
      amount: 0,
      phoneNumber: "",
      customerName: "",
      description: "",
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenCashout = () => {
    setDrawerMode("cashout");
    setCashoutForm({
      orderId: `PAY-${Date.now()}`,
      amount: 0,
      phoneNumber: "",
      recipientName: "",
      description: "",
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleSelectPayment = (payment: MobilePayment) => {
    setDrawerMode("details");
    onSelectMobilePayment(payment);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setFormError(null);
    onCloseDrawer();
  };

  const handleRefreshStatus = async (paymentId: string) => {
    setRefreshingId(paymentId);
    try {
      const updated = await refreshStatus(paymentId);
      if (selectedMobilePayment?.id === paymentId) {
        onSelectMobilePayment(updated);
      }
      fetchPayments();
    } catch {
      // Error handled by hook
    } finally {
      setRefreshingId(null);
    }
  };

  const canRetryPayment = (status: MobilePaymentStatus) =>
    status === "PENDING" || status === "PROCESSING" || status === "FAILED";

  const handleCashinSubmit = async () => {
    if (!cashinForm.phoneNumber || cashinForm.amount <= 0) {
      setFormError("Phone number and amount are required");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await cashin(cashinForm);
      handleCloseDrawer();
      fetchPayments();
      fetchAccountInfo();
    } catch (err) {
      setFormError((err as { message: string }).message || "Cashin failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCashoutSubmit = async () => {
    if (!cashoutForm.phoneNumber || cashoutForm.amount <= 0) {
      setFormError("Phone number and amount are required");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await cashout(cashoutForm);
      handleCloseDrawer();
      fetchPayments();
      fetchAccountInfo();
    } catch (err) {
      setFormError((err as { message: string }).message || "Cashout failed");
    } finally {
      setFormLoading(false);
    }
  };

  const getDrawerTitle = () => {
    switch (drawerMode) {
      case "cashin":
        return "Collect Payment";
      case "cashout":
        return "Send Payment";
      default:
        return selectedMobilePayment?.ref || "Payment Details";
    }
  };

  return (
    <Container className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mobile Payments</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleOpenCashout}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1.5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Send
          </Button>
          <Button onClick={handleOpenCashin}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            Collect
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error: {error.message || JSON.stringify(error)}
          </p>
        </Card>
      )}

      {accountInfo && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary-500/10 to-primary-500/5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-fg-muted">Balance</span>
              <span className="text-xl font-bold text-fg">
                {accountInfo.balance.toLocaleString()} {accountInfo.currency}
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-fg-muted">
                Merchant
              </span>
              <span className="text-sm font-semibold text-fg">
                {accountInfo.merchantName}
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-fg-muted">
                Cashin Fee
              </span>
              <span className="text-sm font-semibold text-fg">
                {accountInfo.inRate}%
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-fg-muted">
                Cashout Fee
              </span>
              <span className="text-sm font-semibold text-fg">
                {accountInfo.outRate}%
              </span>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Search"
            placeholder="Search by ref, order ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
          />
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as MobilePaymentType | "ALL")
            }
          >
            <option value="ALL">All Types</option>
            <option value="CASHIN">Cashin (Collect)</option>
            <option value="CASHOUT">Cashout (Send)</option>
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as MobilePaymentStatus | "ALL")
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

      <Card>
        {loading ? (
          <div className="text-xs text-fg-muted text-center py-8">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-8">
            No mobile payments found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow key={`${payment.id}-${index}`}>
                  <TableCell>
                    <button
                      onClick={() => handleSelectPayment(payment)}
                      className="text-primary-500 hover:underline font-mono text-xs"
                    >
                      {payment.ref || payment.orderId}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.phoneNumber}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {payment.amount.toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(payment.type)}>
                      {payment.type === "CASHIN" ? "Collect" : "Send"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {payment.fee?.toLocaleString() || 0} {payment.currency}
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
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

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        width="md"
        title={getDrawerTitle()}
      >
        {drawerMode === "details" && selectedMobilePayment && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={getTypeBadgeVariant(selectedMobilePayment.type)}
                  >
                    {selectedMobilePayment.type === "CASHIN"
                      ? "Collection"
                      : "Disbursement"}
                  </Badge>
                  <Badge
                    variant={getStatusBadgeVariant(
                      selectedMobilePayment.status,
                    )}
                  >
                    {selectedMobilePayment.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-fg-muted mb-2">
                    Amount
                  </h3>
                  <div className="text-3xl font-bold text-fg">
                    {selectedMobilePayment.amount.toLocaleString()}{" "}
                    {selectedMobilePayment.currency}
                  </div>
                  {selectedMobilePayment.fee > 0 && (
                    <p className="text-xs text-fg-muted mt-1">
                      Fee: {selectedMobilePayment.fee.toLocaleString()}{" "}
                      {selectedMobilePayment.currency}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Reference
                    </h4>
                    <p className="text-xs font-mono text-fg">
                      {selectedMobilePayment.ref}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Order ID
                    </h4>
                    <p className="text-xs font-mono text-fg">
                      {selectedMobilePayment.orderId}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Phone Number
                    </h4>
                    <p className="text-xs font-mono text-fg">
                      {selectedMobilePayment.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Provider
                    </h4>
                    <p className="text-xs text-fg">
                      {selectedMobilePayment.provider || "—"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Created At
                    </h4>
                    <p className="text-xs text-fg">
                      {new Date(
                        selectedMobilePayment.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedMobilePayment.description && (
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Description
                    </h4>
                    <p className="text-xs text-fg">
                      {selectedMobilePayment.description}
                    </p>
                  </div>
                )}
              </div>
            </DrawerContent>
            <DrawerFooter>
              {canRetryPayment(selectedMobilePayment.status) && (
                <Button
                  variant="secondary"
                  onClick={() => handleRefreshStatus(selectedMobilePayment.id)}
                  disabled={refreshingId === selectedMobilePayment.id}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`mr-1.5 ${refreshingId === selectedMobilePayment.id ? "animate-spin" : ""}`}
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  {refreshingId === selectedMobilePayment.id
                    ? "Refreshing..."
                    : "Refresh Status"}
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseDrawer}>
                Close
              </Button>
            </DrawerFooter>
          </>
        )}

        {drawerMode === "cashin" && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-xs text-destructive">{formError}</p>
                  </div>
                )}
                <Input
                  label="Order ID"
                  value={cashinForm.orderId}
                  onChange={(e) =>
                    setCashinForm({ ...cashinForm, orderId: e.target.value })
                  }
                  placeholder="Unique order identifier"
                />
                <Input
                  label="Phone Number"
                  value={cashinForm.phoneNumber}
                  onChange={(e) =>
                    setCashinForm({
                      ...cashinForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="0798760888"
                />
                <Input
                  label="Amount (RWF)"
                  type="number"
                  value={cashinForm.amount || ""}
                  onChange={(e) =>
                    setCashinForm({
                      ...cashinForm,
                      amount: Number(e.target.value),
                    })
                  }
                  placeholder="1000"
                />
                <Input
                  label="Customer Name (optional)"
                  value={cashinForm.customerName || ""}
                  onChange={(e) =>
                    setCashinForm({
                      ...cashinForm,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
                <Input
                  label="Description (optional)"
                  value={cashinForm.description || ""}
                  onChange={(e) =>
                    setCashinForm({
                      ...cashinForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Payment for services"
                />
              </div>
            </DrawerContent>
            <DrawerFooter>
              <Button
                variant="secondary"
                onClick={handleCloseDrawer}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCashinSubmit} disabled={formLoading}>
                {formLoading ? "Processing..." : "Collect Payment"}
              </Button>
            </DrawerFooter>
          </>
        )}

        {drawerMode === "cashout" && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-xs text-destructive">{formError}</p>
                  </div>
                )}
                <Input
                  label="Payout ID"
                  value={cashoutForm.orderId}
                  onChange={(e) =>
                    setCashoutForm({ ...cashoutForm, orderId: e.target.value })
                  }
                  placeholder="Unique payout identifier"
                />
                <Input
                  label="Phone Number"
                  value={cashoutForm.phoneNumber}
                  onChange={(e) =>
                    setCashoutForm({
                      ...cashoutForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="0798760888"
                />
                <Input
                  label="Amount (RWF)"
                  type="number"
                  value={cashoutForm.amount || ""}
                  onChange={(e) =>
                    setCashoutForm({
                      ...cashoutForm,
                      amount: Number(e.target.value),
                    })
                  }
                  placeholder="500"
                />
                <Input
                  label="Recipient Name (optional)"
                  value={cashoutForm.recipientName || ""}
                  onChange={(e) =>
                    setCashoutForm({
                      ...cashoutForm,
                      recipientName: e.target.value,
                    })
                  }
                  placeholder="Jane Smith"
                />
                <Input
                  label="Description (optional)"
                  value={cashoutForm.description || ""}
                  onChange={(e) =>
                    setCashoutForm({
                      ...cashoutForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Refund for order #123"
                />
              </div>
            </DrawerContent>
            <DrawerFooter>
              <Button
                variant="secondary"
                onClick={handleCloseDrawer}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCashoutSubmit} disabled={formLoading}>
                {formLoading ? "Processing..." : "Send Payment"}
              </Button>
            </DrawerFooter>
          </>
        )}
      </Drawer>
    </Container>
  );
}
