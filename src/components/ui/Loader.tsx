import { cn } from "@/lib/cn";

interface LoaderProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function Loader({
  message = "Loading...",
  submessage,
  className,
}: LoaderProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center relative overflow-hidden bg-bg text-fg",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-bg to-primary/10 opacity-50" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="animate-pulse">
          <img
            src="/afrisic-logo.png"
            alt="Afrisinc"
            className="w-20 h-20 rounded-2xl object-contain shadow-lg"
            style={{ boxShadow: "var(--payment-shadow-lg)" }}
          />
        </div>

        <div className="text-center animate-fadeIn">
          <p className="text-lg font-medium text-fg">{message}</p>
          {submessage && (
            <p className="text-sm text-fg-muted mt-1">{submessage}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}
