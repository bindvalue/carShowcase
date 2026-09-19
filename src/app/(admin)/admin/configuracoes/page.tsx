import { Settings } from "lucide-react";
import { ContactForm } from "../_components/contact-form";
import { WhatsAppForm } from "../_components/whatsapp-form";
import { HoursForm } from "../_components/hours-form";
import { PasswordForm } from "../_components/password-form";

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-2 ml-11">
          Gerencie as informações exibidas no site e sua conta.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto space-y-6">
        <ContactForm />
        <WhatsAppForm />
        <HoursForm />
        <PasswordForm />
      </div>
    </div>
  );
}