import { Sidebar } from "./Sidebar";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface MainLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
}

export function MainLayout({ navItems, children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-fg">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-auto">
        <div className="min-w-[1040px] min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
