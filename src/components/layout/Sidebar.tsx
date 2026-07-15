import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="w-56 flex-none flex flex-col bg-sidebar-bg border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 pb-4">
        <Avatar name="A" size="md" variant="default" />
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
      </div>
    </aside>
  );
}
