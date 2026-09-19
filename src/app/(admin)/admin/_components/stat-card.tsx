"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "green" | "gray" | "blue" | "red" | "primary";

interface StatCardProps {
  label: string;
  sublabel?: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
}

const toneStyles: Record<
  Tone,
  { iconBg: string; iconColor: string; border: string; ring: string }
> = {
  green: {
    iconBg: "bg-green-100 dark:bg-green-950/60",
    iconColor: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-900/60",
    ring: "ring-green-500/30",
  },
  gray: {
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    ring: "ring-gray-400/30",
  },
  blue: {
    iconBg: "bg-blue-100 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/60",
    ring: "ring-blue-500/30",
  },
  red: {
    iconBg: "bg-red-100 dark:bg-red-950/60",
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-900/60",
    ring: "ring-red-500/30",
  },
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-primary/20",
    ring: "ring-primary/30",
  },
};

export function StatCard({
  label,
  sublabel,
  value,
  icon: Icon,
  tone = "primary",
  active = false,
  onClick,
}: StatCardProps) {
  const styles = toneStyles[tone];
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all duration-200",
        "border-border/60",
        isClickable &&
          "cursor-pointer hover:border-border hover:shadow-md hover:shadow-black/[0.03] active:scale-[0.98]",
        active && cn("border-transparent ring-2", styles.border, styles.ring),
        !isClickable && "cursor-default"
      )}
    >
      {/* Ícone + Contador */}
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconColor)} strokeWidth={2.2} />
        </div>
        <span className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
      </div>

      {/* Texto */}
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight tracking-tight truncate">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {sublabel}
          </p>
        )}
      </div>

      {/* Indicador de ativo (linha vermelha embaixo) */}
      {active && (
        <span
          className={cn(
            "absolute bottom-0 left-4 right-4 h-0.5 rounded-t-full",
            tone === "green" && "bg-green-500",
            tone === "gray" && "bg-gray-400",
            tone === "blue" && "bg-blue-500",
            tone === "red" && "bg-red-500",
            tone === "primary" && "bg-primary"
          )}
        />
      )}
    </button>
  );
}