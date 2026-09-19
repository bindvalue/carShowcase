"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Settings,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════
// NAV ITEMS
// ═══════════════════════════════════════════════════════

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/veiculos", label: "Veículos", icon: Car },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/assinatura", label: "Assinatura", icon: CreditCard },
];

// ═══════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Carrega estado do localStorage (só no cliente)
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 border-r bg-background",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* ═══════════ HEADER / LOGO ═══════════ */}
      <div className="flex h-16 items-center border-b pl-5 pr-3 relative">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-opacity",
            collapsed && "opacity-0 pointer-events-none"
          )}
        >
          <Image
            src="/logo_.png"
            alt="Wancar Veículos"
            width={120}
            height={36}
            className="h-9 w-auto object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Encolher menu"}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-10",
            "flex h-7 w-7 items-center justify-center rounded-md",
            "border border-border bg-background",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors",
            collapsed ? "left-1/2 -translate-x-1/2" : "right-2"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ═══════════ NAV ═══════════ */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ═══════════ FOOTER / USER ═══════════ */}
      <div className="p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
            <UserMenu />
          </div>
        )}
      </div>
    </aside>
  );
}