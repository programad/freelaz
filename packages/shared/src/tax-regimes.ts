export const TAX_REGIMES = {
  mei: {
    label: "MEI",
    rate: 6,
    rateExport: 6,
    hint: "Microempreendedor Individual. Faturamento até R$81k/ano. DAS fixo independente do cliente.",
    hintExport: "MEI: alíquota fixa, sem benefício adicional na exportação (mas o teto continua valendo).",
    revenueCapBRL: 81_000,
  },
  simples: {
    label: "Simples Nacional",
    rate: 12,
    rateExport: 4.5,
    hint: "Anexo III (serviços). Faturamento entre R$81k e R$360k/ano.",
    hintExport: "Exportação de serviços: ISS, PIS e COFINS isentos. Alíquota cai para ~4–5% (Anexo III).",
    revenueCapBRL: 360_000,
  },
  presumido: {
    label: "Lucro Presumido",
    rate: 13.33,
    rateExport: 9,
    hint: "PJ tributada por presunção. Comum acima de R$360k/ano em serviços.",
    hintExport: "Exportação: PIS/COFINS isentos, ISS varia por município. ~9% efetivo.",
    revenueCapBRL: 78_000_000,
  },
  pf: {
    label: "Pessoa Física",
    rate: 27.5,
    rateExport: 27.5,
    hint: "Carnê-leão progressivo (alíquota máxima). Sem CNPJ.",
    hintExport: "PF não tem regime de exportação — IRPF incide igualmente sobre renda externa.",
    revenueCapBRL: null,
  },
  custom: {
    label: "Personalizado",
    rate: null,
    rateExport: null,
    hint: "Defina manualmente no slider abaixo.",
    hintExport: "Defina manualmente no slider abaixo.",
    revenueCapBRL: null,
  },
} as const;

export const getRegimeRate = (
  key: TaxRegimeKey,
  isExport: boolean
): number | null => {
  const regime = TAX_REGIMES[key];
  return isExport ? regime.rateExport : regime.rate;
};

export const getRegimeHint = (
  key: TaxRegimeKey,
  isExport: boolean
): string => {
  const regime = TAX_REGIMES[key];
  return isExport ? regime.hintExport : regime.hint;
};

export type TaxRegimeKey = keyof typeof TAX_REGIMES;

export const TAX_REGIME_KEYS: readonly TaxRegimeKey[] = [
  "mei",
  "simples",
  "presumido",
  "pf",
  "custom",
];

export const detectRegimeFromRate = (
  rate: number
): TaxRegimeKey | undefined => {
  for (const key of TAX_REGIME_KEYS) {
    const regime = TAX_REGIMES[key];
    if (regime.rate !== null && Math.abs(regime.rate - rate) < 0.01) {
      return key;
    }
  }
  return undefined;
};
