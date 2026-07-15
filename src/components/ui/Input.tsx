import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-fg-muted">{label}</label>
      )}
      <div className="relative">
        <input
          className={cn(
            "w-full rounded-md border border-border bg-input px-3 py-2 text-sm",
            "text-fg placeholder:text-fg-muted",
            "transition-colors hover:border-primary-500 focus:border-primary-500",
            icon && "pl-9",
            error && "border-destructive focus:border-destructive",
            className,
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
