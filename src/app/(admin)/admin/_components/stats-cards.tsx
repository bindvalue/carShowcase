"use client";

import {
  Car,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  Gauge,
  ImageOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

export function StatsCards() {
  const { data, isLoading } = useDashboardStats();

  const cards = [
    {
      label: "Veículos ativos",
      value: data?.veiculosAtivos ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "Veículos totais",
      value: data?.veiculosTotais ?? 0,
      icon: Car,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Inativos",
      value: data?.veiculosInativos ?? 0,
      icon: XCircle,
      color: "text-gray-600",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
    {
      label: "Marcas",
      value: data?.totalMarcas ?? 0,
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
      label: "Modelos",
      value: data?.totalModelos ?? 0,
      icon: Layers,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-950",
    },
    {
      label: "Sem KM",
      value: data?.veiculosSemKm ?? 0,
      icon: Gauge,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
    {
      label: "Sem capa",
      value: data?.veiculosSemCapa ?? 0,
      icon: ImageOff,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-950",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/60">
          <CardContent className="p-4">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                card.bg
              )}
            >
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
            <p className="mt-3 text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}