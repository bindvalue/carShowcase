

export type SubscriptionStatus =
  | "vitalicio"        // Acesso total para sempre
  | "ativo"            // Pagamento em dia
  | "tolerancia"       // Venceu há menos de 7 dias — acesso mantido
  | "bloqueado"        // Venceu há mais de 7 dias — menu veículos bloqueado
  | "sem_assinatura";  // Nunca assinou

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  diasRestantes: number;      // Positivo = dias até vencer, Negativo = dias em atraso
  dataVencimento: Date | null;
  isLifetime: boolean;
  subscribed: boolean;
}

/**
 * Calcula o status de assinatura de um usuário.
 */
export function calcularStatusAssinatura(subscriber: {
  subscribed: boolean;
  is_lifetime: boolean;
  subscription_end: string | null;
} | null): SubscriptionInfo {
  // Sem subscriber = sem assinatura
  if (!subscriber) {
    return {
      status: "sem_assinatura",
      diasRestantes: 0,
      dataVencimento: null,
      isLifetime: false,
      subscribed: false,
    };
  }

  // Vitalício = sempre ativo
  if (subscriber.is_lifetime) {
    return {
      status: "vitalicio",
      diasRestantes: 999999,
      dataVencimento: null,
      isLifetime: true,
      subscribed: true,
    };
  }

  const dataVencimento = subscriber.subscription_end
    ? new Date(subscriber.subscription_end)
    : null;

  // Sem data de vencimento
  if (!dataVencimento) {
    return {
      status: subscriber.subscribed ? "bloqueado" : "sem_assinatura",
      diasRestantes: 0,
      dataVencimento: null,
      isLifetime: false,
      subscribed: subscriber.subscribed,
    };
  }

  const hoje = new Date();
  const diffMs = dataVencimento.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Venceu há mais de 7 dias = bloqueado
  if (diasRestantes < -3) {
    return {
      status: "bloqueado",
      diasRestantes,
      dataVencimento,
      isLifetime: false,
      subscribed: false,
    };
  }

  // Venceu há menos de 7 dias = tolerância
  if (diasRestantes < 0) {
    return {
      status: "tolerancia",
      diasRestantes,
      dataVencimento,
      isLifetime: false,
      subscribed: false,
    };
  }

  // Em dia
  return {
    status: "ativo",
    diasRestantes,
    dataVencimento,
    isLifetime: false,
    subscribed: true,
  };
}

/**
 * Retorna `true` se o usuário PODE editar/adicionar veículos.
 */
export function podeGerenciarVeiculos(info: SubscriptionInfo): boolean {
  return (
    info.status === "vitalicio" ||
    info.status === "ativo" ||
    info.status === "tolerancia"
  );
}