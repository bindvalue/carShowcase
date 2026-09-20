"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleFilters } from "./vehicle-filters";

interface FilterMobileDrawerProps {
  activeCount?: number;
}

export function FilterMobileDrawer({
  activeCount = 0,
}: FilterMobileDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden relative h-9">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-5 px-1.5 text-[10px] rounded-full"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        {/* Handle (barrinha) */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">Filtros</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-8">
          <VehicleFilters onClose={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}