class RateCalculator {
  constructor() {
    this.elements = {};
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setDefaultValues();
    this.focusFirstInput();
  }

  cacheElements() {
    // Input elements
    this.elements = {
      yearWorkDays: document.getElementById("year-work-days"),
      monthlyExpenses: document.getElementById("monthly-expenses"),
      annualCost: document.getElementById("annual-cost"),
      savingsPercentage: document.getElementById("savings-percentage"),
      savingsValueMonthly: document.getElementById("savings-value-monthly"),
      savingsValueYearly: document.getElementById("savings-value-yearly"),
      extraPercentage: document.getElementById("extra-percentage"),
      extraValueMonthly: document.getElementById("extra-value-monthly"),
      extraValueYearly: document.getElementById("extra-value-yearly"),
      taxesPercentage: document.getElementById("taxes-percentage"),
      taxesValueMonthly: document.getElementById("taxes-value-monthly"),
      taxesValueYearly: document.getElementById("taxes-value-yearly"),
      revisionFactor: document.getElementById("revision-factor"),
      rushFactor: document.getElementById("rush-factor"),
      assholeFactor: document.getElementById("asshole-factor"),
      workHours: document.getElementById("work-hours"),
      workDays: document.getElementById("work-days"),

      // Output elements
      perDay: document.getElementById("per-day"),
      perHour: document.getElementById("per-hour"),
      perRevisionDay: document.getElementById("per-revision-day"),
      perRevisionHour: document.getElementById("per-revision-hour"),
      perRushDay: document.getElementById("per-rush-day"),
      perRushHour: document.getElementById("per-rush-hour"),
      perAssholeDay: document.getElementById("per-asshole-day"),
      perAssholeHour: document.getElementById("per-asshole-hour"),

      // Revenue elements
      revenueDaily: document.getElementById("revenue-daily"),
      revenueWeekly: document.getElementById("revenue-weekly"),
      revenueMonthly: document.getElementById("revenue-monthly"),
      revenueYearly: document.getElementById("revenue-yearly"),
    };
  }

  bindEvents() {
    // Bind monthly/annual sync
    this.elements.monthlyExpenses.addEventListener("input", () =>
      this.syncMonthlyToAnnual()
    );
    this.elements.annualCost.addEventListener("input", () =>
      this.syncAnnualToMonthly()
    );

    // Bind all user inputs to calculate
    const userInputs = document.querySelectorAll(".user-entry");
    userInputs.forEach((input) => {
      input.addEventListener("input", () => this.calculate());
    });

    // Calculate on page load if there are values
    this.calculate();
  }

  setDefaultValues() {
    // Set some reasonable defaults
    if (!this.elements.yearWorkDays.value) {
      this.elements.yearWorkDays.value = "231";
    }
    if (!this.elements.savingsPercentage.value) {
      this.elements.savingsPercentage.value = "20";
    }
    if (!this.elements.extraPercentage.value) {
      this.elements.extraPercentage.value = "10";
    }
    if (!this.elements.taxesPercentage.value) {
      this.elements.taxesPercentage.value = "25";
    }
    if (!this.elements.revisionFactor.value) {
      this.elements.revisionFactor.value = "25";
    }
    if (!this.elements.rushFactor.value) {
      this.elements.rushFactor.value = "50";
    }
    if (!this.elements.assholeFactor.value) {
      this.elements.assholeFactor.value = "100";
    }
    if (!this.elements.workHours.value) {
      this.elements.workHours.value = "8";
    }
    if (!this.elements.workDays.value) {
      this.elements.workDays.value = "5";
    }
  }

  focusFirstInput() {
    this.elements.monthlyExpenses.focus();
  }

  syncMonthlyToAnnual() {
    // This will be handled automatically by calculate() method
    this.calculate();
  }

  syncAnnualToMonthly() {
    // Since annual cost is now calculated from monthly + percentages,
    // we need to reverse-engineer the base monthly expenses
    const grossAnnualValue = parseFloat(this.elements.annualCost.value) || 0;

    if (grossAnnualValue > 0) {
      // Get current percentages
      const savingsPercentage =
        parseFloat(this.elements.savingsPercentage.value) || 0;
      const extraPercentage =
        parseFloat(this.elements.extraPercentage.value) || 0;
      const taxesPercentage =
        parseFloat(this.elements.taxesPercentage.value) || 0;

      // Calculate gross monthly
      const grossMonthly = grossAnnualValue / 12;

      // Calculate net monthly (after taxes)
      const netMonthly =
        taxesPercentage > 0
          ? grossMonthly * (1 - taxesPercentage / 100)
          : grossMonthly;

      // Calculate base monthly expenses (before savings and extra)
      const additionalPercentage = savingsPercentage + extraPercentage;
      const baseMonthly =
        additionalPercentage > 0
          ? netMonthly / (1 + additionalPercentage / 100)
          : netMonthly;

      this.elements.monthlyExpenses.value = baseMonthly.toFixed(2);
    }

    this.calculate();
  }

  calculate() {
    const monthlyExpenses =
      parseFloat(this.elements.monthlyExpenses.value) || 0;
    const yearWorkDays = parseFloat(this.elements.yearWorkDays.value) || 231;

    // Calculate percentage-based values first
    this.calculatePercentageValues(monthlyExpenses);

    // Calculate total annual cost including all expenses
    const totalAnnualCost = this.calculateTotalAnnualCost(monthlyExpenses);

    // Update the annual cost field to show the real total
    this.elements.annualCost.value = totalAnnualCost.toFixed(2);

    // Calculate rates if we have the basic data
    if (totalAnnualCost > 0 && yearWorkDays > 0) {
      this.calculateRates(totalAnnualCost, yearWorkDays);
      this.calculateRevenue();
    } else {
      this.clearRates();
      this.clearRevenue();
    }
  }

  calculatePercentageValues(monthlyExpenses) {
    // Savings
    const savingsPercentage =
      parseFloat(this.elements.savingsPercentage.value) || 0;
    const savingsMonthly = (monthlyExpenses * savingsPercentage) / 100;
    this.elements.savingsValueMonthly.value = savingsMonthly.toFixed(2);
    this.elements.savingsValueYearly.value = (savingsMonthly * 12).toFixed(2);

    // Extra/Personal
    const extraPercentage =
      parseFloat(this.elements.extraPercentage.value) || 0;
    const extraMonthly = (monthlyExpenses * extraPercentage) / 100;
    this.elements.extraValueMonthly.value = extraMonthly.toFixed(2);
    this.elements.extraValueYearly.value = (extraMonthly * 12).toFixed(2);

    // Taxes - calculated differently as it should be on gross income
    const taxesPercentage =
      parseFloat(this.elements.taxesPercentage.value) || 0;

    // For display purposes, show estimated taxes based on net income
    // This will be recalculated properly in calculateTotalAnnualCost
    const estimatedTaxesMonthly = (monthlyExpenses * taxesPercentage) / 100;
    this.elements.taxesValueMonthly.value = estimatedTaxesMonthly.toFixed(2);
    this.elements.taxesValueYearly.value = (estimatedTaxesMonthly * 12).toFixed(
      2
    );
  }

  calculateTotalAnnualCost(monthlyExpenses) {
    // Get percentages
    const savingsPercentage =
      parseFloat(this.elements.savingsPercentage.value) || 0;
    const extraPercentage =
      parseFloat(this.elements.extraPercentage.value) || 0;
    const taxesPercentage =
      parseFloat(this.elements.taxesPercentage.value) || 0;

    // Calculate net monthly needs (expenses + savings + extra)
    const savingsMonthly = (monthlyExpenses * savingsPercentage) / 100;
    const extraMonthly = (monthlyExpenses * extraPercentage) / 100;
    const netMonthlyNeeds = monthlyExpenses + savingsMonthly + extraMonthly;

    // Calculate gross income needed (accounting for taxes)
    // If we need $X after taxes, and tax rate is Y%, then gross = X / (1 - Y/100)
    const grossMonthlyNeeds =
      taxesPercentage > 0
        ? netMonthlyNeeds / (1 - taxesPercentage / 100)
        : netMonthlyNeeds;

    // Update tax display with actual tax amount
    const actualTaxesMonthly = grossMonthlyNeeds - netMonthlyNeeds;
    this.elements.taxesValueMonthly.value = actualTaxesMonthly.toFixed(2);
    this.elements.taxesValueYearly.value = (actualTaxesMonthly * 12).toFixed(2);

    return grossMonthlyNeeds * 12;
  }

  calculateRates(annualCost, yearWorkDays) {
    // Base rates
    const dayRate = annualCost / yearWorkDays;
    const hourRate = dayRate / 8; // Assuming 8 hours per day

    // Multiplier factors
    const revisionFactor =
      (parseFloat(this.elements.revisionFactor.value) || 0) / 100 + 1;
    const rushFactor =
      (parseFloat(this.elements.rushFactor.value) || 0) / 100 + 1;
    const assholeFactor =
      (parseFloat(this.elements.assholeFactor.value) || 0) / 100 + 1;

    // Calculate adjusted rates
    const revisionDayRate = dayRate * revisionFactor;
    const revisionHourRate = revisionDayRate / 8;

    const rushDayRate = dayRate * rushFactor;
    const rushHourRate = rushDayRate / 8;

    const assholeDayRate = dayRate * assholeFactor;
    const assholeHourRate = assholeDayRate / 8;

    // Update display
    this.elements.perDay.textContent = this.formatCurrency(dayRate);
    this.elements.perHour.textContent = this.formatCurrency(hourRate);
    this.elements.perRevisionDay.textContent =
      this.formatCurrency(revisionDayRate);
    this.elements.perRevisionHour.textContent =
      this.formatCurrency(revisionHourRate);
    this.elements.perRushDay.textContent = this.formatCurrency(rushDayRate);
    this.elements.perRushHour.textContent = this.formatCurrency(rushHourRate);
    this.elements.perAssholeDay.textContent =
      this.formatCurrency(assholeDayRate);
    this.elements.perAssholeHour.textContent =
      this.formatCurrency(assholeHourRate);
  }

  clearRates() {
    this.elements.perDay.textContent = "-";
    this.elements.perHour.textContent = "-";
    this.elements.perRevisionDay.textContent = "-";
    this.elements.perRevisionHour.textContent = "-";
    this.elements.perRushDay.textContent = "-";
    this.elements.perRushHour.textContent = "-";
    this.elements.perAssholeDay.textContent = "-";
    this.elements.perAssholeHour.textContent = "-";
  }

  calculateRevenue() {
    const workHours = parseFloat(this.elements.workHours.value) || 8;
    const workDays = parseFloat(this.elements.workDays.value) || 5;
    const hourlyRate =
      parseFloat(this.elements.perHour.textContent.replace(/[$,]/g, "")) || 0;

    if (hourlyRate > 0) {
      const dailyRevenue = hourlyRate * workHours;
      const weeklyRevenue = dailyRevenue * workDays;
      const monthlyRevenue = weeklyRevenue * 4.33; // Average weeks per month
      const yearlyRevenue = weeklyRevenue * 52; // 52 weeks per year

      this.elements.revenueDaily.textContent =
        this.formatCurrency(dailyRevenue);
      this.elements.revenueWeekly.textContent =
        this.formatCurrency(weeklyRevenue);
      this.elements.revenueMonthly.textContent =
        this.formatCurrency(monthlyRevenue);
      this.elements.revenueYearly.textContent =
        this.formatCurrency(yearlyRevenue);
    } else {
      this.clearRevenue();
    }
  }

  clearRevenue() {
    this.elements.revenueDaily.textContent = "-";
    this.elements.revenueWeekly.textContent = "-";
    this.elements.revenueMonthly.textContent = "-";
    this.elements.revenueYearly.textContent = "-";
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new RateCalculator();
});

// Add some helpful utilities
const RateCalculatorUtils = {
  // Common work days per year by country/region
  getTypicalWorkDays: (region = "US") => {
    const workDays = {
      US: 231, // ~260 weekdays - ~29 days off
      EU: 225, // European average
      UK: 228, // UK average
      CA: 230, // Canada average
      AU: 230, // Australia average
    };
    return workDays[region] || workDays["US"];
  },

  // Suggested tax rates by region
  getSuggestedTaxRate: (region = "US") => {
    const taxRates = {
      US: 25, // Rough estimate for freelancers
      EU: 30, // European average
      UK: 28, // UK estimate
      CA: 26, // Canada estimate
      AU: 25, // Australia estimate
    };
    return taxRates[region] || taxRates["US"];
  },

  // Convert hourly rate to other time periods
  convertHourlyRate: (hourlyRate) => {
    return {
      daily: hourlyRate * 8,
      weekly: hourlyRate * 40,
      monthly: hourlyRate * 160, // ~20 working days
      yearly: hourlyRate * 2080, // ~52 weeks * 40 hours
    };
  },
};
