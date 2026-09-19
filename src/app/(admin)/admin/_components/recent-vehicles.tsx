"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car as CarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatKM } from "@/lib/formatters";
import { useUltimosVeiculos } from "@/hooks/use-dashboard";

export function RecentVehicles() {
  const { data, isLoading } = useUltimosVeiculos(5);

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimos veículos cadastrados</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/veiculos">
            Ver todos
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CarIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum veículo cadastrado ainda.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/admin/veiculos?novo=true">
                Cadastrar primeiro veículo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((v) => (
              <Link
                key={v.id}
                href={`/admin/veiculos?edit=${v.id}`}
                className="flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/50 transition-colors"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {v.imagem_capa ? (
                    <Image
                      src={v.imagem_capa}
                      alt={`${v.marca} ${v.modelo}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <CarIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {v.marca} {v.modelo} · {v.ano}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatBRL(v.preco)}
                    {v.km != null && ` · ${formatKM(v.km)}`}
                  </p>
                </div>
                {!v.ativo && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    Inativo
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}