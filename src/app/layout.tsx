import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wancar Veículos | Vitrine de Carros",
  description: "Encontre o carro dos seus sonhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`${inter.className} h-full`}
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "!w-[420px] !max-w-[calc(100vw-2rem)]",
              title: "!text-sm !font-semibold",
              description: "!text-xs !leading-relaxed",
              actionButton: "!text-xs",
              cancelButton: "!text-xs",
            },
          }}
        />
      </body>
    </html>
  );
}