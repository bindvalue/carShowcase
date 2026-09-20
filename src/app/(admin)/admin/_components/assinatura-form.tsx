"use client";

import { useState, useTransition } from "react";
import { Loader2, CreditCard, QrCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form-field";
import { formatarCpfCnpj } from "@/lib/validations/cpf-cnpj";
import { criarAssinaturaAction } from "@/actions/assinatura.actions";
import { PLANO } from "@/lib/plano";

type BillingType = "BOLETO" | "PIX" | "CREDIT_CARD";

const OPCOES_DIA = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: `Dia ${i + 1}`,
}));

export function AssinaturaForm() {
  const [isPending, startTransition] = useTransition();
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dueDay, setDueDay] = useState("15");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("cpfCnpj", cpfCnpj);
    formData.set("telefone", telefone);
    formData.set("billingType", billingType);
    formData.set("dueDay", dueDay);

    startTransition(async () => {
      const result = await criarAssinaturaAction(formData);

      if (!result.success) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        toast.error("Erro ao criar assinatura", { description: result.error });
        return;
      }

      toast.success("Assinatura criada!", {
        description: `Próximo vencimento: ${result.nextDueDate}`,
      });

      window.location.reload();
    });
  };

  const erroDe = (campo: string) => fieldErrors[campo]?.[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* â”€â”€â”€ Dados pessoais â”€â”€â”€ */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Seus dados</CardTitle>
          <CardDescription className="text-[13px]">
            Necessários para emissão do documento fiscal e contato.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nome completo / Razão social"
            htmlFor="nome"
            required
            error={erroDe("nome")}
          >
            <Input id="nome" name="nome" required maxLength={120} />
          </FormField>

          <FormField
            label="CPF ou CNPJ"
            htmlFor="cpfCnpj"
            required
            error={erroDe("cpfCnpj")}
          >
            <Input
              id="cpfCnpj"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))}
              placeholder="000.000.000-00"
              required
              inputMode="numeric"
            />
          </FormField>

          <FormField
            label="Telefone"
            htmlFor="telefone"
            hint="Opcional, mas ajuda no contato."
          >
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              inputMode="tel"
            />
          </FormField>

          <FormField
            label="Dia de vencimento"
            required
            hint="Escolha entre 1 e 15. Você será cobrado todo mês nesse dia."
          >
            <Combobox
              options={OPCOES_DIA}
              value={dueDay}
              onChange={setDueDay}
              placeholder="Escolha o dia"
              searchPlaceholder="Buscar dia..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Forma de pagamento â”€â”€â”€ */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Forma de pagamento
          </CardTitle>
          <CardDescription className="text-[13px]">
            Você pode trocar depois a qualquer momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PaymentOption
              active={billingType === "PIX"}
              onClick={() => setBillingType("PIX")}
              icon={<QrCode className="h-5 w-5" />}
              title="PIX"
              subtitle="Pagamento imediato"
            />
            <PaymentOption
              active={billingType === "BOLETO"}
              onClick={() => setBillingType("BOLETO")}
              icon={<FileText className="h-5 w-5" />}
              title="Boleto"
              subtitle="Vence em 3 dias úteis"
            />
            <PaymentOption
              active={billingType === "CREDIT_CARD"}
              onClick={() => setBillingType("CREDIT_CARD")}
              icon={<CreditCard className="h-5 w-5" />}
              title="Cartão"
              subtitle="Cobrança recorrente"
            />
          </div>

          {billingType === "CREDIT_CARD" && (
            <div className="space-y-4 pt-4 border-t">
              <FormField
                label="Número do cartão"
                htmlFor="cardNumber"
                required
                error={erroDe("cardNumber")}
              >
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  maxLength={19}
                  required
                />
              </FormField>

              <FormField
                label="Nome impresso no cartão"
                htmlFor="cardHolder"
                required
                error={erroDe("cardHolder")}
              >
                <Input
                  id="cardHolder"
                  name="cardHolder"
                  placeholder="Como está impresso"
                  required
                />
              </FormField>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  label="Mês"
                  htmlFor="cardExpiryMonth"
                  required
                  error={erroDe("cardExpiryMonth")}
                >
                  <Input
                    id="cardExpiryMonth"
                    name="cardExpiryMonth"
                    placeholder="MM"
                    maxLength={2}
                    inputMode="numeric"
                    required
                  />
                </FormField>
                <FormField label="Ano" htmlFor="cardExpiryYear" required>
                  <Input
                    id="cardExpiryYear"
                    name="cardExpiryYear"
                    placeholder="AAAA"
                    maxLength={4}
                    inputMode="numeric"
                    required
                  />
                </FormField>
                <FormField label="CVV" htmlFor="cardCcv" required>
                  <Input
                    id="cardCcv"
                    name="cardCcv"
                    placeholder="123"
                    maxLength={4}
                    inputMode="numeric"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  label="CEP do titular"
                  htmlFor="holderPostalCode"
                  required
                  error={erroDe("holderPostalCode")}
                  className="col-span-2"
                >
                  <Input
                    id="holderPostalCode"
                    name="holderPostalCode"
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    required
                  />
                </FormField>
                <FormField
                  label="Número"
                  htmlFor="holderAddressNumber"
                  required
                >
                  <Input
                    id="holderAddressNumber"
                    name="holderAddressNumber"
                    placeholder="123"
                    required
                  />
                </FormField>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Resumo + Submit â”€â”€â”€ */}
      <Card className="rounded-2xl border-primary/30 bg-primary/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-muted-foreground">
              Total mensal
            </span>
            <span className="text-2xl font-semibold tracking-tight">
              {PLANO.valorFormatado}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            A primeira cobrança é gerada agora. A próxima será no dia de
            vencimento escolhido.
          </p>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-10 text-[15px] font-medium rounded-[10px]"
              size="lg"
            >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar e assinar"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Subcomponente: card de forma de pagamento
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-[10px] border-2 p-4 transition-all ${
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/40"
      }`}
    >
      {icon}
      <span className="text-[15px] font-medium">{title}</span>
      <span className="text-[12px] text-muted-foreground">{subtitle}</span>
    </button>
  );
}