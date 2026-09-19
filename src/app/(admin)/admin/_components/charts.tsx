"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useVeiculosPorMarca,
  useCadastrosUltimos30Dias,
} from "@/hooks/use-dashboard";

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

/** Trunca nomes longos de marca: "Mercedes-Benz" → "Mercedes…" */
function truncarLabel(nome: string, max = 10): string {
  if (!nome) return "";
  return nome.length > max ? `${nome.slice(0, max)}…` : nome;
}

// ═══════════════════════════════════════════════════════
// TOOLTIP CUSTOMIZADO (Apple HIG)
// ═══════════════════════════════════════════════════════

interface TooltipPayloadItem {
  value?: number | string;
  payload?: { marca?: string; data?: string };
}

function ChartTooltip({
  active,
  payload,
  label,
  labelPrefix = "",
  unit = "",
  icon,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  labelPrefix?: string;
  unit?: string;
  icon?: React.ReactNode;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value ?? 0;

  return (
    <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-sm px-3 py-2">
      <p className="text-[11px] text-muted-foreground mb-0.5">
        {labelPrefix}
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-sm font-semibold text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GRÁFICO 1 — VEÍCULOS POR MARCA
// ═══════════════════════════════════════════════════════

export function VeiculosPorMarcaChart() {
  const { data, isLoading } = useVeiculosPorMarca();

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  const isEmpty = !data || data.length === 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Veículos por marca
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top {data?.length ?? 0} marcas com mais veículos ativos
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {isEmpty ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data ?? []}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              {/* Grid só na horizontal, discreto */}
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="0"
                opacity={0.5}
              />

              <XAxis
                dataKey="marca"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => truncarLabel(v, 10)}
                interval={0}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />

              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                content={<ChartTooltip labelPrefix="" unit="veículos" />}
              />

              <Bar
                dataKey="quantidade"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
                barSize={32}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════
// GRÁFICO 2 — CADASTROS NOS ÚLTIMOS 30 DIAS
// ═══════════════════════════════════════════════════════

export function CadastrosUltimos30DiasChart() {
  const { data, isLoading } = useCadastrosUltimos30Dias();

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  const isEmpty = !data || data.length === 0;
  const total = data?.reduce((acc, d) => acc + d.quantidade, 0) ?? 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Cadastros nos últimos 30 dias
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "cadastro" : "cadastros"} no período
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {isEmpty ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={data ?? []}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              {/* Gradiente suave abaixo da linha */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              {/* Grid só na horizontal */}
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="0"
                opacity={0.5}
              />

              <XAxis
                dataKey="data"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor((data?.length ?? 0) / 6) - 1)}
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />

              <Tooltip
                cursor={{
                  stroke: "hsl(var(--border))",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={<ChartTooltip unit="cadastros" />}
              />

              <Area
                type="monotone"
                dataKey="quantidade"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════

function EmptyChart() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground">
        Sem dados no período
      </p>
    </div>
  );
}