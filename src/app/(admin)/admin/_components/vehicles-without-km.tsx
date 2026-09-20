"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVeiculosSemKm } from "@/hooks/use-dashboard";

export function VehiclesWithoutKm() {
  const { data, isLoading } = useVeiculosSemKm(5);

  const total = data?.length ?? 0;

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <CardTitle className="text-base text-orange-900 dark:text-orange-100">
            Veículos sem KM
          </CardTitle>
        </div>
        {total > 0 && (
          <Badge variant="outline" className="text-xs border-orange-300">
            Requer atenção
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ðŸŽ‰ Nenhum veículo pendente!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os veículos têm a KM informada.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {data!.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/veiculos?edit=${v.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors"
                >
                  <span className="text-sm truncate">
                    <span className="font-medium">
                      {v.marca} {v.modelo}
                    </span>
                    <span className="text-muted-foreground"> · {v.ano}</span>
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>

            {/* Link para ver todos */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-950/40"
            >
              <Link href="/admin/veiculos">
                Ver todos os veículos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}