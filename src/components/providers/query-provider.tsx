"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto — dados considerados frescos
            gcTime: 5 * 60 * 1000, // 5 minutos — cache em memória
            retry: 1, // tenta 1 vez se falhar
            refetchOnWindowFocus: false, // não refaz ao voltar para a aba
            refetchOnReconnect: true, // refaz quando volta a conexão
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}