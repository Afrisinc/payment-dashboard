import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "destructive"
    | "processing"
    | "inactive";
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-primary-500/20 text-primary-400",
  success: "bg-success/20 text-success-light",
  warning: "bg-warning/20 text-warning-light",
  destructive: "bg-destructive/20 text-destructive-light",
  processing: "bg-primary-500/20 text-primary-400",
  inactive: "bg-slate-600/20 text-slate-400",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
