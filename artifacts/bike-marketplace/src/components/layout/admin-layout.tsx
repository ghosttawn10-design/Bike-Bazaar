import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Gauge, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminLogout, useGetAdminMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAppName } from "@/hooks/use-app-name";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const appName = useAppName();

  const { data: adminMe, isLoading, error } = useGetAdminMe();
  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (error || !adminMe)) {
      setLocation("/admin/login");
    }
  }, [isLoading, error, adminMe, setLocation]);

  const handleLogout = () => {
    logout.mutate({}, {
      onSuccess: () => {
        localStorage.removeItem('adminSession');
        toast({ title: "Logged out successfully" });
        setLocation("/admin/login");
      }
    });
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Inventory", icon: Gauge },
    { href: "/admin/requests", label: "Requests", icon: MessageSquare },
    { href: "/admin/profile", label: "Settings", icon: Settings },
  ];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!adminMe) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <span className="text-xl font-bold uppercase tracking-wider text-sidebar-foreground">{appName}<span className="text-primary"> Admin</span></span>
          <button className="md:hidden text-sidebar-foreground" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== '/admin' && location.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-sidebar-border">
          <div className="mb-4 px-4 text-sm text-sidebar-foreground truncate">
            {adminMe?.email}
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-start gap-3 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border md:hidden bg-background">
          <button className="text-foreground" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-bold uppercase tracking-wider text-foreground">{appName}<span className="text-primary"> Admin</span></span>
        </header>
        
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
