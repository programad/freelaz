import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  formatCurrency,
  calculate,
  calculateLocationAdjustment,
  TAX_REGIMES,
  TAX_REGIME_KEYS,
  detectRegimeFromRate,
  getRegimeRate,
  PAYMENT_RAILS,
  getCityOffset,
  computeOverlap,
  SPECIALTIES,
  sumSpecialtyPremium,
  segmentPremium,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
  type TaxRegimeKey,
  type PaymentRailKey,
  type SpecialtyKey,
  type IndustryKey,
  type ClientTypeKey,
  type LocationData,
} from "@freelaz/shared";
import { CalculationBreakdownModal } from "./components/calculation-breakdown-modal";
import { ParametersInfoModal } from "./components/parameters-info-modal";
import { SubmissionModal } from "./components/submission-modal";
import {
  ClientLocationInput,
  type LocationAnalysis,
} from "./components/client-location-input";
import {
  GoogleAnalytics,
  useGoogleAnalytics,
} from "./components/google-analytics";
import { Footer } from "./components/footer";
import { EmailSignup } from "./components/email-signup";
import { InstallPrompt } from "./components/install-prompt";
import {
  useLocalStorageConfig,
  type FreelazConfig,
} from "./hooks/use-local-storage";
import { readUrlConfig, useUrlConfigSync } from "./hooks/use-url-config";
import { useToast } from "./hooks/use-toast";
import { ToastContainer } from "./components/toast-container";
import { StickyResult } from "./sections/sticky-result";
import { ProfilePhase } from "./sections/profile-phase";
import { NeedsPhase } from "./sections/needs-phase";
import { PricingPhase } from "./sections/pricing-phase";
import { AdvancedSection } from "./sections/advanced-section";
import { InsightsSection } from "./sections/insights-section";
import { ActionsBar } from "./sections/actions-bar";

function App() {
  const [showParameters, setShowParameters] = useState(false);
  const [showCalculationBreakdown, setShowCalculationBreakdown] =
    useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.57);

  // Client location state
  const [clientLocation, setClientLocation] = useState<LocationData | null>(
    null
  );
  const [locationAnalysis, setLocationAnalysis] =
    useState<LocationAnalysis | null>(null);

  const urlSeed = readUrlConfig();
  const [profession, setProfession] = useState<ProfessionKey>(
    (urlSeed.profession as ProfessionKey | undefined) ?? "fullstack"
  );
  const [state, setState] = useState<StateKey>(
    (urlSeed.state as StateKey | undefined) ?? "sp"
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    (urlSeed.exp as ExperienceLevel | undefined) ?? "pleno"
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    (urlSeed.expenses as number | undefined) ?? 2000
  );
  const [savingsPercent, setSavingsPercent] = useState(
    (urlSeed.savings as number | undefined) ?? 20
  );
  const [extraPercent, setExtraPercent] = useState(
    (urlSeed.extras as number | undefined) ?? 10
  );
  const [taxPercent, setTaxPercent] = useState(
    (urlSeed.tax as number | undefined) ?? TAX_REGIMES.simples.rate ?? 15
  );
  const [taxRegime, setTaxRegime] = useState<TaxRegimeKey>(
    (urlSeed.regime as TaxRegimeKey | undefined) ??
      (detectRegimeFromRate(
        (urlSeed.tax as number | undefined) ?? TAX_REGIMES.simples.rate ?? 15
      ) ??
        "simples")
  );
  const [paymentRail, setPaymentRail] = useState<PaymentRailKey>(
    (urlSeed.rail as PaymentRailKey | undefined) ?? "wise"
  );
  const [currencyBuffer, setCurrencyBuffer] = useState<number>(
    (urlSeed.buffer as number | undefined) ?? 0
  );
  const [specialties, setSpecialties] = useState<SpecialtyKey[]>(() => {
    const raw = urlSeed.specialties as string | undefined;
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => s.trim() as SpecialtyKey)
      .filter((s) => s in SPECIALTIES);
  });
  const [industry, setIndustry] = useState<IndustryKey>(
    (urlSeed.industry as IndustryKey | undefined) ?? "none"
  );
  const [clientType, setClientType] = useState<ClientTypeKey>(
    (urlSeed.clientType as ClientTypeKey | undefined) ?? "none"
  );
  const [workHours, setWorkHours] = useState(
    (urlSeed.hours as number | undefined) ?? 8
  );
  const [workDays, setWorkDays] = useState(
    (urlSeed.days as number | undefined) ?? 5
  );
  const [vacationDays, setVacationDays] = useState(
    (urlSeed.vacation as number | undefined) ?? 30
  );

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

  const hasLoadedConfig = useRef(false);
  useEffect(() => {
    if (hasLoadedConfig.current) return;
    hasLoadedConfig.current = true;
    // URL params already seeded the initial state; only fall back to
    // localStorage when there are no URL params at all.
    const hasUrlParams = Object.keys(readUrlConfig()).length > 0;
    if (!hasUrlParams) loadConfig();
  }, []);

  useUrlConfigSync({
    profession,
    state,
    exp: experienceLevel,
    expenses: monthlyExpenses,
    savings: savingsPercent,
    extras: extraPercent,
    tax: taxPercent,
    hours: workHours,
    days: workDays,
    vacation: vacationDays,
    regime: taxRegime,
    rail: paymentRail,
    buffer: currencyBuffer,
    specialties: specialties.join(","),
    industry,
    clientType,
  });

  const handleRegimeChange = useCallback(
    (regime: TaxRegimeKey) => {
      setTaxRegime(regime);
      // Store the domestic rate as the slider value — the calculator
      // applies the export discount based on regime + client.
      const domesticRate = TAX_REGIMES[regime].rate;
      if (domesticRate !== null) setTaxPercent(domesticRate);
      trackEvent("change_tax_regime", { regime, rate: domesticRate });
    },
    [trackEvent]
  );

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

  const paymentFeePercent = PAYMENT_RAILS[paymentRail].feePercent;
  const usdDisplayRate = exchangeRate * (1 - currencyBuffer / 100);
  const specialtyPremiumPercent = sumSpecialtyPremium(specialties);
  const segmentAdjustmentPercent = segmentPremium(industry, clientType);

  // International clients trigger export tax benefits (ISS+PIS+COFINS exempt
  // for Simples; PIS+COFINS exempt for Lucro Presumido). The effective tax
  // depends on the chosen regime, not a flat discount.
  const isExport = !!clientLocation && clientLocation.country !== "Brazil";
  const regimeRate = getRegimeRate(taxRegime, isExport);
  const effectiveTaxPercent = regimeRate ?? taxPercent;

  const result = calculate({
    profession,
    experienceLevel,
    state,
    monthlyExpenses,
    savingsPercent,
    extraPercent,
    taxPercent: effectiveTaxPercent,
    workHours,
    workDays,
    vacationDays,
    exchangeRate,
    clientLocation,
    paymentFeePercent,
    specialtyPremiumPercent,
    segmentAdjustmentPercent,
  });

  const {
    savingsAmount,
    extraAmount,
    baseRate,
    finalBaseRate,
    adjustedTaxPercent,
    rates,
    marketRange,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
  } = result;

  // Compare regimes at a fixed hourly rate (what the user is currently
  // charging) so the variation in net take-home is visible. Uses the
  // export rate if the client is international (since ISS+PIS+COFINS
  // are exempt) — Simples drops from ~12% to ~4.5%, Presumido to ~9%.
  const regimeComparison = useMemo(() => {
    return TAX_REGIME_KEYS.filter((key) => key !== "custom").map((key) => {
      const regime = TAX_REGIMES[key];
      const rateForClient = getRegimeRate(key, isExport) ?? taxPercent;
      const yearlyGross = result.yearlyRevenue;
      const yearlyNet = yearlyGross * (1 - rateForClient / 100);
      return {
        key,
        label: regime.label,
        rate: rateForClient,
        hourlyBRL: result.rates.regular,
        monthlyNet: yearlyNet / 12,
        yearlyNet,
      };
    });
  }, [result, taxPercent, isExport]);

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


  const monthlyNetFinal =
    monthlyRevenue * (1 - adjustedTaxPercent / 100);
  const yearlyNetFinal = yearlyRevenue * (1 - adjustedTaxPercent / 100);

  const handleSave = () => {
    const success = saveConfig(currentConfig);
    if (success) {
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
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const text = `🇧🇷 Minha taxa como freelancer: ${formatCurrency(
      rates.regular
    )}/hora (${formatCurrency(
      rates.regular / usdDisplayRate,
      "USD"
    )}/hora)\n\nCalcule a sua: ${shareUrl}`;
    trackEvent("share_results", {
      method: (navigator as any).share ? "native_share" : "clipboard",
      hourly_rate_brl: Math.round(rates.regular),
      hourly_rate_usd: Math.round(rates.regular / exchangeRate),
    });
    if ((navigator as any).share) {
      (navigator as any).share({
        title: "Minha Taxa de Freelancer",
        text,
        url: shareUrl,
      });
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() =>
          showSuccess("Link copiado! Quem abrir vê seus mesmos números.")
        )
        .catch(() =>
          showError("Erro ao copiar para a área de transferência")
        );
    }
  };

  const handlePrint = () => {
    trackEvent("click_pdf_export", {
      hourly_rate_brl: Math.round(rates.regular),
    });
    window.print();
  };

  const handleSubmit = () => {
    setShowSubmission(true);
    trackEvent("open_submission_modal");
  };

  const tzInfo = (() => {
    if (!clientLocation) return null;
    const offset = getCityOffset(clientLocation.country, clientLocation.region);
    if (offset === null) return null;
    return computeOverlap(offset);
  })();

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <GoogleAnalytics measurementId={gaId} debug={isDevelopment} />

      {isDevelopment && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-xs font-medium shadow-lg no-print z-40">
          📊 Analytics: {isProduction ? "Production" : "Development Mode"}
        </div>
      )}

      <StickyResult
        result={result}
        usdDisplayRate={usdDisplayRate}
        exchangeRate={exchangeRate}
        adjustedTaxPercent={adjustedTaxPercent}
        clientCity={clientLocation?.namePortuguese || clientLocation?.city}
        onOpenBreakdown={() => {
          setShowCalculationBreakdown(true);
          trackEvent("open_calculation_breakdown", {
            current_hourly_rate: Math.round(finalBaseRate),
            has_client_location: !!clientLocation,
          });
        }}
      />

      <header className="text-center pt-8 pb-4 px-4 no-print">
        <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          🇧🇷 Calculadora de Preço para Freelancer Brasileiro
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Custo de vida → metas → como cobrar.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pb-12 space-y-5">
        <ProfilePhase
          profession={profession}
          setProfession={setProfession}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          state={state}
          setState={setState}
          workHours={workHours}
          setWorkHours={setWorkHours}
          workDays={workDays}
          setWorkDays={setWorkDays}
          vacationDays={vacationDays}
          setVacationDays={setVacationDays}
          marketRange={marketRange}
          exchangeRate={exchangeRate}
        />

        <NeedsPhase
          monthlyExpenses={monthlyExpenses}
          setMonthlyExpenses={setMonthlyExpenses}
          savingsPercent={savingsPercent}
          setSavingsPercent={setSavingsPercent}
          extraPercent={extraPercent}
          setExtraPercent={setExtraPercent}
          savingsAmount={savingsAmount}
          extraAmount={extraAmount}
          netMonthlyNeeds={result.netMonthlyNeeds}
        />

        <PricingPhase
          taxRegime={taxRegime}
          onRegimeChange={handleRegimeChange}
          taxPercent={taxPercent}
          setTaxPercent={setTaxPercent}
          regimeComparison={regimeComparison}
          isExport={isExport}
          paymentRail={paymentRail}
          setPaymentRail={(r) => {
            setPaymentRail(r);
            trackEvent("change_payment_rail", {
              rail: r,
              fee: PAYMENT_RAILS[r].feePercent,
            });
          }}
          paymentFeePercent={paymentFeePercent}
          hourlyBRL={rates.regular}
          monthlyNet={monthlyNetFinal}
          yearlyNet={yearlyNetFinal}
          clientLocationSlot={
            <>
              <ClientLocationInput
                onLocationChange={handleLocationChange}
                onLocationAnalysis={handleLocationAnalysis}
              />
              {tzInfo && (
                <div className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                  {tzInfo.hours > 0 ? (
                    <>
                      <strong>Fuso:</strong> {tzInfo.hours}h de overlap (BRT{" "}
                      {Math.round(tzInfo.spStart)}h–
                      {Math.round(tzInfo.spEnd)}h ↔ local{" "}
                      {Math.round(tzInfo.clientStart)}h–
                      {Math.round(tzInfo.clientEnd)}h).
                    </>
                  ) : (
                    <>
                      <strong>Fuso:</strong> sem overlap natural — combine
                      janelas assíncronas.
                    </>
                  )}
                </div>
              )}
            </>
          }
          advancedSlot={
            <AdvancedSection
              specialties={specialties}
              setSpecialties={setSpecialties}
              specialtyPremiumPercent={specialtyPremiumPercent}
              industry={industry}
              setIndustry={setIndustry}
              clientType={clientType}
              setClientType={setClientType}
              segmentAdjustmentPercent={segmentAdjustmentPercent}
              currencyBuffer={currencyBuffer}
              setCurrencyBuffer={setCurrencyBuffer}
              exchangeRate={exchangeRate}
              usdDisplayRate={usdDisplayRate}
            />
          }
        />

        <InsightsSection
          rates={rates}
          usdDisplayRate={usdDisplayRate}
          dailyRevenue={dailyRevenue}
          weeklyRevenue={weeklyRevenue}
          monthlyRevenue={monthlyRevenue}
          yearlyRevenue={yearlyRevenue}
          adjustedTaxPercent={adjustedTaxPercent}
        />

        <ActionsBar
          onSave={handleSave}
          onShare={handleShare}
          onPrint={handlePrint}
          onSubmit={handleSubmit}
        />

        <div className="flex justify-center gap-2 text-xs text-gray-500 no-print">
          <button
            onClick={() => setShowParameters(true)}
            className="hover:text-gray-700 underline"
          >
            Parâmetros e fontes
          </button>
          <span>·</span>
          <button
            onClick={() => setShowCalculationBreakdown(true)}
            className="hover:text-gray-700 underline"
          >
            Cálculo detalhado
          </button>
          <span>·</span>
          <a href="/relatos" className="hover:text-gray-700 underline">
            Relatos da comunidade
          </a>
        </div>

        <EmailSignup
          source="calculator-footer"
          onSuccess={(already) =>
            showSuccess(
              already
                ? "Você já está cadastrado — obrigado!"
                : "Cadastrado! Aguarde o próximo relatório mensal."
            )
          }
          onError={(msg) => showError(msg)}
        />
      </main>

      <Footer />

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
        taxPercent={taxPercent}
        savingsPercent={savingsPercent}
        extraPercent={extraPercent}
        exchangeRate={exchangeRate}
        state={state}
        clientLocation={clientLocation}
        locationAnalysis={locationAnalysis}
      />

      <SubmissionModal
        isOpen={showSubmission}
        onClose={() => setShowSubmission(false)}
        defaults={{
          profession,
          experienceLevel,
          state,
          hourlyRateBRL: rates.regular,
          hourlyRateUSD: rates.regular / exchangeRate,
          taxRegime,
          clientCountry: clientLocation?.country,
        }}
        onSuccess={() => {
          showSuccess("Obrigado! Sua taxa foi adicionada anonimamente.");
          trackEvent("submit_rate_success");
        }}
        onError={(msg) => {
          showError(msg);
          trackEvent("submit_rate_error", { message: msg });
        }}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <InstallPrompt />
    </div>
  );
}

export default App;
