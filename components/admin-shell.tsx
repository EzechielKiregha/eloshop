"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ClipboardList,
  Users,
  Package,
  Store,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Point de vente", href: "/admin/pos", icon: Store },
  { label: "Produits", href: "/admin/products", icon: ShoppingBag },
  { label: "Catégories", href: "/admin/categories", icon: Tags },
  { label: "Commandes", href: "/admin/orders", icon: ClipboardList },
  { label: "Clients", href: "/admin/customers", icon: Users },
  { label: "Inventaire", href: "/admin/inventory", icon: Package },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-gold-400/15 px-4">
        <Link href="/" className="shrink-0 flex items-center gap-2">
          <Image
            src="/new-logo.png"
            alt="BOUTIQUE KAMEGA"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full border border-gold-400/30"
            priority
          />
          <span className="font-display text-sm font-semibold text-gold-gradient">
            BOUTIQUE KAMEGA
          </span>
        </Link>
        <span className="rounded-full bg-gold-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold-500 dark:text-gold-400">
          Admin
        </span>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold-400 text-zinc-900"
                    : "text-zinc-600 hover:bg-gold-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-gold-950/20 dark:hover:text-gold-500",
                )}
              >
                <link.icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-zinc-900"
                      : "text-gold-500 dark:text-gold-400",
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{session?.user?.name}</p>
          <p className="text-xs text-zinc-500">
            {session?.user?.email || session?.user?.phone}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href="/">
              <ChevronLeft className="mr-1 h-3 w-3" />
              Boutique
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gold-400/15 bg-white dark:bg-zinc-950 lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu admin</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gold-400/15 bg-white px-4 dark:bg-zinc-950 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="text-lg font-bold font-display text-gold-gradient">
            BOUTIQUE KAMEGA
          </span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
