"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./_components/stats-cards";
import {
  VeiculosPorMarcaChart,
  CadastrosUltimos30DiasChart,
} from "./_components/charts";
import { RecentVehicles } from "./_components/recent-vehicles";
import { VehiclesWithoutKm } from "./_components/vehicles-without-km";
import { QuickActions } from "./_components/quick-actions";
import { useDashboardRealtime } from "@/hooks/use-dashboard";

export default function AdminDashboardPage() {
  useDashboardRealtime();

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do seu estoque de veículos
          </p>
        </div>
        <Button asChild className="h-11">
          <Link href="/admin/veiculos?novo=true">
            <Plus className="mr-2 h-4 w-4" />
            Novo veículo
          </Link>
        </Button>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VeiculosPorMarcaChart />
        <CadastrosUltimos30DiasChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentVehicles />
        <div className="space-y-6">
          <VehiclesWithoutKm />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}