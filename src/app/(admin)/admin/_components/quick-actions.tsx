"use client";

import Link from "next/link";
import { Plus, Settings, Globe, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild className="w-full justify-start h-11">
          <Link href="/admin/veiculos?novo=true">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar novo veículo
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full justify-start h-11">
          <Link href="/admin/veiculos">
            <Package className="mr-2 h-4 w-4" />
            Gerenciar estoque
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full justify-start h-11">
          <Link href="/admin/configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full justify-start h-11">
          <Link href="/" target="_blank">
            <Globe className="mr-2 h-4 w-4" />
            Ver site público
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}