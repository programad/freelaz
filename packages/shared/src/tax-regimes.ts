export interface LegalSource {
  label: string;
  url: string;
}

export const TAX_REGIMES = {
  mei: {
    label: "MEI",
    rate: 6,
    rateExport: 6,
    hint: "Microempreendedor Individual. Faturamento até R$81k/ano. DAS fixo independente do cliente.",
    hintExport:
      "MEI: alíquota fixa, sem benefício adicional na exportação (mas o teto continua valendo).",
    revenueCapBRL: 81_000,
    sources: [
      {
        label: "LC 123/2006 (Estatuto da MEI)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm",
      },
      {
        label: "LC 128/2008 (cria o MEI)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp128.htm",
      },
      {
        label: "Portal do Empreendedor",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      },
    ] as LegalSource[],
  },
  simples: {
    label: "Simples Nacional",
    rate: 12,
    rateExport: 4.5,
    hint: "Anexo III (serviços). Faturamento entre R$81k e R$360k/ano.",
    hintExport:
      "Exportação de serviços: ISS, PIS e COFINS isentos. Alíquota cai para ~4–5% (Anexo III).",
    revenueCapBRL: 360_000,
    sources: [
      {
        label: "LC 123/2006 (Simples Nacional)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm",
      },
      {
        label: "Resolução CGSN 140/2018",
        url: "http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=92278",
      },
      {
        label: "Anexos do Simples (Receita Federal)",
        url: "https://www8.receita.fazenda.gov.br/simplesnacional/",
      },
    ] as LegalSource[],
  },
  presumido: {
    label: "Lucro Presumido",
    rate: 13.33,
    rateExport: 9,
    hint: "PJ tributada por presunção. Comum acima de R$360k/ano em serviços.",
    hintExport:
      "Exportação: PIS/COFINS isentos, ISS varia por município. ~9% efetivo.",
    revenueCapBRL: 78_000_000,
    sources: [
      {
        label: "Lei 9.249/1995 (Lucro Presumido)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/l9249.htm",
      },
      {
        label: "Lei 9.430/1996 (apuração trimestral)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/l9430.htm",
      },
      {
        label: "Receita Federal — IRPJ/CSLL",
        url: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/irpj",
      },
    ] as LegalSource[],
  },
  pf: {
    label: "Pessoa Física",
    rate: 27.5,
    rateExport: 27.5,
    hint: "Carnê-leão progressivo (alíquota máxima). Sem CNPJ.",
    hintExport:
      "PF não tem regime de exportação — IRPF incide igualmente sobre renda externa.",
    revenueCapBRL: null,
    sources: [
      {
        label: "Lei 7.713/1988 (IRPF)",
        url: "http://www.planalto.gov.br/ccivil_03/leis/l7713.htm",
      },
      {
        label: "Tabela progressiva mensal (Receita Federal)",
        url: "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas",
      },
      {
        label: "Carnê-leão (Receita Federal)",
        url: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/carne-leao",
      },
    ] as LegalSource[],
  },
} as const;

/**
 * Constitutional and statutory bases for the export-of-services tax
 * exemptions (ISS, PIS, COFINS). Surfaced in the UI when the client
 * country isn't Brazil.
 */
export const EXPORT_SOURCES: LegalSource[] = [
  {
    label: "CF/88, Art. 156 §3º II (imunidade do ISS)",
    url: "http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art156",
  },
  {
    label: "LC 116/2003 Art. 2º I (ISS — exportações)",
    url: "http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm",
  },
  {
    label: "Lei 10.637/2002 Art. 5º (PIS — exportações)",
    url: "http://www.planalto.gov.br/ccivil_03/leis/2002/l10637.htm",
  },
  {
    label: "Lei 10.833/2003 Art. 6º (COFINS — exportações)",
    url: "http://www.planalto.gov.br/ccivil_03/leis/2003/l10833.htm",
  },
];

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
];
