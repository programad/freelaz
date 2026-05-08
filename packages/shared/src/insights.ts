import type { LocationData } from "./data/location-data.js";

export const COST_LEVEL = {
  VERY_LOW: "Muito Baixo",
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  VERY_HIGH: "Muito Alto",
} as const;

export const SALARY_LEVEL = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  VERY_HIGH: "Muito Alto",
} as const;

export const COMPETITIVENESS = {
  VERY_COMPETITIVE: "Muito Competitivo",
  COMPETITIVE: "Competitivo",
  MODERATE: "Moderado",
  PREMIUM: "Mercado Premium",
} as const;

export type CostLevel = (typeof COST_LEVEL)[keyof typeof COST_LEVEL];
export type SalaryLevel = (typeof SALARY_LEVEL)[keyof typeof SALARY_LEVEL];
export type Competitiveness =
  (typeof COMPETITIVENESS)[keyof typeof COMPETITIVENESS];

export const getCostLevel = (cost: number): CostLevel => {
  if (cost < 1000) return COST_LEVEL.VERY_LOW;
  if (cost < 2000) return COST_LEVEL.LOW;
  if (cost < 3000) return COST_LEVEL.MEDIUM;
  if (cost < 4000) return COST_LEVEL.HIGH;
  return COST_LEVEL.VERY_HIGH;
};

export const getSalaryLevel = (salary: number): SalaryLevel => {
  if (salary < 2000) return SALARY_LEVEL.LOW;
  if (salary < 4000) return SALARY_LEVEL.MEDIUM;
  if (salary < 6000) return SALARY_LEVEL.HIGH;
  return SALARY_LEVEL.VERY_HIGH;
};

export const getCompetitiveness = (seniorRate: number): Competitiveness => {
  if (seniorRate < 30) return COMPETITIVENESS.VERY_COMPETITIVE;
  if (seniorRate < 60) return COMPETITIVENESS.COMPETITIVE;
  if (seniorRate < 100) return COMPETITIVENESS.MODERATE;
  return COMPETITIVENESS.PREMIUM;
};

export const getRecommendation = (location: LocationData): string => {
  const ratio = location.averageNetSalary / location.costOfLiving;
  if (ratio > 2.5)
    return "Excelente custo-benefício - salários altos em relação ao custo de vida";
  if (ratio > 2.0)
    return "Bom custo-benefício - relação salário/custo decente";
  if (ratio > 1.5)
    return "Custo-benefício razoável - relação salário/custo moderada";
  return "Mercado premium - custos altos mas potencialmente muitas oportunidades";
};
