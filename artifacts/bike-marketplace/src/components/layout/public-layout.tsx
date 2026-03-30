import { Link, useLocation } from "wouter";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppName } from "@/hooks/use-app-name";

function AppNameDisplay({ className }: { className?: string }) {
  const appName = useAppName();
  const mid = Math.ceil(appName.length / 2);
  const hasSpace = appName.includes(' ');
  const first = hasSpace ? appName.split(' ').slice(0, -1).join(' ') : appName.slice(0, mid);
  const second = hasSpace ? appName.split(' ').at(-1)! : appName.slice(mid);
  return (
    <span className={className}>
      {first}<span className="text-primary">{second}</span>
    </span>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const appName = useAppName();

  const navLinks = [
    { href: "/", label: "Showroom" },
    { href: "/products", label: "All Vehicles" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <AppNameDisplay className="text-xl font-bold uppercase tracking-wider" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link href="/admin/login">Admin</Link>
            </Button>
          </div>

          <button className="md:hidden p-2 text-muted-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/40 p-4 flex flex-col gap-4 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium p-2 ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 text-muted-foreground">Admin Login</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-primary" />
              <AppNameDisplay className="text-xl font-bold uppercase tracking-wider" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The ultimate destination for premium powersport vehicles. Quad bikes, ATVs, motorcycles, and scooters — raw power, precision engineering, and uncompromising style.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h3 className="font-semibold mb-4 text-foreground uppercase tracking-wider text-sm">Explore</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products?category=Quad+Bike" className="hover:text-primary transition-colors">Quad Bikes / ATV</Link></li>
                <li><Link href="/products?category=Superbike" className="hover:text-primary transition-colors">Superbikes</Link></li>
                <li><Link href="/products?category=Scooter" className="hover:text-primary transition-colors">Scooters</Link></li>
                <li><Link href="/products" className="hover:text-primary transition-colors">All Inventory</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground uppercase tracking-wider text-sm">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {appName} Powersports. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
