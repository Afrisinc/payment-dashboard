import { useState } from "react";
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
import type { Merchant } from "@/types";
import { mockMerchants } from "@/lib/data";

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
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const toggleKeyReveal = (merchantId: string) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [merchantId]: !prev[merchantId],
    }));
  };

  return (
    <Container className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Merchants</h1>
        <Button variant="primary" size="sm">
          New Merchant
        </Button>
      </div>

      {/* Merchants Table */}
      <Card>
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
            {mockMerchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>
                  <button
                    onClick={() => onSelectMerchant(merchant)}
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
                  <Badge
                    variant={
                      merchant.status === "ACTIVE" ? "success" : "inactive"
                    }
                  >
                    {merchant.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-fg-muted">
                  {new Date(merchant.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        type={
                          revealedKeys[selectedMerchant.id]
                            ? "text"
                            : "password"
                        }
                        value={selectedMerchant.apiKey}
                        readOnly
                        label="API Key"
                        className="font-mono text-xs"
                      />
                      <button
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
                    </div>
                  </div>
                </div>

                {/* Webhook Section */}
                {selectedMerchant.webhookUrl && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-bold text-fg mb-4">
                      Webhook Configuration
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <h4 className="text-xs font-medium text-fg-muted mb-2">
                          Webhook URL
                        </h4>
                        <p className="text-xs text-fg font-mono break-all">
                          {selectedMerchant.webhookUrl}
                        </p>
                      </div>
                      {selectedMerchant.webhookSecret && (
                        <div>
                          <h4 className="text-xs font-medium text-fg-muted mb-2">
                            Webhook Secret
                          </h4>
                          <p className="text-xs text-fg-muted">Configured</p>
                        </div>
                      )}
                    </div>
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
