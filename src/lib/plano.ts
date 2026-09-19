// src/lib/plano.ts
//
// ⚠️ Única fonte de verdade do valor do plano.
// Se mudar aqui, muda em todo o sistema (formulário, card, service).

export const PLANO = {
  valor: 5.0,                                    // ⚠️ TEMPORÁRIO — volta pra 155.0 depois
  ciclo: "MONTHLY" as const,
  descricao: "Teste de integração — ignorar",    // ⚠️ volta pra descrição real depois
  valorFormatado: "R$ 5,00",                     // ⚠️ TEMPORÁRIO
};

// Quando terminar o teste, troca tudo pra:
// valor: 155.0,
// descricao: "Assinatura Wancar Veículos — Plano Mensal",
// valorFormatado: "R$ 155,00",