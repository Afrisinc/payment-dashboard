import { cn } from "@/lib/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "muted";
}

const sizeStyles = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const variantStyles = {
  default: "bg-gradient-primary text-white",
  muted: "bg-bg-muted text-fg border border-border",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  name,
  size = "md",
  variant = "default",
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
