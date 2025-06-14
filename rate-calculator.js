/**
 * Calculadora de Preços para Freelancers Brasileiros
 * Brazilian Freelancer Rate Calculator
 *
 * Features:
 * - Regional intelligence with Brazilian cities and cost of living
 * - Dual currency support (BRL/USD)
 * - Professional presets by area and experience level
 * - Configuration wizard
 * - Real-time exchange rates
 * - Market comparison
 */

class BrazilianRateCalculator {
  constructor() {
    this.currentLanguage = "pt";
    this.exchangeRate = 5.57; // USD to BRL
    this.costOfLivingIndex = 100; // São Paulo as reference (100%)

    // Regional data
    this.professionData = {
      frontend: {
        name: { pt: "Desenvolvedor Frontend", en: "Frontend Developer" },
        salaryRange: {
          junior: [3500, 6000],
          pleno: [4500, 8000],
          senior: [6000, 12000],
          specialist: [8000, 15000],
        },
        marketAverage: { min: 45, max: 85 },
      },
      backend: {
        name: { pt: "Desenvolvedor Backend", en: "Backend Developer" },
        salaryRange: {
          junior: [4000, 6500],
          pleno: [5000, 9000],
          senior: [7000, 13000],
          specialist: [9000, 16000],
        },
        marketAverage: { min: 50, max: 90 },
      },
      fullstack: {
        name: { pt: "Desenvolvedor Full Stack", en: "Full Stack Developer" },
        salaryRange: {
          junior: [4500, 7000],
          pleno: [5500, 10000],
          senior: [7500, 14000],
          specialist: [10000, 18000],
        },
        marketAverage: { min: 55, max: 95 },
      },
      mobile: {
        name: { pt: "Desenvolvedor Mobile", en: "Mobile Developer" },
        salaryRange: {
          junior: [4000, 6500],
          pleno: [5000, 9500],
          senior: [7000, 13500],
          specialist: [9000, 16500],
        },
        marketAverage: { min: 50, max: 90 },
      },
      "ux-ui": {
        name: { pt: "Designer UX/UI", en: "UX/UI Designer" },
        salaryRange: {
          junior: [3000, 5500],
          pleno: [4000, 7500],
          senior: [5500, 11000],
          specialist: [7000, 13000],
        },
        marketAverage: { min: 40, max: 75 },
      },
      copywriter: {
        name: { pt: "Copywriter", en: "Copywriter" },
        salaryRange: {
          junior: [2500, 4500],
          pleno: [3000, 6500],
          senior: [4500, 9000],
          specialist: [6000, 12000],
        },
        marketAverage: { min: 35, max: 65 },
      },
    };

    this.cityData = {
      "sao-paulo": { name: "São Paulo", costIndex: 100 },
      "rio-janeiro": { name: "Rio de Janeiro", costIndex: 95 },
      brasilia: { name: "Brasília", costIndex: 90 },
      "belo-horizonte": { name: "Belo Horizonte", costIndex: 75 },
      "porto-alegre": { name: "Porto Alegre", costIndex: 80 },
      curitiba: { name: "Curitiba", costIndex: 80 },
      florianopolis: { name: "Florianópolis", costIndex: 85 },
      salvador: { name: "Salvador", costIndex: 70 },
      recife: { name: "Recife", costIndex: 65 },
      fortaleza: { name: "Fortaleza", costIndex: 60 },
      other: { name: "Outra cidade", costIndex: 70 },
    };

    this.rateMultipliers = {
      regular: 1.0,
      revision: 1.25,
      rush: 1.5,
      difficult: 2.0,
    };

    // Wizard state
    this.wizardData = {};
    this.currentWizardStep = 1;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadExchangeRate();
    this.loadSavedConfig();
    this.updateProfileDisplay();
    this.calculate();
    this.updateMarketComparison();
  }

  bindEvents() {
    // Form inputs
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("change", () => this.calculate());
      input.addEventListener("input", () => this.calculate());

      // Auto-select text on focus for number inputs
      if (input.type === "number") {
        input.addEventListener("focus", () => input.select());
        input.addEventListener("click", () => input.select());
      }
    });

    // Sliders
    const sliders = document.querySelectorAll(".slider");
    sliders.forEach((slider) => {
      slider.addEventListener("input", (e) => {
        this.updateSliderValue(e.target);
        this.calculate();
      });
    });

    // Currency toggle
    const currencyRadios = document.querySelectorAll(
      'input[name="cost-currency"]'
    );
    currencyRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.updateCurrencyDisplay();
        this.calculate();
      });
    });

    // Language selector
    document
      .getElementById("lang-pt")
      .addEventListener("click", () => this.setLanguage("pt"));
    document
      .getElementById("lang-en")
      .addEventListener("click", () => this.setLanguage("en"));

    // Wizard
    document
      .getElementById("preset-wizard")
      .addEventListener("click", () => this.openWizard());
    document
      .querySelector(".close")
      .addEventListener("click", () => this.closeWizard());
    document
      .getElementById("wizard-next")
      .addEventListener("click", () => this.nextWizardStep());
    document
      .getElementById("wizard-prev")
      .addEventListener("click", () => this.prevWizardStep());
    document
      .getElementById("wizard-finish")
      .addEventListener("click", () => this.finishWizard());

    // Wizard options
    document.addEventListener("click", (e) => {
      if (e.target.closest(".wizard-option")) {
        this.selectWizardOption(e.target.closest(".wizard-option"));
      }
    });

    // Action buttons
    document
      .getElementById("save-config")
      .addEventListener("click", () => this.saveConfig());
    document
      .getElementById("share-results")
      .addEventListener("click", () => this.shareResults());
    document
      .getElementById("export-pdf")
      .addEventListener("click", () => this.exportPDF());

    // Profile updates (hidden fields will be updated by wizard)
    // No direct event listeners needed since these are hidden fields
  }

  updateSliderValue(slider) {
    const valueSpan = slider.parentElement.querySelector(".slider-value");
    let value = slider.value;

    if (slider.id === "work-hours") {
      valueSpan.textContent = `${value}h`;
    } else if (slider.id === "work-days") {
      valueSpan.textContent = `${value} dias`;
    } else if (slider.id === "vacation-days") {
      valueSpan.textContent = `${value} dias`;
    } else {
      valueSpan.textContent = `${value}%`;
    }
  }

  updateCurrencyDisplay() {
    const isBRL = document.getElementById("cost-brl").checked;
    const symbol = isBRL ? "R$" : "$";

    document.getElementById("expense-currency").textContent = symbol;
  }

  updateCostOfLiving() {
    const citySelect = document.getElementById("city");
    const selectedOption = citySelect.options[citySelect.selectedIndex];

    if (selectedOption && selectedOption.dataset.costIndex) {
      this.costOfLivingIndex = parseInt(selectedOption.dataset.costIndex);
      this.calculate();
    }
  }

  updateProfileDisplay() {
    const profession = document.getElementById("profession").value;
    const city = document.getElementById("city").value;
    const experience = document.getElementById("experience-level").value;

    // Update profession display
    if (profession && this.professionData[profession]) {
      const professionName = this.professionData[profession].name;
      let displayName;

      if (typeof professionName === "object") {
        displayName = professionName[this.currentLanguage] || professionName.pt;
      } else {
        displayName = professionName;
      }

      document.getElementById("current-profession").textContent = displayName;
    } else {
      document.getElementById("current-profession").textContent =
        "Use o assistente para configurar";
    }

    // Update city display
    if (city) {
      const citySelect = document.getElementById("city");
      const selectedOption = Array.from(citySelect.options).find(
        (opt) => opt.value === city
      );
      if (selectedOption) {
        document.getElementById("current-city").textContent =
          selectedOption.textContent;
      }
    } else {
      document.getElementById("current-city").textContent = "-";
    }

    // Update experience display
    const experienceLabels = {
      junior: "Júnior (0-2 anos)",
      pleno: "Pleno (2-5 anos)",
      senior: "Sênior (5+ anos)",
      specialist: "Especialista (8+ anos)",
    };
    document.getElementById("current-experience").textContent =
      experienceLabels[experience] || "Pleno (2-5 anos)";
  }

  updateMarketComparison() {
    const profession = document.getElementById("profession").value;
    const experience = document.getElementById("experience-level").value;

    if (profession && this.professionData[profession]) {
      const data = this.professionData[profession];
      const range = data.marketAverage;

      // Adjust for cost of living
      const adjustedMin = Math.round(
        range.min * (this.costOfLivingIndex / 100)
      );
      const adjustedMax = Math.round(
        range.max * (this.costOfLivingIndex / 100)
      );

      document.getElementById(
        "market-average"
      ).textContent = `R$ ${adjustedMin}-${adjustedMax}/h`;

      // Calculate position
      const currentRate = this.calculateBaseRate();
      const currentRateBRL = this.convertToBRL(currentRate);
      const avgRate = (adjustedMin + adjustedMax) / 2;

      let position = "Competitivo";
      if (currentRateBRL < adjustedMin * 0.8) {
        position = "Abaixo do mercado";
      } else if (currentRateBRL > adjustedMax * 1.2) {
        position = "Acima do mercado";
      } else if (currentRateBRL > avgRate) {
        position = "Acima da média";
      }

      document.getElementById("market-position").textContent = position;
    }
  }

  calculate() {
    const baseRate = this.calculateBaseRate();
    this.updateRateDisplay(baseRate);
    this.updateRevenueProjections(baseRate);
    this.updateCostBreakdown();
  }

  calculateBaseRate() {
    const monthlyExpenses =
      parseFloat(document.getElementById("monthly-expenses").value) || 0;
    const savingsPercent =
      parseFloat(document.getElementById("savings-percent").value) || 0;
    const extraPercent =
      parseFloat(document.getElementById("extra-percent").value) || 0;
    const taxPercent =
      parseFloat(document.getElementById("tax-percent").value) || 0;
    const workHours =
      parseFloat(document.getElementById("work-hours").value) || 8;
    const workDays =
      parseFloat(document.getElementById("work-days").value) || 5;
    const vacationDays =
      parseFloat(document.getElementById("vacation-days").value) || 30;

    // Apply cost of living adjustment
    const adjustedExpenses = monthlyExpenses * (this.costOfLivingIndex / 100);

    // Calculate net monthly needs
    const savingsAmount = adjustedExpenses * (savingsPercent / 100);
    const extraAmount = adjustedExpenses * (extraPercent / 100);
    const netMonthlyNeeds = adjustedExpenses + savingsAmount + extraAmount;

    // Calculate gross income needed (accounting for taxes on gross income)
    const grossMonthlyNeeds = netMonthlyNeeds / (1 - taxPercent / 100);

    // Calculate working hours per month
    const workingDaysPerYear = 52 * workDays - vacationDays;
    const workingHoursPerYear = workingDaysPerYear * workHours;
    const workingHoursPerMonth = workingHoursPerYear / 12;

    // Calculate base hourly rate
    const baseRate = grossMonthlyNeeds / workingHoursPerMonth;

    return baseRate;
  }

  updateRateDisplay(baseRate) {
    const rates = {
      regular: baseRate * this.rateMultipliers.regular,
      revision: baseRate * this.rateMultipliers.revision,
      rush: baseRate * this.rateMultipliers.rush,
      difficult: baseRate * this.rateMultipliers.difficult,
    };

    Object.keys(rates).forEach((type) => {
      const rateBRL = rates[type];
      const rateUSD = rateBRL / this.exchangeRate;

      document.getElementById(`${type}-rate-brl`).textContent =
        this.formatCurrency(rateBRL, "BRL");
      document.getElementById(`${type}-rate-usd`).textContent =
        this.formatCurrency(rateUSD, "USD");
    });
  }

  updateRevenueProjections(baseRate) {
    const workHours =
      parseFloat(document.getElementById("work-hours").value) || 8;
    const workDays =
      parseFloat(document.getElementById("work-days").value) || 5;

    const dailyRevenueBRL = baseRate * workHours;
    const weeklyRevenueBRL = dailyRevenueBRL * workDays;
    const monthlyRevenueBRL = weeklyRevenueBRL * 4.33; // Average weeks per month
    const yearlyRevenueBRL = monthlyRevenueBRL * 12;

    // Convert to USD
    const dailyRevenueUSD = dailyRevenueBRL / this.exchangeRate;
    const weeklyRevenueUSD = weeklyRevenueBRL / this.exchangeRate;
    const monthlyRevenueUSD = monthlyRevenueBRL / this.exchangeRate;
    const yearlyRevenueUSD = yearlyRevenueBRL / this.exchangeRate;

    // Update display
    document.getElementById("daily-revenue-brl").textContent =
      this.formatCurrency(dailyRevenueBRL, "BRL");
    document.getElementById("daily-revenue-usd").textContent =
      this.formatCurrency(dailyRevenueUSD, "USD");
    document.getElementById("weekly-revenue-brl").textContent =
      this.formatCurrency(weeklyRevenueBRL, "BRL");
    document.getElementById("weekly-revenue-usd").textContent =
      this.formatCurrency(weeklyRevenueUSD, "USD");
    document.getElementById("monthly-revenue-brl").textContent =
      this.formatCurrency(monthlyRevenueBRL, "BRL");
    document.getElementById("monthly-revenue-usd").textContent =
      this.formatCurrency(monthlyRevenueUSD, "USD");
    document.getElementById("yearly-revenue-brl").textContent =
      this.formatCurrency(yearlyRevenueBRL, "BRL");
    document.getElementById("yearly-revenue-usd").textContent =
      this.formatCurrency(yearlyRevenueUSD, "USD");
  }

  updateCostBreakdown() {
    const monthlyExpenses =
      parseFloat(document.getElementById("monthly-expenses").value) || 0;
    const savingsPercent =
      parseFloat(document.getElementById("savings-percent").value) || 0;
    const extraPercent =
      parseFloat(document.getElementById("extra-percent").value) || 0;
    const taxPercent =
      parseFloat(document.getElementById("tax-percent").value) || 0;

    // Apply cost of living adjustment
    const adjustedExpenses = monthlyExpenses * (this.costOfLivingIndex / 100);

    const savingsAmount = adjustedExpenses * (savingsPercent / 100);
    const extraAmount = adjustedExpenses * (extraPercent / 100);
    const netTotal = adjustedExpenses + savingsAmount + extraAmount;
    const taxAmount = netTotal * (taxPercent / (100 - taxPercent));
    const grossTotal = netTotal + taxAmount;

    document.getElementById("basic-costs").textContent = this.formatCurrency(
      adjustedExpenses,
      "BRL"
    );
    document.getElementById("savings-costs").textContent = this.formatCurrency(
      savingsAmount,
      "BRL"
    );
    document.getElementById("extra-costs").textContent = this.formatCurrency(
      extraAmount,
      "BRL"
    );
    document.getElementById("net-total").textContent = this.formatCurrency(
      netTotal,
      "BRL"
    );
    document.getElementById("tax-costs").textContent = this.formatCurrency(
      taxAmount,
      "BRL"
    );
    document.getElementById("gross-total").textContent = this.formatCurrency(
      grossTotal,
      "BRL"
    );
  }

  formatCurrency(amount, currency) {
    const locale = currency === "BRL" ? "pt-BR" : "en-US";
    const currencyCode = currency === "BRL" ? "BRL" : "USD";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  convertToBRL(usdAmount) {
    return usdAmount * this.exchangeRate;
  }

  convertToUSD(brlAmount) {
    return brlAmount / this.exchangeRate;
  }

  // Wizard functionality
  openWizard() {
    document.getElementById("wizard-modal").style.display = "block";
    this.currentWizardStep = 1;
    this.showWizardStep(1);
  }

  closeWizard() {
    // Hide the modal
    document.getElementById("wizard-modal").style.display = "none";

    // Reset wizard to first step
    this.currentWizardStep = 1;
    this.showWizardStep(1);

    // Clear all selections
    document.querySelectorAll(".wizard-option.selected").forEach((option) => {
      option.classList.remove("selected");
    });
  }

  showWizardStep(step) {
    document
      .querySelectorAll(".wizard-step")
      .forEach((s) => s.classList.remove("active"));
    document.querySelector(`[data-step="${step}"]`).classList.add("active");

    document.getElementById("wizard-prev").style.display =
      step === 1 ? "none" : "inline-block";
    document.getElementById("wizard-next").style.display =
      step === 3 ? "none" : "inline-block";
    document.getElementById("wizard-finish").style.display =
      step === 3 ? "inline-block" : "none";
  }

  nextWizardStep() {
    if (this.currentWizardStep < 3) {
      this.currentWizardStep++;
      this.showWizardStep(this.currentWizardStep);
    }
  }

  prevWizardStep() {
    if (this.currentWizardStep > 1) {
      this.currentWizardStep--;
      this.showWizardStep(this.currentWizardStep);
    }
  }

  selectWizardOption(option) {
    // Remove selection from siblings
    option.parentElement.querySelectorAll(".wizard-option").forEach((opt) => {
      opt.classList.remove("selected");
    });

    // Select current option
    option.classList.add("selected");

    // Store selection
    const step = option.closest(".wizard-step").dataset.step;
    console.log("Selecting option in step:", step, "option:", option.dataset);

    if (step === "1") {
      this.wizardData = {
        ...this.wizardData,
        profession: option.dataset.profession,
      };
    } else if (step === "2") {
      this.wizardData = { ...this.wizardData, city: option.dataset.city };
    } else if (step === "3") {
      this.wizardData = {
        ...this.wizardData,
        experience: option.dataset.experience,
      };
    }

    console.log("Updated wizardData:", this.wizardData);
  }

  finishWizard() {
    console.log("finishWizard called, wizardData:", this.wizardData);

    // Check if all required wizard steps are completed
    const hasAllData =
      this.wizardData &&
      this.wizardData.profession &&
      this.wizardData.city &&
      this.wizardData.experience;

    if (hasAllData) {
      // Apply wizard selections to form fields
      document.getElementById("profession").value = this.wizardData.profession;
      document.getElementById("city").value = this.wizardData.city;
      document.getElementById("experience-level").value =
        this.wizardData.experience;

      // Update profile display
      this.updateProfileDisplay();

      // Apply profession-based presets
      this.applyProfessionPresets();

      // Update calculations
      this.updateCostOfLiving();
      this.updateMarketComparison();
      this.calculate();

      // Close wizard first
      this.closeWizard();

      // Reset wizard state for next use
      this.wizardData = {};
      this.currentWizardStep = 1;

      // Show success notification
      this.showNotification("Configuração aplicada com sucesso!", "success");
    } else {
      this.showNotification(
        "Por favor, complete todas as etapas do assistente",
        "error"
      );
    }
  }

  applyProfessionPresets() {
    const profession = this.wizardData?.profession;
    const experience = this.wizardData?.experience;

    if (profession && experience && this.professionData[profession]) {
      const salaryRange =
        this.professionData[profession].salaryRange[experience];
      if (salaryRange) {
        // Set monthly expenses based on salary range (assuming 30-40% of income for expenses)
        const avgSalary = (salaryRange[0] + salaryRange[1]) / 2;
        const suggestedExpenses = Math.round(avgSalary * 0.35);
        document.getElementById("monthly-expenses").value = suggestedExpenses;
      }
    }
  }

  // Exchange rate functionality
  async loadExchangeRate() {
    try {
      // Try AwesomeAPI first (Brazilian)
      const response = await fetch(
        "https://economia.awesomeapi.com.br/last/USD-BRL"
      );
      const data = await response.json();

      if (data.USDBRL) {
        this.exchangeRate = parseFloat(data.USDBRL.bid);
        document.getElementById("current-rate").textContent =
          this.exchangeRate.toFixed(2);
        document.getElementById("rate-updated").textContent =
          "Atualizado: agora";
      }
    } catch (error) {
      console.log(
        "Failed to load exchange rate from AwesomeAPI, using fallback"
      );
      this.loadExchangeRateFallback();
    }
  }

  async loadExchangeRateFallback() {
    try {
      // Fallback to ExchangeRate-API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();

      if (data.rates && data.rates.BRL) {
        this.exchangeRate = data.rates.BRL;
        document.getElementById("current-rate").textContent =
          this.exchangeRate.toFixed(2);
        document.getElementById("rate-updated").textContent =
          "Atualizado: agora";
      }
    } catch (error) {
      console.log("Failed to load exchange rate, using default");
      document.getElementById("rate-updated").textContent = "Taxa padrão";
    }
  }

  // Configuration management
  saveConfig() {
    const config = {
      profession: document.getElementById("profession").value,
      city: document.getElementById("city").value,
      experienceLevel: document.getElementById("experience-level").value,
      monthlyExpenses: document.getElementById("monthly-expenses").value,
      savingsPercent: document.getElementById("savings-percent").value,
      extraPercent: document.getElementById("extra-percent").value,
      taxPercent: document.getElementById("tax-percent").value,
      workHours: document.getElementById("work-hours").value,
      workDays: document.getElementById("work-days").value,
      vacationDays: document.getElementById("vacation-days").value,
      costCurrency: document.querySelector(
        'input[name="cost-currency"]:checked'
      ).value,
    };

    localStorage.setItem(
      "brazilianRateCalculatorConfig",
      JSON.stringify(config)
    );
    this.showNotification("Configuração salva com sucesso!", "success");
  }

  loadSavedConfig() {
    const saved = localStorage.getItem("brazilianRateCalculatorConfig");
    if (saved) {
      try {
        const config = JSON.parse(saved);

        // Apply saved configuration
        Object.keys(config).forEach((key) => {
          const element = document.getElementById(
            key.replace(/([A-Z])/g, "-$1").toLowerCase()
          );
          if (element) {
            if (element.type === "radio") {
              document.querySelector(
                `input[name="${element.name}"][value="${config[key]}"]`
              ).checked = true;
            } else {
              element.value = config[key];
            }

            // Update slider displays
            if (element.classList.contains("slider")) {
              this.updateSliderValue(element);
            }
          }
        });

        this.updateCurrencyDisplay();
        this.updateCostOfLiving();
        this.updateProfileDisplay();
        this.updateMarketComparison();
        this.calculate();
      } catch (error) {
        console.log("Failed to load saved configuration");
      }
    }
  }

  shareResults() {
    const baseRate = this.calculateBaseRate();
    const rateBRL = this.formatCurrency(baseRate, "BRL");
    const rateUSD = this.formatCurrency(baseRate / this.exchangeRate, "USD");

    const text = `🇧🇷 Minha taxa como freelancer: ${rateBRL}/hora (${rateUSD}/hora)\n\nCalculado com a Calculadora de Preços para Freelancers Brasileiros`;

    if (navigator.share) {
      navigator.share({
        title: "Minha Taxa de Freelancer",
        text: text,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification(
          "Resultado copiado para a área de transferência!",
          "success"
        );
      });
    }
  }

  exportPDF() {
    // This would integrate with a PDF library like jsPDF
    this.showNotification("Funcionalidade de PDF em desenvolvimento", "info");
  }

  setLanguage(lang) {
    this.currentLanguage = lang;

    // Update active language button
    document
      .querySelectorAll(".lang-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`lang-${lang}`).classList.add("active");

    // This would update all text content based on language
    // For now, we'll just show a notification
    this.showNotification(
      lang === "pt"
        ? "Idioma alterado para Português"
        : "Language changed to English",
      "info"
    );
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 20px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "600",
      zIndex: "9999",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
    });

    // Set background color based on type
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      info: "#17a2b8",
      warning: "#ffc107",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the calculator when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.calculator = new BrazilianRateCalculator();
});

// Handle modal clicks outside content
window.addEventListener("click", (e) => {
  const modal = document.getElementById("wizard-modal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
