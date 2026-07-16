import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import { usePayments } from "@/hooks/usePayments";
import type { Payment } from "@/types";

interface DashboardProps {
  onSelectPayment: (payment: Payment) => void;
}

export function Dashboard({ onSelectPayment }: DashboardProps) {
  const {
    loading: metricsLoading,
    error: metricsError,
    getMetrics,
  } = useDashboard();
  const { loading: paymentsLoading, listAdminPayments } = usePayments();

  const [metrics, setMetrics] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, paymentsData] = await Promise.all([
          getMetrics(),
          listAdminPayments({ page: 1, limit: 5, status: "SUCCESSFUL" }),
        ]);
        setMetrics(metricsData);
        setRecentPayments(paymentsData.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Dashboard</h1>
          <p className="text-xs text-fg-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · metrics refresh every 30s
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </Button>
          <Button variant="secondary" size="sm">
            Last 30 days
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>
        </div>
      </div>

      {metricsError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error loading metrics: {metricsError.message}
          </p>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card hover>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-fg-muted">
              Transactions today
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0293E4"
              strokeWidth="2"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
            </svg>
          </div>
          <div className="text-2xl font-bold text-fg mb-1">
            {metricsLoading ? "-" : metrics?.totalTransactionsToday || 0}
          </div>
          <div className="text-xs font-semibold text-success-light">
            ↑ 12%{" "}
            <span className="font-normal text-fg-muted">vs yesterday</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-fg-muted">
              Volume today
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(152, 60%, 50%)"
              strokeWidth="2"
            >
              <path d="M22 7l-8.5 8.5-5-5L2 17"></path>
              <path d="M16 7h6v6"></path>
            </svg>
          </div>
          <div className="text-2xl font-bold text-fg mb-1">
            {metricsLoading
              ? "-"
              : (metrics?.totalVolumeToday || 0).toLocaleString()}{" "}
            FRW
          </div>
          <div className="text-xs font-semibold text-success-light">
            ↑ 8% <span className="font-normal text-fg-muted">vs yesterday</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-fg-muted">
              Successful
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="text-2xl font-bold text-fg mb-1">
            {metricsLoading
              ? "-"
              : metrics?.statusDistribution?.SUCCESSFUL || 0}
          </div>
          <div className="text-xs font-semibold text-success-light">
            ↑ 5% <span className="font-normal text-fg-muted">this week</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-fg-muted">Pending</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FCA311"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="text-2xl font-bold text-fg mb-1">
            {metricsLoading ? "-" : metrics?.statusDistribution?.PENDING || 0}
          </div>
          <div className="text-xs font-semibold text-warning-light">
            ↑ 2% <span className="font-normal text-fg-muted">this week</span>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
        {paymentsLoading ? (
          <div className="text-xs text-fg-muted text-center py-4">
            Loading payments...
          </div>
        ) : recentPayments.length === 0 ? (
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
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
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
                    {new Date(payment.createdAt).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Container>
  );
}
