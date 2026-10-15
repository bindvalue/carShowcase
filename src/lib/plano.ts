// src/lib/plano.ts
//
// ⚠️ Única fonte de verdade do valor do plano.
// Se mudar aqui, muda em todo o sistema (formulário, card, service).

export const PLANO = {
  valor: 155.0,                                    // ⚠️ TEMPORÁRIO — volta pra 155.0 depois
  ciclo: "MONTHLY" as const,
  descricao: "Assinatura mensal do sistema de gestão e vitrine de veículos",
  valorFormatado: "R$ 155,00",                     // ⚠️ TEMPORÁRIO
};