import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { logout } from "@/lib/api";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

interface SidebarProps {
  readonly navItems: readonly NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="w-56 flex-none flex flex-col bg-sidebar-bg border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4 pb-4">
        <img
          src="/afrisic-logo.png"
          alt="Afrisinc"
          className="w-10 h-10 rounded-lg object-contain"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold tracking-tight text-fg">
            AfrisinC Pay
          </span>
          <span className="text-xs font-medium text-fg-muted">
            Admin console
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2.5 py-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium",
              "transition-colors border-none cursor-pointer",
              item.isActive
                ? "bg-sidebar-accent text-sidebar-accent-fg font-bold"
                : "text-sidebar-fg hover:bg-sidebar-accent hover:text-sidebar-accent-fg",
            )}
          >
            <div className="flex-none">{item.icon}</div>
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-4 py-3 border-t border-sidebar-border flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success shadow-lg shadow-success/60" />
          <span className="text-xs font-bold tracking-wide text-fg-muted">
            PRODUCTION
          </span>
          <span className="ml-auto text-xs font-mono text-fg-muted">
            v2.4.1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar name="JM" size="sm" variant="muted" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-fg">Jean-Marie N.</span>
            <span className="text-xs text-fg-muted">Super Admin</span>
          </div>
        </div>
        <button
          onClick={logout}
          className={cn(
            "mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium",
            "transition-colors border-none cursor-pointer",
            "text-sidebar-fg hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
