import { useEffect, useState } from "react";
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
import type { WebhookDelivery } from "@/types";
import { useWebhooks } from "@/hooks/useWebhooks";
import { useMerchants } from "@/hooks/useMerchants";

interface WebhooksProps {
  selectedWebhook?: WebhookDelivery;
  onSelectWebhook: (webhook: WebhookDelivery) => void;
  onCloseDrawer: () => void;
}

export function Webhooks({
  selectedWebhook,
  onSelectWebhook,
  onCloseDrawer,
}: WebhooksProps) {
  const {
    loading: webhooksLoading,
    error: webhooksError,
    listWebhookDeliveries,
  } = useWebhooks();
  const { listMerchants } = useMerchants();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("");

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await listMerchants({ page: 1, limit: 50 });
        setMerchants(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedMerchantId(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
      }
    };

    fetchMerchants();
  }, [listMerchants]);

  useEffect(() => {
    const fetchWebhooks = async () => {
      if (!selectedMerchantId) return;
      try {
        const response = await listWebhookDeliveries({
          page: 1,
          limit: 50,
          merchantId: selectedMerchantId,
        });
        setWebhooks(response.data || []);
      } catch (err) {
        console.error("Failed to fetch webhooks:", err);
      }
    };

    fetchWebhooks();
  }, [selectedMerchantId, listWebhookDeliveries]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "RETRYING":
        return "warning";
      case "PENDING":
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

  return (
    <Container className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>

      {/* Merchant Selection & Configuration */}
      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <Select
              label="Merchant"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
            >
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </Select>
          </div>
          {selectedMerchantId &&
            merchants.find((m) => m.id === selectedMerchantId)?.webhookUrl && (
              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-medium text-fg-muted mb-2">
                  Webhook URL
                </h3>
                <p className="text-xs font-mono text-fg break-all">
                  {
                    merchants.find((m) => m.id === selectedMerchantId)
                      ?.webhookUrl
                  }
                </p>
              </div>
            )}
        </div>
      </Card>

      {webhooksError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error loading webhooks: {webhooksError.message}
          </p>
        </Card>
      )}

      {/* Delivery Logs */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Delivery Logs</h2>
        {webhooksLoading ? (
          <div className="text-xs text-fg-muted text-center py-4">
            Loading webhooks...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-4">
            No webhooks found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <button
                      onClick={() => onSelectWebhook(webhook)}
                      className="text-primary-500 hover:underline font-mono text-xs"
                    >
                      {typeof webhook.payload === "object" &&
                      webhook.payload.event
                        ? String(webhook.payload.event)
                        : "Webhook"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(webhook.status)}>
                      {getStatusLabel(webhook.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-fg">
                    #{webhook.attempt}
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {new Date(webhook.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {webhook.response
                      ? webhook.response.substring(0, 20) + "..."
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Webhook Delivery Detail Drawer */}
      <Drawer
        isOpen={!!selectedWebhook}
        onClose={onCloseDrawer}
        width="md"
        title="Delivery Details"
      >
        {selectedWebhook && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-6">
                {/* Status */}
                <div>
                  <h3 className="text-xs font-bold text-fg-muted mb-3 uppercase">
                    Status
                  </h3>
                  <Badge
                    variant={getStatusBadgeVariant(selectedWebhook.status)}
                  >
                    {getStatusLabel(selectedWebhook.status)}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Attempt
                    </h4>
                    <p className="text-xs text-fg">
                      #{selectedWebhook.attempt}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Timestamp
                    </h4>
                    <p className="text-xs text-fg">
                      {new Date(selectedWebhook.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payload */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-fg mb-3">Payload</h3>
                  <div className="bg-bg-muted rounded-lg p-3 font-mono text-xs text-fg-muted overflow-x-auto max-h-40 overflow-y-auto">
                    <pre>
                      {JSON.stringify(selectedWebhook.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Response */}
                {selectedWebhook.response && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-bold text-fg mb-3">Response</h3>
                    <div className="bg-bg-muted rounded-lg p-3 font-mono text-xs text-fg-muted overflow-x-auto max-h-40 overflow-y-auto">
                      <pre>{selectedWebhook.response}</pre>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedWebhook.status !== "DELIVERED" && (
                  <div className="border-t border-border pt-4">
                    <Button variant="secondary" size="sm" className="w-full">
                      Retry Delivery
                    </Button>
                  </div>
                )}
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
