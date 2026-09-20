"use server";

import { z } from "@/lib/zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { criarAssinatura } from "@/services/asaas.service";
import { validarCpfCnpj, limparDocumento } from "@/lib/validations/cpf-cnpj";

// ═══════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════

const schema = z
  .object({
    nome: z.string().min(3, "Nome muito curto").max(120),
    cpfCnpj: z.string().min(11).max(20),
    telefone: z.string().max(20).optional().or(z.literal("")),
    billingType: z.enum(["BOLETO", "PIX", "CREDIT_CARD"]),
    dueDay: z.coerce.number().int().min(1).max(15),

    // Cartão (obrigatório se billingType = CREDIT_CARD)
    cardNumber: z.string().optional().or(z.literal("")),
    cardHolder: z.string().optional().or(z.literal("")),
    cardExpiryMonth: z.string().optional().or(z.literal("")),
    cardExpiryYear: z.string().optional().or(z.literal("")),
    cardCcv: z.string().optional().or(z.literal("")),
    holderPostalCode: z.string().optional().or(z.literal("")),
    holderAddressNumber: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!validarCpfCnpj(data.cpfCnpj)) {
      ctx.addIssue({
        code: "custom",
        path: ["cpfCnpj"],
        message: "CPF/CNPJ inválido",
      });
    }
    if (data.billingType === "CREDIT_CARD") {
      if (!data.cardNumber || limparDocumento(data.cardNumber).length < 13) {
        ctx.addIssue({
          code: "custom",
          path: ["cardNumber"],
          message: "Número do cartão inválido",
        });
      }
      if (!data.cardHolder || data.cardHolder.length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["cardHolder"],
          message: "Nome do titular é obrigatório",
        });
      }
      if (!data.cardExpiryMonth || !data.cardExpiryYear) {
        ctx.addIssue({
          code: "custom",
          path: ["cardExpiryMonth"],
          message: "Validade do cartão é obrigatória",
        });
      }
      if (!data.cardCcv || data.cardCcv.length < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["cardCcv"],
          message: "CVV inválido",
        });
      }
      if (!data.holderPostalCode) {
        ctx.addIssue({
          code: "custom",
          path: ["holderPostalCode"],
          message: "CEP é obrigatório para cartão",
        });
      }
      if (!data.holderAddressNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["holderAddressNumber"],
          message: "Número do endereço é obrigatório",
        });
      }
    }
  });

export type CriarAssinaturaActionResult =
  | { success: true; subscriptionId: string; nextDueDate: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ═══════════════════════════════════════════════════════
// CRIAR ASSINATURA
// ═══════════════════════════════════════════════════════

export async function criarAssinaturaAction(
  formData: FormData
): Promise<CriarAssinaturaActionResult> {
  try {
    // ─── 1. Autenticação ───
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { success: false, error: "Não autenticado" };
    }

    // ─── 2. Validação ───
    const raw = {
      nome: String(formData.get("nome") ?? ""),
      cpfCnpj: String(formData.get("cpfCnpj") ?? ""),
      telefone: String(formData.get("telefone") ?? ""),
      billingType: String(formData.get("billingType") ?? ""),
      dueDay: String(formData.get("dueDay") ?? ""),
      cardNumber: String(formData.get("cardNumber") ?? ""),
      cardHolder: String(formData.get("cardHolder") ?? ""),
      cardExpiryMonth: String(formData.get("cardExpiryMonth") ?? ""),
      cardExpiryYear: String(formData.get("cardExpiryYear") ?? ""),
      cardCcv: String(formData.get("cardCcv") ?? ""),
      holderPostalCode: String(formData.get("holderPostalCode") ?? ""),
      holderAddressNumber: String(formData.get("holderAddressNumber") ?? ""),
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_");
        fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
      }
      return {
        success: false,
        error: "Verifique os campos",
        fieldErrors,
      };
    }

    const data = parsed.data;

    // ─── 3. Calcula nextDueDate ───
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let year = today.getFullYear();
    let month = today.getMonth();

    if (today.getDate() > data.dueDay) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const dueDate = new Date(year, month, data.dueDay);
    const nextDueDate = `${dueDate.getFullYear()}-${String(
      dueDate.getMonth() + 1
    ).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;

    // ─── 4. Cria assinatura no Asaas ───
    const result = await criarAssinatura({
      userId: user.id,
      email: user.email,
      nome: data.nome,
      cpfCnpj: data.cpfCnpj,
      telefone: data.telefone || undefined,
      billingType: data.billingType,
      nextDueDate,
      creditCard:
        data.billingType === "CREDIT_CARD"
          ? {
              holderName: data.cardHolder!,
              number: limparDocumento(data.cardNumber!),
              expiryMonth: data.cardExpiryMonth!,
              expiryYear: data.cardExpiryYear!,
              ccv: data.cardCcv!,
            }
          : undefined,
      creditCardHolderInfo:
        data.billingType === "CREDIT_CARD"
          ? {
              name: data.cardHolder!,
              email: user.email,
              cpfCnpj: limparDocumento(data.cpfCnpj),
              postalCode: limparDocumento(data.holderPostalCode!),
              addressNumber: data.holderAddressNumber!,
              phone: data.telefone ? limparDocumento(data.telefone) : undefined,
            }
          : undefined,
    });

    revalidatePath("/admin/assinatura");
    revalidatePath("/admin/veiculos");

    return {
      success: true,
      subscriptionId: result.subscriptionId ?? "",
      nextDueDate,
    };
  } catch (err) {
    console.error("[criarAssinaturaAction] Erro:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao criar assinatura",
    };
  }
}

// ═══════════════════════════════════════════════════════
// CANCELAR ASSINATURA
// ═══════════════════════════════════════════════════════

export async function cancelarAssinatura(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { cancelarAssinatura: cancelarService } = await import(
      "@/services/asaas.service"
    );
    await cancelarService(user.id);

    revalidatePath("/admin/assinatura");
    revalidatePath("/admin/veiculos");

    return { success: true };
  } catch (err) {
    console.error("[cancelarAssinatura] Erro:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao cancelar",
    };
  }
}