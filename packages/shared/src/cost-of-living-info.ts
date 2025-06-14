export const costOfLivingInfo = {
  description:
    "Índices de custo de vida baseados em dados do IBGE e pesquisas de mercado, usando São Paulo como referência (100%).",
  methodology:
    "Os índices consideram moradia, alimentação, transporte, saúde e educação em cada estado.",
  lastUpdated: "2024",
  source: "IBGE - Instituto Brasileiro de Geografia e Estatística",

  // Detailed explanations for each state
  stateDetails: {
    sp: {
      explanation:
        "São Paulo é nossa referência (100%) por ser o maior centro econômico do país.",
      factors: [
        "Maior mercado de trabalho",
        "Custo de moradia elevado",
        "Transporte público extenso",
      ],
      marketContext:
        "Hub tecnológico com maior concentração de startups e empresas de tech.",
    },
    rj: {
      explanation:
        "Rio de Janeiro tem custo ligeiramente menor que SP, especialmente em moradia.",
      factors: [
        "Mercado tech em crescimento",
        "Custo de vida alto mas menor que SP",
        "Setor de petróleo forte",
      ],
      marketContext:
        "Segundo maior mercado tech do Brasil, com foco em fintech e energia.",
    },
    df: {
      explanation:
        "Brasília tem salários públicos altos, mas custo de vida moderado.",
      factors: [
        "Setor público forte",
        "Planejamento urbano",
        "Mercado tech emergente",
      ],
      marketContext: "Crescimento em govtech e soluções para setor público.",
    },
    mg: {
      explanation:
        "Minas Gerais oferece ótimo custo-benefício com mercado tech em expansão.",
      factors: [
        "Custo de vida baixo",
        "BH como hub tech",
        "Qualidade de vida alta",
      ],
      marketContext:
        "Belo Horizonte é um dos principais polos de inovação do país.",
    },
    rs: {
      explanation:
        "Rio Grande do Sul tem forte tradição em tecnologia e custo moderado.",
      factors: [
        "Tradição em TI",
        "Custo de vida razoável",
        "Proximidade com Argentina/Uruguai",
      ],
      marketContext:
        "Porto Alegre é referência em desenvolvimento de software no Sul.",
    },
    pr: {
      explanation:
        "Paraná combina desenvolvimento industrial com crescimento tech.",
      factors: [
        "Economia diversificada",
        "Custo de vida moderado",
        "Logística forte",
      ],
      marketContext: "Curitiba tem ecossistema tech consolidado e crescente.",
    },
    sc: {
      explanation:
        "Santa Catarina oferece alta qualidade de vida e mercado tech aquecido.",
      factors: ["Qualidade de vida excelente", "Economia forte", "Inovação"],
      marketContext:
        "Florianópolis é conhecida como 'Vale do Silício brasileiro'.",
    },
    ba: {
      explanation: "Bahia tem custo baixo e mercado tech em desenvolvimento.",
      factors: [
        "Custo de vida baixo",
        "Incentivos fiscais",
        "Mercado emergente",
      ],
      marketContext:
        "Salvador tem potencial crescente em tech, especialmente fintech.",
    },
    pe: {
      explanation:
        "Pernambuco é referência em tech no Nordeste com custo competitivo.",
      factors: [
        "Porto Digital consolidado",
        "Custo baixo",
        "Incentivos governamentais",
      ],
      marketContext: "Recife é o maior polo tech do Nordeste.",
    },
    ce: {
      explanation:
        "Ceará tem forte crescimento em tech com custo muito competitivo.",
      factors: [
        "Crescimento acelerado",
        "Custo muito baixo",
        "Investimentos em tech",
      ],
      marketContext: "Fortaleza tem ecossistema tech em rápida expansão.",
    },
    go: {
      explanation:
        "Goiás tem custo de vida baixo e crescimento econômico estável.",
      factors: ["Agronegócio forte", "Custo baixo", "Localização central"],
      marketContext: "Goiânia tem mercado tech emergente com foco em agtech.",
    },
    es: {
      explanation: "Espírito Santo combina indústria forte com custo moderado.",
      factors: [
        "Economia diversificada",
        "Portos importantes",
        "Custo moderado",
      ],
      marketContext:
        "Vitória tem crescimento em logtech e soluções portuárias.",
    },
    mt: {
      explanation:
        "Mato Grosso tem economia forte no agronegócio com custo competitivo.",
      factors: ["Agronegócio líder", "Custo baixo", "Crescimento econômico"],
      marketContext: "Cuiabá tem potencial em agtech e soluções rurais.",
    },
    ms: {
      explanation: "Mato Grosso do Sul oferece custo baixo e economia estável.",
      factors: ["Agronegócio", "Custo baixo", "Qualidade de vida"],
      marketContext: "Campo Grande tem mercado tech em desenvolvimento.",
    },
    pa: {
      explanation:
        "Pará tem custo muito baixo mas mercado tech ainda em formação.",
      factors: ["Custo muito baixo", "Recursos naturais", "Mercado emergente"],
      marketContext: "Belém tem potencial em soluções para Amazônia.",
    },
    am: {
      explanation: "Amazonas tem custo baixo e foco em zona franca industrial.",
      factors: ["Zona Franca", "Custo baixo", "Incentivos fiscais"],
      marketContext: "Manaus tem crescimento em tech industrial e logística.",
    },
    ma: {
      explanation:
        "Maranhão tem custo muito baixo e mercado em desenvolvimento.",
      factors: [
        "Custo muito baixo",
        "Crescimento econômico",
        "Potencial portuário",
      ],
      marketContext: "São Luís tem mercado tech emergente.",
    },
    pi: {
      explanation: "Piauí oferece o menor custo de vida do país.",
      factors: [
        "Custo muito baixo",
        "Crescimento estável",
        "Qualidade de vida",
      ],
      marketContext: "Teresina tem mercado tech em formação inicial.",
    },
    al: {
      explanation: "Alagoas tem custo baixo e economia em recuperação.",
      factors: ["Custo baixo", "Turismo", "Economia em crescimento"],
      marketContext: "Maceió tem potencial em turtech e soluções locais.",
    },
    se: {
      explanation: "Sergipe tem custo baixo e economia diversificada.",
      factors: ["Custo baixo", "Petróleo", "Economia estável"],
      marketContext: "Aracaju tem mercado tech pequeno mas crescente.",
    },
    pb: {
      explanation:
        "Paraíba oferece custo baixo e crescimento em educação tech.",
      factors: [
        "Custo baixo",
        "Universidades fortes",
        "Crescimento educacional",
      ],
      marketContext: "João Pessoa tem potencial em edutech.",
    },
    rn: {
      explanation:
        "Rio Grande do Norte tem custo baixo e economia diversificada.",
      factors: ["Custo baixo", "Turismo", "Energia renovável"],
      marketContext: "Natal tem crescimento em cleantech e turismo.",
    },
    ac: {
      explanation: "Acre tem custo baixo mas mercado tech limitado.",
      factors: ["Custo baixo", "Recursos naturais", "Mercado pequeno"],
      marketContext: "Rio Branco tem mercado tech em formação inicial.",
    },
    ro: {
      explanation:
        "Rondônia tem custo baixo e economia baseada no agronegócio.",
      factors: ["Agronegócio", "Custo baixo", "Crescimento estável"],
      marketContext: "Porto Velho tem potencial em agtech.",
    },
    rr: {
      explanation: "Roraima tem custo moderado e economia em desenvolvimento.",
      factors: [
        "Economia pequena",
        "Custo moderado",
        "Fronteira internacional",
      ],
      marketContext: "Boa Vista tem mercado tech muito limitado.",
    },
    ap: {
      explanation:
        "Amapá tem custo moderado e economia baseada em recursos naturais.",
      factors: ["Recursos naturais", "Custo moderado", "Mercado pequeno"],
      marketContext: "Macapá tem mercado tech em formação.",
    },
    to: {
      explanation: "Tocantins tem custo baixo e economia em crescimento.",
      factors: ["Agronegócio", "Custo baixo", "Crescimento econômico"],
      marketContext: "Palmas tem mercado tech emergente em agtech.",
    },
  },
};

export const multiplierExplanation = {
  title: "Como Funcionam os Multiplicadores de Projeto",
  description:
    "Diferentes tipos de projeto exigem diferentes níveis de esforço, risco e complexidade.",

  multipliers: {
    regular: {
      value: 1.0,
      title: "Projeto Normal",
      description:
        "Projetos com escopo bem definido, prazo adequado e cliente colaborativo.",
      examples: [
        "Website institucional",
        "Sistema CRUD básico",
        "Landing page",
      ],
      considerations: [
        "Escopo claro",
        "Prazo realista",
        "Cliente disponível para feedback",
      ],
    },
    revision: {
      value: 1.25,
      title: "Com Revisões",
      description:
        "Projetos que envolvem múltiplas iterações e ajustes frequentes.",
      examples: [
        "Design system",
        "Refatoração de código",
        "Projetos com muitos stakeholders",
      ],
      considerations: [
        "Múltiplas rodadas de feedback",
        "Mudanças de escopo",
        "Processo iterativo",
      ],
    },
    rush: {
      value: 1.5,
      title: "Projeto Urgente",
      description: "Projetos com prazo apertado que exigem trabalho intensivo.",
      examples: [
        "Lançamento de produto",
        "Correção crítica",
        "Projeto com deadline fixo",
      ],
      considerations: [
        "Prazo apertado",
        "Trabalho em horários extras",
        "Pressão alta",
      ],
    },
    difficult: {
      value: 2.0,
      title: "Cliente Difícil",
      description:
        "Projetos com alta complexidade de relacionamento ou requisitos técnicos extremos.",
      examples: [
        "Cliente indeciso",
        "Tecnologia experimental",
        "Requisitos conflitantes",
      ],
      considerations: [
        "Comunicação complexa",
        "Risco técnico alto",
        "Gestão intensiva",
      ],
    },
  },

  tips: [
    "Sempre documente o tipo de projeto no contrato",
    "Explique os multiplicadores para o cliente antecipadamente",
    "Considere cobrar 50% antecipado em projetos urgentes",
    "Mantenha registro de horas extras em projetos rush",
  ],
};
