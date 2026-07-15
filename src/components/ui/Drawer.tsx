import { cn } from "@/lib/cn";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
  title?: string;
}

const widthStyles = {
  sm: "w-96",
  md: "w-[440px]",
  lg: "w-[500px]",
};

export function Drawer({
  isOpen,
  onClose,
  children,
  width = "md",
  title,
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full flex flex-col",
          "bg-bg-card border-l border-border",
          "animation-drawerIn",
          widthStyles[width],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-bold text-fg">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-bg-muted text-fg-muted"
              aria-label="Close drawer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-border px-6 py-4 flex gap-3 bg-bg-card sticky bottom-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
