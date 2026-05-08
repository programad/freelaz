import { useState, useEffect, useCallback, useRef } from "react";
import {
  professionData,
  stateData,
  formatCurrency,
  calculate,
  calculateLocationAdjustment,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
} from "@freelaz/shared";
import { ConfigurationModal } from "./components/configuration-modal";
import { CalculationBreakdownModal } from "./components/calculation-breakdown-modal";
import { ParametersInfoModal } from "./components/parameters-info-modal";
import {
  ClientLocationInput,
  type LocationAnalysis,
} from "./components/client-location-input";
import {
  GoogleAnalytics,
  useGoogleAnalytics,
} from "./components/google-analytics";
import { Footer } from "./components/footer";
import {
  useLocalStorageConfig,
  type FreelazConfig,
} from "./hooks/use-local-storage";
import { useToast } from "./hooks/use-toast";
import { ToastContainer } from "./components/toast-container";
import type { LocationData } from "@freelaz/shared";

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [showCalculationBreakdown, setShowCalculationBreakdown] =
    useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.57);
  const [lastUpdated, setLastUpdated] = useState("Taxa padrão");

  // Client location state
  const [clientLocation, setClientLocation] = useState<LocationData | null>(
    null
  );
  const [locationAnalysis, setLocationAnalysis] =
    useState<LocationAnalysis | null>(null);

  // Form data - matching the original exactly
  const [profession, setProfession] = useState<ProfessionKey>("fullstack");
  const [state, setState] = useState<StateKey>("sp");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("pleno");
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [savingsPercent, setSavingsPercent] = useState(20);
  const [extraPercent, setExtraPercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(15);
  const [workHours, setWorkHours] = useState(8);
  const [workDays, setWorkDays] = useState(5);
  const [vacationDays, setVacationDays] = useState(30);

  // Google Analytics
  const { trackEvent, isProduction } = useGoogleAnalytics();
  const gaId = import.meta.env.VITE_ANALYTICS_ID;
  const isDevelopment = import.meta.env.DEV;

  // Toast notifications
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Current configuration object for localStorage hook
  const currentConfig = {
    profession,
    state,
    experienceLevel,
    monthlyExpenses,
    savingsPercent,
    extraPercent,
    taxPercent,
    workHours,
    workDays,
    vacationDays,
  };

  const onLoadCallback = useCallback(
    (config: FreelazConfig) => {
      if (config.profession) setProfession(config.profession as ProfessionKey);
      if (config.state) setState(config.state as StateKey);
      if (config.experienceLevel)
        setExperienceLevel(config.experienceLevel as ExperienceLevel);
      if (config.monthlyExpenses) setMonthlyExpenses(config.monthlyExpenses);
      if (config.savingsPercent !== undefined)
        setSavingsPercent(config.savingsPercent);
      if (config.extraPercent !== undefined)
        setExtraPercent(config.extraPercent);
      if (config.taxPercent !== undefined) setTaxPercent(config.taxPercent);
      if (config.workHours) setWorkHours(config.workHours);
      if (config.workDays) setWorkDays(config.workDays);
      if (config.vacationDays) setVacationDays(config.vacationDays);

      trackEvent("configuration_loaded", {
        source: "localStorage",
        profession: config.profession,
        state: config.state,
        experience_level: config.experienceLevel,
      });
    },
    [trackEvent]
  );

  const onErrorCallback = useCallback(
    (error: Error) => {
      trackEvent("configuration_load_error", {
        error: error.message,
      });
    },
    [trackEvent]
  );

  // LocalStorage configuration management
  const { loadConfig, saveConfig, hasConfig } = useLocalStorageConfig(
    currentConfig,
    onLoadCallback,
    onErrorCallback
  );

  // Load saved configuration on app start - only once
  const hasLoadedConfig = useRef(false);
  useEffect(() => {
    if (!hasLoadedConfig.current) {
      loadConfig();
      hasLoadedConfig.current = true;
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    trackEvent("page_load", {
      initial_profession: profession,
      initial_state: state,
      initial_experience: experienceLevel,
      initial_expenses: monthlyExpenses,
      has_saved_config: hasConfig(),
    });
    // Fire once per mount; deliberately not reactive to input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL as string | undefined;

    const fromApi = async (): Promise<{
      rate: number;
      source: string;
    } | null> => {
      if (!apiBase) return null;
      try {
        const response = await fetch(`${apiBase}/api/exchange-rate`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as {
          rate: number;
          source: string;
        };
        if (!Number.isFinite(data.rate)) return null;
        if (data.source === "fallback") return null;
        return data;
      } catch {
        return null;
      }
    };

    const fromAwesomeApi = async (): Promise<{
      rate: number;
      source: string;
    } | null> => {
      try {
        const response = await fetch(
          "https://economia.awesomeapi.com.br/last/USD-BRL"
        );
        if (!response.ok) return null;
        const data = (await response.json()) as {
          USDBRL?: { bid?: string };
        };
        const rate = data.USDBRL?.bid ? parseFloat(data.USDBRL.bid) : NaN;
        if (!Number.isFinite(rate)) return null;
        return { rate, source: "awesomeapi-direct" };
      } catch {
        return null;
      }
    };

    const fetchExchangeRate = async () => {
      trackEvent("exchange_rate_fetch_start");
      const result = (await fromApi()) ?? (await fromAwesomeApi());
      if (result) {
        setExchangeRate(result.rate);
        setLastUpdated("Atualizado: agora");
        trackEvent("exchange_rate_fetch_success", {
          exchange_rate: result.rate,
          source: result.source,
        });
      } else {
        trackEvent("exchange_rate_fetch_error", { error: "all_sources_failed" });
      }
    };
    fetchExchangeRate();
  }, [trackEvent]);

  const result = calculate({
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
  });

  const {
    adjustedExpenses,
    savingsAmount,
    extraAmount,
    workingHoursPerMonth,
    baseRate,
    finalBaseRate,
    adjustedTaxPercent,
    rates,
    marketRange,
    position,
    potentialGains,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
  } = result;

  const handleLocationChange = useCallback(
    (location: LocationData | null) => {
      setClientLocation(location);
      if (location) {
        trackEvent("client_location_selected", {
          city: location.city,
          country: location.country,
          cost_of_living: location.costOfLiving,
          purchasing_power: location.purchasingPowerIndex,
        });
      }
    },
    [trackEvent]
  );

  const handleLocationAnalysis = useCallback(
    (analysis: LocationAnalysis | null) => {
      if (analysis) {
        const adjustment = calculateLocationAdjustment(
          baseRate,
          analysis.location,
          exchangeRate
        );
        setLocationAnalysis({ ...analysis, adjustment });
        trackEvent("location_analysis_completed", {
          city: analysis.location.city,
          country: analysis.location.country,
          rate_multiplier: adjustment.multiplier,
          adjusted_rate_usd: Math.round(adjustment.adjustedRate),
          competitive_position: adjustment.comparison.competitivePosition,
        });
      } else {
        setLocationAnalysis(null);
      }
    },
    [baseRate, exchangeRate, trackEvent]
  );

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-6">
      {/* Google Analytics */}
      <GoogleAnalytics measurementId={gaId} debug={isDevelopment} />

      {/* Development Analytics Status */}
      {isDevelopment && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
          📊 Analytics: {isProduction ? "Production" : "Development Mode"}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            🇧🇷 Calculadora de Preço para Freelancer Brasileiro
          </h1>
          <p className="text-sm md:text-lg text-gray-300 font-light mb-4 md:mb-6">
            Brazilian Freelancer Rate Calculator — Freelaz
          </p>
        </header>

        {/* Single Main Panel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            {/* Current Profile - Mobile Responsive */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <span className="text-gray-600 font-medium">
                    {professionData[profession]?.name.pt} •
                    {experienceLevel === "junior" && " Júnior"}
                    {experienceLevel === "pleno" && " Pleno"}
                    {experienceLevel === "senior" && " Sênior"}
                    {experienceLevel === "specialist" && " Especialista"} •{" "}
                    {stateData[state]?.name}
                  </span>
                  <div className="text-xs text-gray-500">
                    USD → BRL:{" "}
                    <span className="font-bold text-green-600">
                      {exchangeRate.toFixed(2)}
                    </span>
                    <span className="hidden sm:inline"> • </span>
                    <span className="text-gray-400 block sm:inline">
                      {lastUpdated}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowWizard(true);
                    trackEvent("open_configuration_modal", {
                      current_profession: profession,
                      current_state: state,
                      current_experience: experienceLevel,
                      current_hourly_rate: Math.round(baseRate),
                    });
                  }}
                  className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium w-full sm:w-auto"
                >
                  ⚙️ Configurar
                </button>
              </div>
            </div>

            {/* Primary Input - Cost of Living */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                💰 <span className="hidden sm:inline">Qual seu</span> Custo de
                vida<span className="sm:hidden">:</span>
                <span className="hidden sm:inline"> mensal?</span>
              </h2>
              <div className="flex w-full">
                <span className="bg-gray-100 border-2 border-r-0 border-gray-300 px-3 sm:px-4 py-3 sm:py-4 rounded-l-xl font-bold text-gray-700 text-base sm:text-lg flex-shrink-0">
                  R$
                </span>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setMonthlyExpenses(newValue);
                    trackEvent("change_monthly_expenses", {
                      old_value: monthlyExpenses,
                      new_value: newValue,
                      profession,
                      state,
                    });
                  }}
                  onFocus={(e) => {
                    trackEvent("focus_monthly_expenses_input");
                    // Use setTimeout to ensure selection happens after React's event handling
                    setTimeout(
                      () => (e.target as HTMLInputElement).select(),
                      0
                    );
                  }}
                  onClick={(e) => {
                    // Also select on click for better UX
                    setTimeout(
                      () => (e.target as HTMLInputElement).select(),
                      0
                    );
                  }}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-r-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base sm:text-lg font-semibold"
                  placeholder="2000"
                />
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Inclui moradia, alimentação, transporte, etc.
              </p>
            </div>

            {/* Quick Adjustments */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  ⚙️ Ajustes Rápidos
                </h3>
                <button
                  onClick={() => {
                    // Track reset before changing values
                    trackEvent("reset_quick_adjustments", {
                      old_savings: savingsPercent,
                      old_extra: extraPercent,
                      old_tax: taxPercent,
                    });
                    // Reset to default values
                    setSavingsPercent(20);
                    setExtraPercent(10);
                    setTaxPercent(15);
                  }}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                >
                  🔄 Resetar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reserva (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={savingsPercent}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        trackEvent("adjust_savings_percent", {
                          old_value: savingsPercent,
                          new_value: newValue,
                        });
                        setSavingsPercent(newValue);
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-semibold text-sm min-w-14 text-center">
                      {savingsPercent}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Extras (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={extraPercent}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        trackEvent("adjust_extra_percent", {
                          old_value: extraPercent,
                          new_value: newValue,
                        });
                        setExtraPercent(newValue);
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-semibold text-sm min-w-14 text-center">
                      {extraPercent}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Impostos (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={taxPercent}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        trackEvent("adjust_tax_percent", {
                          old_value: taxPercent,
                          new_value: newValue,
                        });
                        setTaxPercent(newValue);
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-semibold text-sm min-w-14 text-center">
                      {taxPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Location Intelligence */}
            <ClientLocationInput
              onLocationChange={handleLocationChange}
              onLocationAnalysis={handleLocationAnalysis}
              className="mb-6"
            />

            {/* Location-based rate adjustment display */}
            {locationAnalysis && potentialGains && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  🎯 Impacto da Localização do Cliente
                </h3>

                {/* Rate Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">
                      Taxa Base (Brasil):
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(baseRate)}/h
                    </div>
                    <div className="text-xs text-blue-600">
                      {formatCurrency(baseRate / exchangeRate, "USD")}/h
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">
                      Taxa Ajustada:
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(finalBaseRate)}/h
                    </div>
                    <div className="text-xs text-green-700 font-semibold">
                      {formatCurrency(finalBaseRate / exchangeRate, "USD")}/h
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">
                      Impostos Ajustados:
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {adjustedTaxPercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-purple-700">
                      {potentialGains.taxSavings > 0 && (
                        <>
                          -{potentialGains.taxSavings.toFixed(1)}% vs nacional
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Potential Gains/Losses */}
                <div className="bg-white p-4 rounded-lg border mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    {potentialGains.isGain
                      ? "📈 Ganho Potencial"
                      : "📉 Redução Potencial"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Diferença Mensal:
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          potentialGains.isGain
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {potentialGains.isGain ? "+" : ""}
                        {formatCurrency(potentialGains.monthlyDifference)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {potentialGains.percentageChange > 0 ? "+" : ""}
                        {potentialGains.percentageChange.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Diferença Anual:
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          potentialGains.isGain
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {potentialGains.isGain ? "+" : ""}
                        {formatCurrency(potentialGains.yearlyDifference)}
                      </div>
                      <div className="text-xs text-gray-500">
                        vs trabalhar apenas no Brasil
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning and Competitive Analysis */}
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-800 mb-2">
                    💡 {locationAnalysis.adjustment.reasoning}
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Vantagem competitiva:</strong>{" "}
                    {locationAnalysis.adjustment.comparison.yourAdvantage}% mais
                    barato que desenvolvedores locais (
                    {formatCurrency(
                      locationAnalysis.adjustment.comparison.localSeniorRate,
                      "USD"
                    )}
                    /h)
                  </div>
                  {clientLocation?.country !== "Brazil" && (
                    <div className="text-xs text-purple-600 mt-1">
                      <strong>Benefício fiscal:</strong> Exportação de serviços
                      pode reduzir impostos para {adjustedTaxPercent.toFixed(1)}
                      %
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Your Rates - Prominent */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  💰 <span className="hidden sm:inline">Suas</span> Taxas
                  <span className="sm:hidden">:</span>
                  <span className="hidden sm:inline"> Horárias</span>
                  {locationAnalysis && (
                    <span className="text-sm font-normal text-green-600 ml-2">
                      (Ajustadas para {clientLocation?.city})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowCalculationBreakdown(true);
                    trackEvent("open_calculation_breakdown", {
                      has_location_adjustment: !!locationAnalysis,
                      base_rate: Math.round(baseRate),
                      final_rate: Math.round(finalBaseRate),
                    });
                  }}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                >
                  📊 Ver Cálculo Detalhado
                </button>
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">
                    📊 Mercado: R$ {Math.round(marketRange.min * exchangeRate)}-
                    {Math.round(marketRange.max * exchangeRate)}/h •{" "}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {position}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    trackEvent("click_rate_card", {
                      rate_type: "regular",
                      rate_value: Math.round(rates.regular),
                    })
                  }
                >
                  <h4 className="text-xs sm:text-sm font-bold mb-2 text-green-700">
                    🟢 <span className="hidden sm:inline">Projeto</span> Normal
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.regular)}/h
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatCurrency(rates.regular / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    trackEvent("click_rate_card", {
                      rate_type: "revision",
                      rate_value: Math.round(rates.revision),
                    })
                  }
                >
                  <h4 className="text-xs sm:text-sm font-bold mb-2 text-yellow-700">
                    🟡 <span className="hidden sm:inline">Com</span> Revisões
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.revision)}/h
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatCurrency(rates.revision / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div
                  className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    trackEvent("click_rate_card", {
                      rate_type: "rush",
                      rate_value: Math.round(rates.rush),
                    })
                  }
                >
                  <h4 className="text-xs sm:text-sm font-bold mb-2 text-orange-700">
                    🟠 <span className="hidden sm:inline">Projeto</span> Urgente
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.rush)}/h
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatCurrency(rates.rush / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div
                  className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-400 rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    trackEvent("click_rate_card", {
                      rate_type: "difficult",
                      rate_value: Math.round(rates.difficult),
                    })
                  }
                >
                  <h4 className="text-xs sm:text-sm font-bold mb-2 text-red-700">
                    🔴 <span className="hidden sm:inline">Cliente</span> Difícil
                  </h4>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.difficult)}/h
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatCurrency(rates.difficult / exchangeRate, "USD")}/h
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Projections & Cost Breakdown - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Projections */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-800">
                  📈 <span className="hidden sm:inline">Projeção de</span>{" "}
                  Receita
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    {
                      label: "Por Dia",
                      brl: dailyRevenue,
                      usd: dailyRevenue / exchangeRate,
                    },
                    {
                      label: "Por Semana",
                      brl: weeklyRevenue,
                      usd: weeklyRevenue / exchangeRate,
                    },
                    {
                      label: "Por Mês",
                      brl: monthlyRevenue,
                      usd: monthlyRevenue / exchangeRate,
                    },
                    {
                      label: "Por Ano",
                      brl: yearlyRevenue,
                      usd: yearlyRevenue / exchangeRate,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {item.label}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-green-600 mb-1">
                        {formatCurrency(item.brl)}
                      </div>
                      <div className="text-xs font-semibold text-blue-600">
                        {formatCurrency(item.usd, "USD")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-800">
                  📋 <span className="hidden sm:inline">Breakdown de</span>{" "}
                  Custos
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                  {[
                    { label: "Custos Básicos:", value: adjustedExpenses },
                    { label: "Reserva de Emergência:", value: savingsAmount },
                    { label: "Gastos Extras:", value: extraAmount },
                    {
                      label: "Impostos:",
                      value:
                        finalBaseRate *
                        workingHoursPerMonth *
                        (adjustedTaxPercent / 100),
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 border-b border-gray-200 last:border-b-0 text-sm"
                    >
                      <span className="font-semibold text-gray-700">
                        {item.label}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-b-lg px-4 -mx-4 -mb-4 font-bold border border-purple-600">
                    <span>
                      Total Bruto{locationAnalysis ? " (Ajustado)" : ""}:
                    </span>
                    <span>
                      {formatCurrency(finalBaseRate * workingHoursPerMonth)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Actions - Mobile Optimized */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
              <button
                onClick={() => {
                  setShowCalculationBreakdown(true);
                  trackEvent("open_calculation_breakdown", {
                    current_hourly_rate: Math.round(finalBaseRate),
                    monthly_expenses: monthlyExpenses,
                    has_client_location: !!clientLocation,
                  });
                }}
                className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium"
              >
                🧮 <span className="sm:hidden">Cálculo</span>
                <span className="hidden sm:inline">Como Calculamos?</span>
              </button>
              <button
                onClick={() => {
                  setShowCalculationBreakdown(true);
                  trackEvent("open_calculation_breakdown", {
                    has_client_location: !!clientLocation,
                    current_hourly_rate: Math.round(finalBaseRate),
                    monthly_expenses: monthlyExpenses,
                  });
                }}
                className="text-xs sm:text-sm px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 rounded-lg hover:from-green-200 hover:to-emerald-200 transition-colors flex items-center gap-1 font-medium"
              >
                📋 <span className="sm:hidden">Detalhes</span>
                <span className="hidden sm:inline">Cálculo Detalhado</span>
              </button>
              <button
                onClick={() => {
                  setShowParameters(true);
                  trackEvent("open_parameters_modal", {
                    current_state: state,
                    current_profession: profession,
                  });
                }}
                className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium"
              >
                📊 <span className="sm:hidden">Dados</span>
                <span className="hidden sm:inline">Parâmetros</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button
                onClick={() => {
                  const success = saveConfig(currentConfig);

                  if (success) {
                    // Track save event
                    trackEvent("save_configuration", {
                      profession,
                      state,
                      experience_level: experienceLevel,
                      hourly_rate: Math.round(baseRate),
                    });

                    showSuccess("Configuração salva com sucesso!");
                  } else {
                    showError("Erro ao salvar configuração. Tente novamente.");
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-3 sm:px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
              >
                <span className="text-lg sm:text-base">💾</span>
                <span className="hidden sm:inline">Salvar</span>
                <span className="sm:hidden text-xs">Salvar</span>
              </button>
              <button
                onClick={() => {
                  const text = `🇧🇷 Minha taxa como freelancer: ${formatCurrency(
                    rates.regular
                  )}/hora (${formatCurrency(
                    rates.regular / exchangeRate,
                    "USD"
                  )}/hora)\n\nCalculado com Freelaz - freelaz.com`;

                  // Track share event
                  trackEvent("share_results", {
                    method: (navigator as any).share
                      ? "native_share"
                      : "clipboard",
                    hourly_rate_brl: Math.round(rates.regular),
                    hourly_rate_usd: Math.round(rates.regular / exchangeRate),
                  });

                  if ((navigator as any).share) {
                    (navigator as any).share({
                      title: "Minha Taxa de Freelancer",
                      text,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard
                      .writeText(text)
                      .then(() =>
                        showSuccess(
                          "Resultado copiado para a área de transferência!"
                        )
                      )
                      .catch(() =>
                        showError("Erro ao copiar para a área de transferência")
                      );
                  }
                }}
                className="bg-gray-600 text-white px-3 sm:px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
              >
                <span className="text-lg sm:text-base">🔗</span>
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden text-xs">Comp.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        <ConfigurationModal
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            trackEvent("close_configuration_modal", {
              time_spent_seconds: Math.round(performance.now() / 1000),
            });
          }}
          profession={profession}
          setProfession={(newProfession) => {
            setProfession(newProfession);
            trackEvent("change_profession", {
              old_profession: profession,
              new_profession: newProfession,
            });
          }}
          state={state}
          setState={(newState) => {
            setState(newState);
            trackEvent("change_state", {
              old_state: state,
              new_state: newState,
            });
          }}
          experienceLevel={experienceLevel}
          setExperienceLevel={(newLevel) => {
            setExperienceLevel(newLevel);
            trackEvent("change_experience_level", {
              old_level: experienceLevel,
              new_level: newLevel,
            });
          }}
          workHours={workHours}
          setWorkHours={(newHours) => {
            setWorkHours(newHours);
            trackEvent("change_work_hours", {
              old_hours: workHours,
              new_hours: newHours,
            });
          }}
          workDays={workDays}
          setWorkDays={(newDays) => {
            setWorkDays(newDays);
            trackEvent("change_work_days", {
              old_days: workDays,
              new_days: newDays,
            });
          }}
          vacationDays={vacationDays}
          setVacationDays={(newDays) => {
            setVacationDays(newDays);
            trackEvent("change_vacation_days", {
              old_days: vacationDays,
              new_days: newDays,
            });
          }}
        />

        {/* Calculation Explanation Modal */}

        {/* Parameters Info Modal */}
        <ParametersInfoModal
          isOpen={showParameters}
          onClose={() => {
            setShowParameters(false);
            trackEvent("close_parameters_modal");
          }}
          currentState={state}
        />

        <CalculationBreakdownModal
          isOpen={showCalculationBreakdown}
          onClose={() => {
            setShowCalculationBreakdown(false);
            trackEvent("close_calculation_breakdown");
          }}
          result={result}
          monthlyExpenses={monthlyExpenses}
          taxPercent={taxPercent}
          savingsPercent={savingsPercent}
          extraPercent={extraPercent}
          exchangeRate={exchangeRate}
          state={state}
          clientLocation={clientLocation}
          locationAnalysis={locationAnalysis}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
