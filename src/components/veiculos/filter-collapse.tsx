"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleFilters } from "./vehicle-filters";
import { cn } from "@/lib/utils";

export function FilterCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  // Persiste estado no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vehicle-filter-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vehicle-filter-collapsed", String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden lg:block shrink-0",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-72"
      )}
    >
      <div className="sticky top-24">
        {collapsed ? (
          /* ═══════════ ESTADO ENCOLHIDO ═══════════ */
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border border-border bg-background",
              "px-2 py-4 hover:bg-muted transition-colors w-full"
            )}
            title="Expandir filtros"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase [writing-mode:vertical-rl] rotate-180">
              Filtros
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ) : (
          /* ═══════════ ESTADO EXPANDIDO ═══════════ */
          <div className="relative">
            {/* Botão de encolher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Encolher filtros"
              className="absolute -right-3 top-0 z-10 h-7 w-7 rounded-full border bg-background shadow-sm hover:bg-muted"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {/* Filtros */}
            <VehicleFilters />
          </div>
        )}
      </div>
    </aside>
  );
}