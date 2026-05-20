import { describe, it, expect } from "vitest";
import { calculate, type CalculatorInput } from "./calculator.js";
import type { LocationData } from "./data/location-data.js";

const baseInput: CalculatorInput = {
  profession: "fullstack",
  experienceLevel: "senior",
  state: "sp",
  monthlyExpenses: 8000,
  savingsPercent: 0,
  extraPercent: 0,
  taxPercent: 6,
  workHours: 8,
  workDays: 5,
  vacationDays: 30,
  exchangeRate: 5.5,
  clientLocation: null,
  paymentFeePercent: 0,
};

const highPpiClient: LocationData = {
  city: "Testopolis",
  country: "United States",
  costOfLiving: 3000,
  purchasingPowerIndex: 180,
  averageNetSalary: 8000,
  localDeveloperRates: { junior: 30, mid: 45, senior: 80 },
  category: "tech_hub",
  lastUpdated: "2025-01-01",
};

const brazilClient: LocationData = {
  ...highPpiClient,
  country: "Brazil",
  city: "Test BR",
  purchasingPowerIndex: 70,
  localDeveloperRates: { junior: 8, mid: 14, senior: 22 },
};

describe("calculate — working-hours math", () => {
  it("computes yearly working hours from weeks × days × hours minus vacation", () => {
    const result = calculate(baseInput);
    // (52 * 5 - 30) * 8 = 230 * 8 = 1840
    expect(result.workingDaysPerYear).toBe(230);
    expect(result.workingHoursPerYear).toBe(1840);
    expect(result.workingHoursPerMonth).toBeCloseTo(1840 / 12, 5);
  });
});

describe("calculate — floor selection", () => {
  it("picks cost floor when expenses dominate and no client is set", () => {
    const result = calculate({
      ...baseInput,
      profession: "copywriter",
      experienceLevel: "junior",
      state: "pi",
      monthlyExpenses: 50000,
    });
    expect(result.floorReason).toBe("cost");
    expect(result.costFloor).toBeGreaterThan(result.marketFloor);
    expect(result.locationFloor).toBe(0);
  });

  it("picks market floor when expenses are tiny and no client is set", () => {
    const result = calculate({
      ...baseInput,
      monthlyExpenses: 500,
    });
    expect(result.floorReason).toBe("market");
    expect(result.marketFloor).toBeGreaterThan(result.costFloor);
    expect(result.locationFloor).toBe(0);
  });

  it("picks location floor when a high-PPI client is set", () => {
    const result = calculate({
      ...baseInput,
      monthlyExpenses: 500,
      clientLocation: highPpiClient,
    });
    expect(result.floorReason).toBe("location");
    expect(result.locationFloor).toBeGreaterThan(result.marketFloor);
    expect(result.locationFloor).toBeGreaterThan(result.costFloor);
    expect(result.locationAdjustment).not.toBeNull();
  });

  it("final rate equals the highest of the three floors when no payment fee", () => {
    const result = calculate({
      ...baseInput,
      monthlyExpenses: 500,
      clientLocation: highPpiClient,
    });
    const highestFloor = Math.max(
      result.costFloor,
      result.marketFloor,
      result.locationFloor
    );
    expect(result.finalBaseRate).toBeCloseTo(highestFloor, 5);
  });
});

describe("calculate — payment fee multiplier", () => {
  it("0% fee leaves the rate unchanged", () => {
    const result = calculate({ ...baseInput, paymentFeePercent: 0 });
    const preFee = Math.max(
      result.costFloor,
      result.marketFloor,
      result.locationFloor
    );
    expect(result.finalBaseRate).toBeCloseTo(preFee, 5);
  });

  it("4.5% fee scales the rate by 1/(1 - 0.045)", () => {
    const zero = calculate({ ...baseInput, paymentFeePercent: 0 });
    const fee = calculate({ ...baseInput, paymentFeePercent: 4.5 });
    expect(fee.finalBaseRate / zero.finalBaseRate).toBeCloseTo(
      1 / (1 - 0.045),
      5
    );
  });

  it("clamps when fee is >= 100% so no NaN or Infinity escapes", () => {
    const clamped = calculate({ ...baseInput, paymentFeePercent: 100 });
    const ridiculous = calculate({ ...baseInput, paymentFeePercent: 150 });
    expect(Number.isFinite(clamped.finalBaseRate)).toBe(true);
    expect(Number.isFinite(ridiculous.finalBaseRate)).toBe(true);
    // Both fall through the guard and act as 1x.
    const baseline = calculate({ ...baseInput, paymentFeePercent: 0 });
    expect(clamped.finalBaseRate).toBeCloseTo(baseline.finalBaseRate, 5);
    expect(ridiculous.finalBaseRate).toBeCloseTo(baseline.finalBaseRate, 5);
  });
});

describe("calculate — rate multipliers", () => {
  it("propagates 1.0 / 1.25 / 1.5 / 2.0 to rates", () => {
    const result = calculate(baseInput);
    expect(result.rates.regular).toBeCloseTo(result.finalBaseRate * 1.0, 5);
    expect(result.rates.revision).toBeCloseTo(result.finalBaseRate * 1.25, 5);
    expect(result.rates.rush).toBeCloseTo(result.finalBaseRate * 1.5, 5);
    expect(result.rates.difficult).toBeCloseTo(result.finalBaseRate * 2.0, 5);
  });
});

describe("calculate — potentialGains shape", () => {
  it("is null without a client location", () => {
    const result = calculate({ ...baseInput, clientLocation: null });
    expect(result.potentialGains).toBeNull();
  });

  it("is populated with a client location", () => {
    const result = calculate({
      ...baseInput,
      clientLocation: highPpiClient,
    });
    expect(result.potentialGains).not.toBeNull();
    expect(result.potentialGains!.baseNetRevenue).toBeGreaterThan(0);
    expect(result.potentialGains!.adjustedNetRevenue).toBeGreaterThan(0);
  });

  it("reports zero tax savings for a Brazilian client (export branch not taken)", () => {
    const result = calculate({
      ...baseInput,
      clientLocation: brazilClient,
    });
    expect(result.potentialGains!.taxSavings).toBe(0);
  });
});
