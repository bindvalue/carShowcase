/**
 * Validação de CPF/CNPJ sem dependência externa.
 * Retorna true se o documento é válido (dígitos verificadores OK).
 */

export function limparDocumento(doc: string): string {
  return doc.replace(/\D/g, "");
}

export function validarCPF(cpf: string): boolean {
  const c = limparDocumento(cpf);
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false; // 111.111.111-11 etc

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(c[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(c[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(c[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(c[10]);
}

export function validarCNPJ(cnpj: string): boolean {
  const c = limparDocumento(cnpj);
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false;

  const calc = (base: string, pesos: number[]) =>
    base.split("").reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = calc(c.slice(0, 12), pesos1);
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;
  if (dv1 !== Number(c[12])) return false;

  soma = calc(c.slice(0, 13), pesos2);
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;
  return dv2 === Number(c[13]);
}

export function validarCpfCnpj(doc: string): boolean {
  const c = limparDocumento(doc);
  if (c.length === 11) return validarCPF(c);
  if (c.length === 14) return validarCNPJ(c);
  return false;
}

export function formatarCpfCnpj(doc: string): string {
  const c = limparDocumento(doc);
  if (c.length <= 11) {
    return c
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return c
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}