export const TAX_REGIMES = {
  mei: {
    label: "MEI",
    rate: 6,
    hint: "Microempreendedor Individual. Faturamento até R$81k/ano. Aplicável também para exportação de serviços.",
    revenueCapBRL: 81_000,
  },
  simples: {
    label: "Simples Nacional",
    rate: 12,
    hint: "Anexo III (serviços). Faixa típica para faturamento entre R$81k e R$360k/ano.",
    revenueCapBRL: 360_000,
  },
  presumido: {
    label: "Lucro Presumido",
    rate: 13.33,
    hint: "PJ tributada por presunção. Comum acima de R$360k/ano em serviços.",
    revenueCapBRL: 78_000_000,
  },
  pf: {
    label: "Pessoa Física",
    rate: 27.5,
    hint: "Carnê-leão progressivo (alíquota máxima). Sem CNPJ.",
    revenueCapBRL: null,
  },
  custom: {
    label: "Personalizado",
    rate: null,
    hint: "Defina manualmente no slider abaixo.",
    revenueCapBRL: null,
  },
} as const;

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
