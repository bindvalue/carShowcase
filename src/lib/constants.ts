export const CAMBIO_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "automatico", label: "Automático" },
  { value: "automatizado", label: "Automatizado" },
  { value: "cvt", label: "CVT" },
] as const;

export const COMBUSTIVEL_OPTIONS = [
  { value: "flex", label: "Flex" },
  { value: "gasolina", label: "Gasolina" },
  { value: "etanol", label: "Etanol" },
  { value: "diesel", label: "Diesel" },
  { value: "hibrido", label: "Híbrido" },
  { value: "eletrico", label: "Elétrico" },
] as const;

export const SITE_CONFIG = {
  name: "Wancar Veículos",
  description: "A vitrine de veículos mais moderna do Brasil",
  whatsappDefault: "5531993908081",
};