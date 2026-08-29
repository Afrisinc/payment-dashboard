import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
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
import { Input } from "@/components/ui/Input";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { useMerchants } from "@/hooks/useMerchants";
import type { Merchant } from "@/types";

interface MerchantsProps {
  selectedMerchant?: Merchant;
  onSelectMerchant: (merchant: Merchant) => void;
  onCloseDrawer: () => void;
}

export function Merchants({
  selectedMerchant,
  onSelectMerchant,
  onCloseDrawer,
}: MerchantsProps) {
  const {
    loading,
    error,
    listMerchants,
    createMerchant,
    updateWebhookConfig,
    deleteWebhookConfig,
    rotateApiKey,
  } = useMerchants();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [rotatedApiKeys, setRotatedApiKeys] = useState<Record<string, string>>(
    {},
  );
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    defaultFeePercent: 2.5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebhookEditOpen, setIsWebhookEditOpen] = useState(false);
  const [webhookFormData, setWebhookFormData] = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await listMerchants({ page: 1, limit: 50 });
        setMerchants(response.data || []);
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
      }
    };

    fetchMerchants();
  }, []);

  const toggleKeyReveal = (merchantId: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [merchantId]: !prev[merchantId],
    }));
  };

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
    } catch (err) {
      console.error("Failed to copy API key:", err);
    }
  };

  const handleRotateApiKey = async (merchantId: string) => {
    if (
      !window.confirm(
        "Rotating the API key immediately invalidates the current key. Continue?",
      )
    )
      return;

    setIsRotatingKey(true);
    try {
      const apiKey = await rotateApiKey(merchantId);
      setRotatedApiKeys((prev) => ({ ...prev, [merchantId]: apiKey }));
      setRevealedKeys((prev) => ({ ...prev, [merchantId]: true }));
    } catch (err) {
      console.error("Failed to rotate API key:", err);
    } finally {
      setIsRotatingKey(false);
    }
  };

  const handleSelectMerchant = (merchant: any) => {
    const mappedMerchant: Merchant = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      status: merchant.isActive ? "ACTIVE" : "INACTIVE",
      webhookUrl: merchant.webhookUrl,
      createdAt: merchant.createdAt,
    };
    onSelectMerchant(mappedMerchant);
  };

  const handleCreateMerchant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      await createMerchant({
        name: formData.name,
        email: formData.email,
        defaultFeePercent: formData.defaultFeePercent,
      });
      setFormData({ name: "", email: "", defaultFeePercent: 2.5 });
      setIsCreateOpen(false);

      // Refetch merchants
      const response = await listMerchants({ page: 1, limit: 50 });
      setMerchants(response.data || []);
    } catch (err) {
      console.error("Failed to create merchant:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWebhook = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!selectedMerchant || !webhookFormData) return;

    setWebhookLoading(true);
    setWebhookError(null);
    try {
      await updateWebhookConfig(selectedMerchant.id, {
        webhookUrl: webhookFormData,
      });
      setIsWebhookEditOpen(false);
      setWebhookFormData("");

      // Refetch merchants to update display
      const response = await listMerchants({ page: 1, limit: 50 });
      setMerchants(response.data || []);

      // Update selected merchant with new webhook URL
      const updatedMerchant = response.data?.find(
        (m) => m.id === selectedMerchant.id,
      );
      if (updatedMerchant) {
        handleSelectMerchant(updatedMerchant);
      }
    } catch (err) {
      setWebhookError((err as any).message || "Failed to update webhook");
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (
      !selectedMerchant ||
      !window.confirm("Delete this webhook configuration?")
    )
      return;

    setWebhookLoading(true);
    setWebhookError(null);
    try {
      await deleteWebhookConfig(selectedMerchant.id);
      setWebhookFormData("");

      // Refetch merchants to update display
      const response = await listMerchants({ page: 1, limit: 50 });
      setMerchants(response.data || []);

      // Update selected merchant with cleared webhook URL
      const updatedMerchant = response.data?.find(
        (m) => m.id === selectedMerchant.id,
      );
      if (updatedMerchant) {
        handleSelectMerchant(updatedMerchant);
      }
    } catch (err) {
      setWebhookError((err as any).message || "Failed to delete webhook");
    } finally {
      setWebhookLoading(false);
    }
  };

  const openWebhookEdit = (url: string) => {
    setWebhookFormData(url);
    setIsWebhookEditOpen(true);
  };

  return (
    <Container className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Merchants</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
        >
          New Merchant
        </Button>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <p className="text-xs text-destructive">
            Error loading merchants: {error.message}
          </p>
        </Card>
      )}

      {/* Merchants Table */}
      <Card>
        {loading ? (
          <div className="text-xs text-fg-muted text-center py-4">
            Loading merchants...
          </div>
        ) : merchants.length === 0 ? (
          <div className="text-xs text-fg-muted text-center py-4">
            No merchants found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell>
                    <button
                      onClick={() => handleSelectMerchant(merchant)}
                      className="flex items-center gap-3 hover:opacity-75"
                    >
                      <Avatar name={merchant.name} size="sm" variant="muted" />
                      <span className="text-sm font-medium text-fg">
                        {merchant.name}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {merchant.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={merchant.isActive ? "success" : "inactive"}>
                      {merchant.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Merchant Detail Drawer */}
      <Drawer
        isOpen={!!selectedMerchant}
        onClose={onCloseDrawer}
        width="md"
        title={selectedMerchant?.name}
      >
        {selectedMerchant && (
          <>
            <DrawerContent>
              <div className="flex flex-col gap-6">
                {/* General Tab Content */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Email
                    </h4>
                    <p className="text-xs text-fg">{selectedMerchant.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Status
                    </h4>
                    <Badge
                      variant={
                        selectedMerchant.status === "ACTIVE"
                          ? "success"
                          : "inactive"
                      }
                    >
                      {selectedMerchant.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-fg-muted mb-2">
                      Created At
                    </h4>
                    <p className="text-xs text-fg">
                      {new Date(selectedMerchant.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* API Key Section */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-fg mb-4">API Key</h3>
                  {rotatedApiKeys[selectedMerchant.id] ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type={
                            revealedKeys[selectedMerchant.id]
                              ? "text"
                              : "password"
                          }
                          value={rotatedApiKeys[selectedMerchant.id]}
                          readOnly
                          label="API Key"
                          className="font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyReveal(selectedMerchant.id)}
                          className="mt-6 p-2 text-fg-muted hover:text-fg transition-colors"
                        >
                          {revealedKeys[selectedMerchant.id] ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="1"></circle>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyApiKey(
                              rotatedApiKeys[selectedMerchant.id],
                            )
                          }
                          className="mt-6 p-2 text-fg-muted hover:text-fg transition-colors"
                          title="Copy API key"
                        >
                          {copiedApiKey ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                              ></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-fg-muted mb-2">
                        This key is only shown once. Store it securely — it
                        won't be retrievable after you leave this page.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isRotatingKey}
                        onClick={() => handleRotateApiKey(selectedMerchant.id)}
                      >
                        {isRotatingKey ? "Rotating..." : "Rotate Again"}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-fg-muted mb-3">
                        For security, API keys aren't stored in retrievable
                        form. Rotate to generate a new key and view it once.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isRotatingKey}
                        onClick={() => handleRotateApiKey(selectedMerchant.id)}
                      >
                        {isRotatingKey ? "Rotating..." : "Rotate API Key"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Webhook URL Section */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-fg mb-4">
                    Webhook Configuration
                  </h3>
                  {selectedMerchant.webhookUrl ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <h4 className="text-xs font-medium text-fg-muted mb-2">
                          Webhook URL
                        </h4>
                        <p className="text-xs font-mono text-fg break-all">
                          {selectedMerchant.webhookUrl}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            openWebhookEdit(selectedMerchant.webhookUrl || "")
                          }
                          disabled={webhookLoading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleDeleteWebhook}
                          disabled={webhookLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-fg-muted mb-3">
                      No webhook URL configured
                    </p>
                  )}
                  {!selectedMerchant.webhookUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openWebhookEdit("")}
                      disabled={webhookLoading}
                    >
                      Add Webhook URL
                    </Button>
                  )}
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

      {/* Create Merchant Drawer */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        width="md"
        title="Create Merchant"
      >
        <DrawerContent>
          <form onSubmit={handleCreateMerchant} className="flex flex-col gap-4">
            <div>
              <Input
                label="Merchant Name"
                placeholder="Enter merchant name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="Enter merchant email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Input
                label="Default Fee Percent"
                type="number"
                step="0.01"
                placeholder="2.5"
                value={formData.defaultFeePercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultFeePercent: Number.parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </form>
        </DrawerContent>
        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => setIsCreateOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => handleCreateMerchant(e as any)}
            disabled={isSubmitting || !formData.name || !formData.email}
          >
            {isSubmitting ? "Creating..." : "Create Merchant"}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Webhook Configuration Drawer */}
      <Drawer
        isOpen={isWebhookEditOpen}
        onClose={() => setIsWebhookEditOpen(false)}
        width="md"
        title={webhookFormData ? "Edit Webhook URL" : "Add Webhook URL"}
      >
        <DrawerContent>
          {webhookError && (
            <Card className="bg-destructive/10 border-destructive/20 mb-4">
              <p className="text-xs text-destructive">{webhookError}</p>
            </Card>
          )}
          <form onSubmit={handleUpdateWebhook} className="flex flex-col gap-4">
            <div>
              <Input
                label="Webhook URL"
                type="url"
                placeholder="https://example.com/webhook"
                value={webhookFormData}
                onChange={(e) => setWebhookFormData(e.target.value)}
                required
              />
            </div>
          </form>
        </DrawerContent>
        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => setIsWebhookEditOpen(false)}
            disabled={webhookLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => handleUpdateWebhook(e as any)}
            disabled={webhookLoading || !webhookFormData}
          >
            {webhookLoading ? "Saving..." : "Save Webhook"}
          </Button>
        </DrawerFooter>
      </Drawer>
    </Container>
  );
}
