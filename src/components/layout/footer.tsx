import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* COLUNA 1: Marca + endereço */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center shrink-0">
              <Image
                src="/logo_.png"
                alt="Wancar Veículos"
                width={160}
                height={48}
                className="h-16 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              A vitrine de veículos mais moderna do Brasil. Qualidade e
              procedência garantidas.
            </p>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span className="leading-snug">
                Rua Mato Grosso, 349
                <br />
                Contagem - MG, 32073-760
              </span>
            </div>
          </div>

          {/* COLUNA 2: Navegação */}
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/veiculos"
                  className="hover:text-foreground transition-colors"
                >
                  Estoque de veículos
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="hover:text-foreground transition-colors"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="hover:text-foreground transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="tel:+553125573849"
                  className="flex items-start gap-2 hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>(31) 2557-3849</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5531993908081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                  <span>+55 31 99390-8081</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:wancar.veiculos@hotmail.com"
                  className="flex items-start gap-2 hover:text-foreground transition-colors break-all"
                >
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>wancar.veiculos@hotmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: Horário */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Horário de Funcionamento
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Seg a Sex</span>
                <span>08h às 18h</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Sábado</span>
                <span>08h às 12h</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Domingo</span>
                <span className="text-red-500/80">Fechado</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ═══════════ RODAPÉ / COPYRIGHT ═══════════ */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Wancar Veículos © {currentYear} — Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido por{" "}
            <a
              href="https://bindvalue.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              BindValue.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}