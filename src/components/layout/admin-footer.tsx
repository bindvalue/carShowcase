import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="flex items-center justify-between px-6 py-3 text-[11px] text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Wancar Veículos
        </p>
        <p>
          Desenvolvido por{" "}
          <Link
            href="https://www.bindvalue.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Luiz Corsini
          </Link>
        </p>
      </div>
    </footer>
  );
}