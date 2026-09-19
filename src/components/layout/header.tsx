"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "./user-menu";
import { SITE_CONFIG } from "@/lib/constants";

export function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/veiculos?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/veiculos");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label={SITE_CONFIG.name}
        >
          <Image
            src="/logo_.png"
            alt={SITE_CONFIG.name}
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Busca */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-2xl mx-auto"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Busque por marca, modelo ou palavra-chave..."
              className="pl-10 h-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Ações */}
        <nav className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href="/sobre">Sobre</Link>
          </Button>

          <UserMenu />

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}