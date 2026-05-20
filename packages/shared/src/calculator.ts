import { stateData, type StateKey } from "./state-data.js";
import {
  calculateMarketRates,
  getCompetitivePosition,
} from "./market-rates.js";
import type { ProfessionKey, ExperienceLevel } from "./profession-data.js";
import type { LocationData } from "./data/location-data.js";
import { RATE_MULTIPLIERS } from "./constants.js";

export interface CalculatorInput {
  profession: ProfessionKey;
  experienceLevel: ExperienceLevel;
  state: StateKey;
  monthlyExpenses: number;
  savingsPercent: number;
  extraPercent: number;
  taxPercent: number;
  workHours: number;
  workDays: number;
  vacationDays: number;
  exchangeRate: number;
  clientLocation?: LocationData | null;
  paymentFeePercent?: number;
}

export interface LocationAdjustment {
  adjustedRate: number;
  multiplier: number;
  reasoning: string;
  comparison: {
    localSeniorRate: number;
    yourAdvantage: number;
    competitivePosition: "premium" | "competitive" | "balanced";
  };
}

export interface PotentialGains {
  monthlyDifference: number;
  yearlyDifference: number;
  percentageChange: number;
  isGain: boolean;
  taxSavings: number;
  baseNetRevenue: number;
  adjustedNetRevenue: number;
}

export interface CalculatorRates {
  regular: number;
  revision: number;
  rush: number;
  difficult: number;
}

export type FloorReason = "cost" | "market" | "location";

export interface CalculatorResult {
  costOfLivingIndex: number;
  adjustedExpenses: number;
  savingsAmount: number;
  extraAmount: number;
  netMonthlyNeeds: number;
  grossMonthlyNeeds: number;
  grossMonthlyNeedsAdjusted: number;
  workingDaysPerYear: number;
  workingHoursPerYear: number;
  workingHoursPerMonth: number;
  baseRate: number;
  baseRateWithAdjustedTax: number;
  finalBaseRate: number;
  /** BRL/hour floors that competed for the final rate */
  costFloor: number;
  marketFloor: number;
  locationFloor: number;
  /** Which floor determined the final rate */
  floorReason: FloorReason;
  adjustedTaxPercent: number;
  rates: CalculatorRates;
  marketRange: { min: number; max: number };
  position: string;
  competitiveAnalysis: ReturnType<typeof getCompetitivePosition>;
  locationAdjustment: LocationAdjustment | null;
  potentialGains: PotentialGains | null;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export const calculateLocationAdjustment = (
  baseRateBRL: number,
  clientLocation: LocationData,
  exchangeRate: number
): LocationAdjustment => {
  const purchasingPowerMultiplier = Math.max(
    clientLocation.purchasingPowerIndex / 100,
    0.8
  );
  const localSeniorRate = clientLocation.localDeveloperRates.senior;
  const competitiveRate = localSeniorRate * 0.75;
  const baseRateUSD = baseRateBRL / exchangeRate;
  const adjustedRateUSD = Math.max(
    baseRateUSD * purchasingPowerMultiplier,
    competitiveRate
  );
  const multiplier = adjustedRateUSD / baseRateUSD;
  const yourAdvantage =
    ((localSeniorRate - adjustedRateUSD) / localSeniorRate) * 100;

  let reasoning: string;
  let competitivePosition: LocationAdjustment["comparison"]["competitivePosition"];
  if (multiplier > 1.2) {
    reasoning = `Taxa ajustada para cima (+${Math.round(
      (multiplier - 1) * 100
    )}%) devido ao alto poder de compra em ${clientLocation.city}`;
    competitivePosition = "premium";
  } else if (multiplier < 0.9) {
    reasoning = `Taxa competitiva (-${Math.round(
      (1 - multiplier) * 100
    )}%) considerando mercado local em ${clientLocation.city}`;
    competitivePosition = "competitive";
  } else {
    reasoning = `Taxa balanceada entre seus custos brasileiros e mercado de ${clientLocation.city}`;
    competitivePosition = "balanced";
  }

  return {
    adjustedRate: adjustedRateUSD,
    multiplier,
    reasoning,
    comparison: {
      localSeniorRate,
      yourAdvantage: Math.round(yourAdvantage),
      competitivePosition,
    },
  };
};


export const calculate = (input: CalculatorInput): CalculatorResult => {
  const {
    profession,
    experienceLevel,
    state,
    monthlyExpenses,
    savingsPercent,
    extraPercent,
    taxPercent,
    workHours,
    workDays,
    vacationDays,
    exchangeRate,
    clientLocation,
    paymentFeePercent = 0,
  } = input;

  const costOfLivingIndex = stateData[state]?.costIndex ?? 100;
  // monthlyExpenses is the user's actual cost of living — use as-is.
  // costOfLivingIndex only informs the regional market-range comparison below.
  const adjustedExpenses = monthlyExpenses;
  const savingsAmount = adjustedExpenses * (savingsPercent / 100);
  const extraAmount = adjustedExpenses * (extraPercent / 100);
  const netMonthlyNeeds = adjustedExpenses + savingsAmount + extraAmount;
  const grossMonthlyNeeds = netMonthlyNeeds / (1 - taxPercent / 100);

  const workingDaysPerYear = 52 * workDays - vacationDays;
  const workingHoursPerYear = workingDaysPerYear * workHours;
  const workingHoursPerMonth = workingHoursPerYear / 12;
  const baseRate = grossMonthlyNeeds / workingHoursPerMonth;

  const locationAdjustment = clientLocation
    ? calculateLocationAdjustment(baseRate, clientLocation, exchangeRate)
    : null;

  const adjustedTaxPercent = taxPercent;
  const grossMonthlyNeedsAdjusted =
    netMonthlyNeeds / (1 - adjustedTaxPercent / 100);
  const baseRateWithAdjustedTax =
    grossMonthlyNeedsAdjusted / workingHoursPerMonth;

  // Market floor — what your seniority commands, regardless of cost.
  // calculateMarketRates returns USD/h adjusted by cost-of-living index,
  // so a Pernambuco senior fullstack quotes a bit lower than SP, which
  // is the realistic Brazilian-market dynamic.
  const marketRangeForFloor = calculateMarketRates(
    profession,
    experienceLevel,
    costOfLivingIndex
  );
  const marketFloorBRL = marketRangeForFloor.min * exchangeRate;

  // Three competing floors — final rate is the highest.
  const costFloor = baseRateWithAdjustedTax;
  const marketFloor = marketFloorBRL;
  const locationFloor = locationAdjustment
    ? locationAdjustment.adjustedRate * exchangeRate
    : 0;

  const preFeeBaseRate = Math.max(costFloor, marketFloor, locationFloor);

  let floorReason: FloorReason;
  if (locationFloor >= costFloor && locationFloor >= marketFloor) {
    floorReason = "location";
  } else if (marketFloor > costFloor) {
    floorReason = "market";
  } else {
    floorReason = "cost";
  }

  const paymentFeeMultiplier =
    paymentFeePercent > 0 && paymentFeePercent < 100
      ? 1 / (1 - paymentFeePercent / 100)
      : 1;
  const finalBaseRate = preFeeBaseRate * paymentFeeMultiplier;

  let potentialGains: PotentialGains | null = null;
  if (locationAdjustment) {
    const baseMonthlyRevenue = baseRateWithAdjustedTax * workingHoursPerMonth;
    const adjustedMonthlyRevenue = finalBaseRate * workingHoursPerMonth;
    const baseTaxes = baseMonthlyRevenue * (adjustedTaxPercent / 100);
    const adjustedTaxes = adjustedMonthlyRevenue * (adjustedTaxPercent / 100);
    const baseNetRevenue = baseMonthlyRevenue - baseTaxes;
    const adjustedNetRevenue = adjustedMonthlyRevenue - adjustedTaxes;
    const monthlyDifference = adjustedNetRevenue - baseNetRevenue;
    potentialGains = {
      monthlyDifference,
      yearlyDifference: monthlyDifference * 12,
      percentageChange:
        ((adjustedNetRevenue - baseNetRevenue) / baseNetRevenue) * 100,
      isGain: monthlyDifference > 0,
      taxSavings:
        clientLocation && clientLocation.country !== "Brazil"
          ? taxPercent - adjustedTaxPercent
          : 0,
      baseNetRevenue,
      adjustedNetRevenue,
    };
  }

  const rates: CalculatorRates = {
    regular: finalBaseRate * RATE_MULTIPLIERS.regular,
    revision: finalBaseRate * RATE_MULTIPLIERS.revision,
    rush: finalBaseRate * RATE_MULTIPLIERS.rush,
    difficult: finalBaseRate * RATE_MULTIPLIERS.difficult,
  };

  const dailyRevenue = finalBaseRate * workHours;
  const weeklyRevenue = dailyRevenue * workDays;
  const yearlyRevenue = finalBaseRate * workingHoursPerYear;
  const monthlyRevenue = yearlyRevenue / 12;

  const marketRange = marketRangeForFloor;
  const avgRate = (marketRange.min + marketRange.max) / 2;
  const competitiveAnalysis = getCompetitivePosition(
    finalBaseRate / exchangeRate,
    clientLocation ?? null,
    experienceLevel
  );

  let position = competitiveAnalysis.position;
  if (!clientLocation) {
    if (baseRate < marketRange.min * 0.8) position = "Abaixo do mercado";
    else if (baseRate > marketRange.max * 1.2) position = "Acima do mercado";
    else if (baseRate > avgRate) position = "Acima da média";
    else position = "Competitivo";
  }

  return {
    costOfLivingIndex,
    adjustedExpenses,
    savingsAmount,
    extraAmount,
    netMonthlyNeeds,
    grossMonthlyNeeds,
    grossMonthlyNeedsAdjusted,
    workingDaysPerYear,
    workingHoursPerYear,
    workingHoursPerMonth,
    baseRate,
    baseRateWithAdjustedTax,
    finalBaseRate,
    costFloor,
    marketFloor,
    locationFloor,
    floorReason,
    adjustedTaxPercent,
    rates,
    marketRange,
    position,
    competitiveAnalysis,
    locationAdjustment,
    potentialGains,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
  };
};
