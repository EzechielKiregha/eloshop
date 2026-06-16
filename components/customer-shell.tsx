"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/public-header";

const links = [
  { label: "Tableau de bord", href: "/customer", icon: LayoutDashboard },
  { label: "Mes commandes", href: "/customer/orders", icon: ShoppingBag },
  { label: "Mon profil", href: "/customer/profile", icon: User },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Bonjour, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gérez votre compte et vos commandes
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="flex gap-2 overflow-x-auto lg:w-48 lg:shrink-0 lg:flex-col">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
