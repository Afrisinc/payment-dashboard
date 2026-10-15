import { useMemo, useRef, useState } from "react";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { usePayouts } from "@/hooks/usePayouts";
import { formatRwf } from "@/lib/money";
import { formatRwandaPhone, parseRwandaPhone } from "@/lib/phone";
import type {
  ApiError,
  CreatePayoutRequest,
  Merchant,
  PayoutResult,
} from "@/types/payment";

interface PayoutDrawerProps {
  merchant: Merchant;
  available: number;
  onClose: () => void;
  onSubmitted: () => void;
}

type Step = "form" | "review" | "result";

interface FormState {
  phone: string;
  amount: string;
  recipientName: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  phone: "",
  amount: "",
  recipientName: "",
  description: "",
};

function newIdempotencyKey(): string {
  // randomUUID is only exposed on secure origins (https / localhost)
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
  return `admin-payout-${id}`;
}

/**
 * Three-step payout flow: form -> review -> result.
 * The orderId doubles as idempotency key: retrying the same payout after an error or timeout
 * reuses it, so the backend returns the existing payout instead of sending money twice.
 */
export function PayoutDrawer({
  merchant,
  available,
  onClose,
  onSubmitted,
}: PayoutDrawerProps) {
  const { createPayout } = usePayouts();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    phone: false,
    amount: false,
    recipientName: false,
    description: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<PayoutResult | null>(null);

  // Idempotency key bound to the exact payload it was first sent with
  const attempt = useRef<{ key: string; payload: string } | null>(null);

  const phone = parseRwandaPhone(form.phone);
  const amount = Number(form.amount);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.phone.trim()) next.phone = "Enter the recipient's phone number";
    else if (!phone)
      next.phone = "Enter a valid MTN (078/079) or Airtel (072/073) number";

    if (!form.amount) next.amount = "Enter an amount";
    else if (!Number.isInteger(amount) || amount < 1)
      next.amount = "Amount must be a whole number of at least 1 RWF";
    else if (amount > available)
      next.amount = `Exceeds the available balance of ${formatRwf(available)}`;

    return next;
  }, [form.phone, form.amount, phone, amount, available]);

  const isValid = Object.keys(errors).length === 0;

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      phone: true,
      amount: true,
      recipientName: true,
      description: true,
    });
    if (isValid) {
      setSubmitError(null);
      setStep("review");
    }
  };

  const handleSend = async () => {
    if (!phone || isSending) return;

    const body: Omit<CreatePayoutRequest, "orderId"> = {
      amount,
      phoneNumber: phone.international,
      recipientName: form.recipientName.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    const payload = JSON.stringify(body);
    if (!attempt.current || attempt.current.payload !== payload) {
      attempt.current = { key: newIdempotencyKey(), payload };
    }

    setIsSending(true);
    setSubmitError(null);
    try {
      const payout = await createPayout(merchant.id, {
        ...body,
        orderId: attempt.current.key,
      });
      setResult(payout);
      setStep("result");
      onSubmitted();
    } catch (err) {
      setSubmitError(err as ApiError);
      // The payout may have been recorded even though the request failed
      onSubmitted();
    } finally {
      setIsSending(false);
    }
  };

  const startNewPayout = () => {
    attempt.current = null;
    setForm(EMPTY_FORM);
    setTouched({
      phone: false,
      amount: false,
      recipientName: false,
      description: false,
    });
    setSubmitError(null);
    setResult(null);
    setStep("form");
  };

  const handleClose = () => {
    if (!isSending) onClose();
  };

  const title =
    step === "form"
      ? "New payout"
      : step === "review"
        ? "Review payout"
        : "Payout submitted";

  return (
    <Drawer isOpen onClose={handleClose} width="md" title={title}>
      <div className="flex flex-col min-h-full">
        <StepIndicator step={step} />

        {step === "form" && (
          <form
            onSubmit={handleContinue}
            className="flex flex-col flex-1"
            noValidate
          >
            <DrawerContent className="flex flex-col gap-5 flex-1">
              <div className="rounded-lg border border-border bg-bg-muted px-4 py-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-fg-muted">Paying out for</span>
                  <span className="text-sm font-semibold text-fg">
                    {merchant.name}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-fg-muted">Available</span>
                  <span className="text-sm font-semibold font-mono text-fg">
                    {formatRwf(available)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Recipient phone number"
                  placeholder="078 123 4567"
                  inputMode="tel"
                  autoComplete="off"
                  autoFocus
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  error={touched.phone ? errors.phone : undefined}
                />
                {phone && (
                  <span className="text-xs text-fg-muted">
                    {phone.network} Mobile Money ·{" "}
                    <span className="font-mono">
                      {formatRwandaPhone(phone.local)}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Input
                    label="Amount (RWF)"
                    placeholder="0"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.amount}
                    onChange={(e) =>
                      update("amount", e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                    error={touched.amount ? errors.amount : undefined}
                    className="font-mono pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      update("amount", String(Math.max(0, available)));
                      setTouched((t) => ({ ...t, amount: true }));
                    }}
                    className="absolute right-2 top-[26px] px-2 py-1 rounded text-xs font-semibold text-primary-400 hover:bg-primary-500/10"
                  >
                    Max
                  </button>
                </div>
                {amount > 0 && !errors.amount && (
                  <span className="text-xs text-fg-muted">
                    {formatRwf(available - amount)} will remain available
                  </span>
                )}
              </div>

              <Input
                label="Recipient name (optional)"
                placeholder="Jane Uwase"
                maxLength={255}
                value={form.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-fg-muted">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Refund for order #1234"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg placeholder:text-fg-muted transition-colors hover:border-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
            </DrawerContent>
            <DrawerFooter className="justify-end">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Review payout</Button>
            </DrawerFooter>
          </form>
        )}

        {step === "review" && phone && (
          <>
            <DrawerContent className="flex flex-col gap-5 flex-1">
              <div className="text-center py-2">
                <span className="text-xs text-fg-muted">You are sending</span>
                <div className="text-3xl font-bold text-fg font-mono mt-1">
                  {formatRwf(amount)}
                </div>
              </div>

              <dl className="rounded-lg border border-border divide-y divide-border">
                <SummaryRow label="To">
                  <span className="font-mono">
                    {formatRwandaPhone(phone.local)}
                  </span>
                  <Badge variant="default" className="ml-2">
                    {phone.network}
                  </Badge>
                </SummaryRow>
                {form.recipientName.trim() && (
                  <SummaryRow label="Recipient">
                    {form.recipientName.trim()}
                  </SummaryRow>
                )}
                <SummaryRow label="On behalf of">{merchant.name}</SummaryRow>
                <SummaryRow label="Provider">ITEC Mobile Money</SummaryRow>
                {form.description.trim() && (
                  <SummaryRow label="Reason">
                    {form.description.trim()}
                  </SummaryRow>
                )}
                <SummaryRow label="Balance after">
                  <span className="font-mono">
                    {formatRwf(available - amount)}
                  </span>
                </SummaryRow>
              </dl>

              <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3">
                <p className="text-xs text-warning-light">
                  Mobile money payouts are sent immediately and cannot be
                  reversed. Check the number before confirming.
                </p>
              </div>

              {submitError && <SubmitErrorNotice error={submitError} />}
            </DrawerContent>
            <DrawerFooter className="justify-end">
              <Button
                variant="secondary"
                onClick={() => setStep("form")}
                disabled={isSending}
              >
                Back
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="min-w-[150px] disabled:opacity-60 disabled:cursor-wait"
              >
                {isSending
                  ? "Sending…"
                  : submitError
                    ? "Retry payout"
                    : `Send ${formatRwf(amount)}`}
              </Button>
            </DrawerFooter>
          </>
        )}

        {step === "result" && result && (
          <>
            <DrawerContent className="flex flex-col gap-5 flex-1">
              <ResultHeader result={result} />
              <dl className="rounded-lg border border-border divide-y divide-border">
                <SummaryRow label="Amount">
                  <span className="font-mono">{formatRwf(result.amount)}</span>
                </SummaryRow>
                <SummaryRow label="To">
                  <span className="font-mono">
                    {formatRwandaPhone(result.phoneNumber)}
                  </span>
                </SummaryRow>
                <SummaryRow label="Reference">
                  <span className="font-mono text-xs break-all">
                    {result.ref.startsWith("pending_")
                      ? "Awaiting ITEC"
                      : result.ref}
                  </span>
                </SummaryRow>
                <SummaryRow label="Order ID">
                  <span className="font-mono text-xs break-all">
                    {result.orderId}
                  </span>
                </SummaryRow>
              </dl>
            </DrawerContent>
            <DrawerFooter className="justify-end">
              <Button variant="secondary" onClick={startNewPayout}>
                New payout
              </Button>
              <Button onClick={onClose}>Done</Button>
            </DrawerFooter>
          </>
        )}
      </div>
    </Drawer>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "form", label: "Details" },
    { id: "review", label: "Review" },
    { id: "result", label: "Done" },
  ];
  const current = steps.findIndex((s) => s.id === step);

  return (
    <ol className="flex items-center gap-2 px-6 pt-4">
      {steps.map((s, index) => (
        <li key={s.id} className="flex items-center gap-2 flex-1">
          <span
            className={
              index <= current
                ? "flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold"
                : "flex items-center justify-center w-5 h-5 rounded-full bg-bg-muted text-fg-muted text-xs font-bold"
            }
          >
            {index + 1}
          </span>
          <span
            className={
              index === current
                ? "text-xs font-semibold text-fg"
                : "text-xs text-fg-muted"
            }
          >
            {s.label}
          </span>
          {index < steps.length - 1 && (
            <span className="flex-1 h-px bg-border" />
          )}
        </li>
      ))}
    </ol>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="text-xs text-fg-muted flex-none">{label}</dt>
      <dd className="text-sm text-fg text-right flex items-center justify-end min-w-0">
        {children}
      </dd>
    </div>
  );
}

function SubmitErrorNotice({ error }: { error: ApiError }) {
  // No response or a server error: ITEC may still have processed the payout
  const outcomeUnknown = error.status === undefined || error.status >= 500;

  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 flex flex-col gap-1">
      <p className="text-xs font-semibold text-destructive">
        {outcomeUnknown
          ? "We couldn't confirm this payout"
          : "The payout was not sent"}
      </p>
      <p className="text-xs text-destructive/90 break-words">{error.message}</p>
      {outcomeUnknown && (
        <p className="text-xs text-fg-muted mt-1">
          Check the payout history before trying again. Retrying this exact
          payout is safe: it will not be sent twice.
        </p>
      )}
    </div>
  );
}

function ResultHeader({ result }: { result: PayoutResult }) {
  if (result.status === "FAILED") {
    return (
      <div className="text-center py-2">
        <Badge variant="destructive">Failed</Badge>
        <p className="text-sm font-semibold text-fg mt-3">
          ITEC rejected this payout
        </p>
        <p className="text-xs text-fg-muted mt-1">
          No money was sent. Start a new payout to try again.
        </p>
      </div>
    );
  }

  if (result.status === "SUCCESSFUL") {
    return (
      <div className="text-center py-2">
        <Badge variant="success">Paid</Badge>
        <p className="text-sm font-semibold text-fg mt-3">
          The recipient has been paid
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <Badge variant="warning">Pending</Badge>
      <p className="text-sm font-semibold text-fg mt-3">Payout sent to ITEC</p>
      <p className="text-xs text-fg-muted mt-1">
        The recipient should receive the funds shortly. Its status updates
        automatically in the payout history.
      </p>
    </div>
  );
}
