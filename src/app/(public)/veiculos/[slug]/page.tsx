"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star, Car, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleGallery } from "@/components/veiculos/vehicle-gallery";
import { VehicleSpecs } from "@/components/veiculos/vehicle-specs";
import { VehicleContactCard } from "@/components/veiculos/vehicle-contact-card";
import { VehicleCard } from "@/components/veiculos/vehicle-card";
import { VehicleFeatures } from "@/components/veiculos/vehicle-features";
import { useVeiculoBySlug, useVeiculos } from "@/hooks/use-veiculos";
import { capitalize } from "@/lib/formatters";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <Car className="h-16 w-16 mx-auto text-muted-foreground/40" />
      <h1 className="mt-4 text-2xl font-bold">Veículo não encontrado</h1>
      <p className="mt-2 text-muted-foreground">
        O anúncio que você procura pode ter sido removido ou não está mais disponível.
      </p>
      <Link
        href="/veiculos"
        className="mt-6 inline-flex items-center text-primary hover:underline"
      >
        Ver outros veículos disponíveis
      </Link>
    </div>
  );
}

export default function VeiculoDetalhesPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: veiculo, isLoading, isError } = useVeiculoBySlug(slug);

  // Busca veículos similares (só roda quando o veículo principal carrega)
  const { data: todosVeiculos = [] } = useVeiculos({
    ordenacao: "recentes",
  });

  if (isLoading) return <LoadingState />;
  if (isError || !veiculo) return <NotFoundState />;

  const imagens = veiculo.imagens ?? [];
  const tituloCompleto = `${veiculo.marca} ${veiculo.modelo}`;

  // Veículos similares (mesma marca ou mesma faixa de preço)
  const similares = todosVeiculos
    .filter(
      (v) =>
        v.id !== veiculo.id &&
        (v.marca === veiculo.marca ||
          (v.preco >= veiculo.preco * 0.75 &&
            v.preco <= veiculo.preco * 1.25))
    )
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/veiculos" className="hover:text-foreground">
          Veículos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate">
          {tituloCompleto}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-8">
          <VehicleGallery imagens={imagens} alt={tituloCompleto} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground">
                {veiculo.ano}
              </Badge>
              {veiculo.km != null && (
                <Badge variant="secondary">
                  {veiculo.km.toLocaleString("pt-BR")} km
                </Badge>
              )}
              {veiculo.cambio && (
                <Badge variant="secondary">{capitalize(veiculo.cambio)}</Badge>
              )}
              {veiculo.combustivel && (
                <Badge variant="secondary">
                  {capitalize(veiculo.combustivel)}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">{tituloCompleto}</h1>
            {veiculo.motor && (
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                {veiculo.motor}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Anúncio verificado</span>
              <span className="mx-2">·</span>
              <span>Contagem, MG</span>
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Ficha técnica
            </h2>
            <VehicleSpecs veiculo={veiculo} />
          </section>

          {veiculo.descricao && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Descrição</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {veiculo.descricao}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          <section>
            <VehicleFeatures opcionais={veiculo.opcionais} />
          </section>
        </div>

        {/* Coluna lateral */}
        <aside className="lg:col-span-1">
          <VehicleContactCard veiculo={veiculo} />
        </aside>
      </div>

      {/* Veículos similares */}
      {similares.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-xl font-bold mb-6">Veículos similares</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similares.map((v) => (
              <VehicleCard key={v.id} veiculo={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}