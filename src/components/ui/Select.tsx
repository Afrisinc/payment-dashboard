import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({
  label,
  error,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-fg-muted">{label}</label>
      )}
      <select
        className={cn(
          "rounded-md border border-border bg-input px-3 py-2 text-sm",
          "text-fg transition-colors hover:border-primary-500 focus:border-primary-500",
          "cursor-pointer",
          error && "border-destructive focus:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
