export const INDUSTRIES = {
  none: { label: "—", premium: 0 },
  fintech: { label: "Fintech / Banking", premium: 12 },
  healthcare: { label: "Healthcare / Saúde", premium: 8 },
  ecommerce: { label: "E-commerce / Retail", premium: 0 },
  saas: { label: "SaaS B2B", premium: 5 },
  agency: { label: "Agência / Consultoria", premium: -5 },
  startup: { label: "Startup early-stage", premium: -8 },
  enterprise: { label: "Enterprise", premium: 10 },
  gov: { label: "Governo / Público", premium: -3 },
  edu: { label: "Educação", premium: -5 },
  media: { label: "Mídia / Entretenimento", premium: 0 },
} as const;

export const CLIENT_TYPES = {
  none: { label: "—", premium: 0 },
  direct: { label: "Cliente direto", premium: 5 },
  agency: { label: "Via agência", premium: -10 },
  marketplace: { label: "Marketplace (Upwork, etc)", premium: -15 },
  retainer: { label: "Retainer / longo prazo", premium: -3 },
} as const;

export type IndustryKey = keyof typeof INDUSTRIES;
export type ClientTypeKey = keyof typeof CLIENT_TYPES;

export const INDUSTRY_KEYS: readonly IndustryKey[] = Object.keys(
  INDUSTRIES
) as IndustryKey[];

export const CLIENT_TYPE_KEYS: readonly ClientTypeKey[] = Object.keys(
  CLIENT_TYPES
) as ClientTypeKey[];

export const segmentPremium = (
  industry: IndustryKey,
  clientType: ClientTypeKey
): number => INDUSTRIES[industry].premium + CLIENT_TYPES[clientType].premium;
