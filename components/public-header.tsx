"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, User, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Boutique", href: "/shop" },
];

export function PublicHeader() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const [open, setOpen] = useState(false);
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-lg dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo-light.png" alt="KAMEGA Shop" width={130} height={40} className="h-9 w-auto dark:hidden" priority />
          <Image src="/logo-dark.png" alt="KAMEGA Shop" width={130} height={40} className="hidden h-9 w-auto dark:block" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-50 dark:text-zinc-900">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {session ? (
            <div className="hidden items-center gap-2 md:flex">
              {session.user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin"><LayoutDashboard className="mr-1 h-4 w-4" />Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customer"><User className="mr-1 h-4 w-4" />{session.user.name?.split(" ")[0]}</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden md:inline-flex">
              <Link href="/login">Se connecter</Link>
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                    {link.label}
                  </Link>
                ))}
                {session ? (
                  <>
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setOpen(false)} className="text-sm font-medium">Admin</Link>
                    )}
                    <Link href="/customer" onClick={() => setOpen(false)} className="text-sm font-medium">Mon compte</Link>
                    <Button variant="outline" size="sm" onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" />Se déconnecter
                    </Button>
                  </>
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>Se connecter</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
