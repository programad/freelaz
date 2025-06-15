/**
 * SEO Configuration for Freelaz Pages
 *
 * This file contains predefined SEO settings for all planned pages.
 * Use this when implementing new routes to maintain consistency.
 */

export const seoConfig = {
  // Current pages
  home: {
    title: "🇧🇷 Freelaz - Calculadora de Preços para Freelancers",
    description:
      "Calculadora de preços para freelancers brasileiros que trabalham com clientes americanos. Calcule suas tarifas de forma inteligente e competitiva.",
    keywords:
      "freelancer, brasil, calculadora, preços, tarifas, dólar, real, conversão, trabalho remoto",
    image: "/og-image.jpg",
  },

  // Phase 2: Foundation (Auth + Data Collection)
  login: {
    title: "Login - Freelaz",
    description:
      "Faça login para acessar recursos premium e salvar seus cálculos.",
    keywords: "freelancer, login, conta, brasil",
    image: "/og-auth.jpg",
  },
  dashboard: {
    title: "Dashboard - Freelaz Analytics",
    description:
      "Visualize suas métricas de preços e performance como freelancer brasileiro.",
    keywords: "dashboard, analytics, freelancer, métricas, performance",
    image: "/og-dashboard.jpg",
  },

  // Phase 3: Community Data (Market Intelligence)
  analytics: {
    title: "Análise de Mercado - Freelaz",
    description:
      "Dados em tempo real do mercado freelancer brasileiro. Médias regionais e tendências.",
    keywords: "mercado freelancer, dados, análise, brasil, tendências",
    image: "/og-analytics.jpg",
  },
  pricing: {
    title: "Planos Premium - Freelaz",
    description:
      "Desbloqueie insights avançados e ferramentas premium para freelancers.",
    keywords: "premium, planos, freelancer, analytics avançado",
    image: "/og-pricing.jpg",
  },

  // Phase 4: Collaborative (Project Estimates)
  community: {
    title: "Comunidade - Freelaz",
    description:
      "Conecte-se com outros freelancers brasileiros e compartilhe experiências.",
    keywords: "comunidade, freelancers, brasil, networking, experiências",
    image: "/og-community.jpg",
  },
  estimates: {
    title: "Estimativas de Projetos - Freelaz",
    description:
      "Descubra quanto cobrar por projetos com a ajuda da comunidade.",
    keywords: "estimativas, projetos, quanto cobrar, freelancer, comunidade",
    image: "/og-estimates.jpg",
  },

  // Phase 5: Premium (Marketplace & Scale)
  marketplace: {
    title: "Marketplace - Freelaz",
    description:
      "Encontre projetos ideais para seu perfil e conecte-se com clientes.",
    keywords: "marketplace, projetos, freelancer, clientes, trabalho remoto",
    image: "/og-marketplace.jpg",
  },
  projects: {
    title: "Projetos Disponíveis - Freelaz",
    description:
      "Navegue por projetos disponíveis para freelancers brasileiros.",
    keywords: "projetos, vagas, freelancer, oportunidades, brasil",
    image: "/og-projects.jpg",
  },

  // Legal/Support pages
  about: {
    title: "Sobre o Freelaz",
    description:
      "Conheça nossa missão de empoderar freelancers brasileiros com ferramentas de precificação inteligente.",
    keywords: "sobre, freelaz, missão, freelancers brasileiros",
    image: "/og-about.jpg",
  },
  privacy: {
    title: "Política de Privacidade - Freelaz",
    description:
      "Como protegemos seus dados e respeitamos sua privacidade no Freelaz.",
    keywords: "privacidade, lgpd, dados, proteção",
    image: "/og-legal.jpg",
  },
  terms: {
    title: "Termos de Uso - Freelaz",
    description: "Termos e condições de uso da plataforma Freelaz.",
    keywords: "termos, condições, uso, freelaz",
    image: "/og-legal.jpg",
  },
} as const;

// Type helper for IntelliSense
export type SEOConfigKey = keyof typeof seoConfig;

// Helper function to get SEO config
export const getSEOConfig = (page: SEOConfigKey) => seoConfig[page];
