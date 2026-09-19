import { Suspense } from "react";
import { guardVeiculosAccess } from "@/lib/supabase/subscription-guard";
import { VeiculosPageClient } from "../_components/veiculos-page-client";
import { Skeleton } from "@/components/ui/skeleton";

async function VeiculosGuard() {
  await guardVeiculosAccess();
  return <VeiculosPageClient />;
}

function VeiculosLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function AdminVeiculosPage() {
  return (
    <Suspense fallback={<VeiculosLoading />}>
      <VeiculosGuard />
    </Suspense>
  );
}