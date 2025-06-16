import type { ProfessionKey, ExperienceLevel } from "./profession-data";
import type { LocationData } from "./data/location-data";

/**
 * Calculate realistic market rates for Brazilian freelancers
 * Based on corrected market research (not the old inflated rates)
 */
export function calculateMarketRates(
  profession: ProfessionKey,
  experienceLevel: ExperienceLevel,
  costOfLivingIndex: number = 100
): { min: number; max: number } {
  // Base rates in USD/hour for Brazilian market (realistic rates)
  const baseRates = {
    frontend: {
      junior: { min: 12, max: 18 },
      pleno: { min: 18, max: 25 },
      senior: { min: 25, max: 35 },
      specialist: { min: 35, max: 45 },
    },
    backend: {
      junior: { min: 15, max: 22 },
      pleno: { min: 22, max: 30 },
      senior: { min: 30, max: 40 },
      specialist: { min: 40, max: 50 },
    },
    fullstack: {
      junior: { min: 18, max: 25 },
      pleno: { min: 25, max: 35 },
      senior: { min: 35, max: 45 },
      specialist: { min: 45, max: 55 },
    },
    mobile: {
      junior: { min: 15, max: 22 },
      pleno: { min: 22, max: 30 },
      senior: { min: 30, max: 40 },
      specialist: { min: 40, max: 50 },
    },
    "ux-ui": {
      junior: { min: 12, max: 18 },
      pleno: { min: 18, max: 25 },
      senior: { min: 25, max: 35 },
      specialist: { min: 35, max: 45 },
    },
    copywriter: {
      junior: { min: 10, max: 15 },
      pleno: { min: 15, max: 22 },
      senior: { min: 22, max: 30 },
      specialist: { min: 30, max: 40 },
    },
  };

  const rates = baseRates[profession]?.[experienceLevel] || {
    min: 20,
    max: 30,
  };

  // Adjust for cost of living (but keep it realistic)
  const adjustment = Math.max(costOfLivingIndex / 100, 0.8); // Minimum 80% of base

  return {
    min: Math.round(rates.min * adjustment),
    max: Math.round(rates.max * adjustment),
  };
}

/**
 * Get competitive positioning against client location rates
 */
export function getCompetitivePosition(
  yourRate: number,
  clientLocation: LocationData | null,
  experienceLevel: ExperienceLevel
): {
  position: string;
  advantage: number;
  reasoning: string;
} {
  if (!clientLocation) {
    return {
      position: "Competitivo",
      advantage: 0,
      reasoning: "Posição competitiva no mercado brasileiro",
    };
  }

  // Map experience levels to location data structure
  const levelMapping = {
    junior: "junior",
    pleno: "mid",
    senior: "senior",
    specialist: "senior",
  } as const;

  const localRate =
    clientLocation.localDeveloperRates[levelMapping[experienceLevel]];

  const advantage = Math.round(((localRate - yourRate) / localRate) * 100);

  let position = "Competitivo";
  let reasoning = "";

  if (advantage > 50) {
    position = "Muito Competitivo";
    reasoning = `${advantage}% mais barato que desenvolvedores locais em ${clientLocation.city}`;
  } else if (advantage > 25) {
    position = "Competitivo";
    reasoning = `${advantage}% mais barato que desenvolvedores locais em ${clientLocation.city}`;
  } else if (advantage > 0) {
    position = "Ligeiramente Competitivo";
    reasoning = `${advantage}% mais barato que desenvolvedores locais em ${clientLocation.city}`;
  } else if (advantage > -25) {
    position = "Próximo ao Mercado Local";
    reasoning = `Taxa similar aos desenvolvedores locais em ${clientLocation.city}`;
  } else {
    position = "Acima do Mercado Local";
    reasoning = `Taxa ${Math.abs(
      advantage
    )}% acima dos desenvolvedores locais em ${clientLocation.city}`;
  }

  return { position, advantage, reasoning };
}
