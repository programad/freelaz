import { useState, useEffect } from "react";
import {
  professionData,
  stateData,
  formatCurrency,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
} from "@freelaz/shared";
import { ConfigurationModal } from "./components/configuration-modal";
import { CalculationModal } from "./components/calculation-modal";
import { ParametersInfoModal } from "./components/parameters-info-modal";
import {
  GoogleAnalytics,
  useGoogleAnalytics,
} from "./components/google-analytics";

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.57);
  const [lastUpdated, setLastUpdated] = useState("Taxa padrão");

  // Google Analytics
  const { trackEvent } = useGoogleAnalytics();
  const gaId = import.meta.env.VITE_ANALYTICS_ID;
  const isDevelopment = import.meta.env.DEV;

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

  // Load exchange rate (matching original)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://economia.awesomeapi.com.br/last/USD-BRL"
        );
        const data = await response.json();
        if (data.USDBRL) {
          setExchangeRate(parseFloat(data.USDBRL.bid));
          setLastUpdated("Atualizado: agora");
        }
      } catch (error) {
        console.log("Failed to load exchange rate");
      }
    };
    fetchExchangeRate();
  }, []);

  // Calculations (matching original exactly)
  const costOfLivingIndex = stateData[state]?.costIndex || 100;
  const adjustedExpenses = monthlyExpenses * (costOfLivingIndex / 100);
  const savingsAmount = adjustedExpenses * (savingsPercent / 100);
  const extraAmount = adjustedExpenses * (extraPercent / 100);
  const netMonthlyNeeds = adjustedExpenses + savingsAmount + extraAmount;
  const grossMonthlyNeeds = netMonthlyNeeds / (1 - taxPercent / 100);
  const workingDaysPerYear = 52 * workDays - vacationDays;
  const workingHoursPerYear = workingDaysPerYear * workHours;
  const workingHoursPerMonth = workingHoursPerYear / 12;
  const baseRate = grossMonthlyNeeds / workingHoursPerMonth;

  const rates = {
    regular: baseRate * 1.0,
    revision: baseRate * 1.25,
    rush: baseRate * 1.5,
    difficult: baseRate * 2.0,
  };

  // Revenue projections
  const dailyRevenue = baseRate * workHours;
  const weeklyRevenue = dailyRevenue * workDays;
  const monthlyRevenue = weeklyRevenue * 4.33;
  const yearlyRevenue = monthlyRevenue * 12;

  // Market comparison
  const marketRange = professionData[profession]?.marketAverage;
  const adjustedMin = Math.round(
    (marketRange?.min || 50) * (costOfLivingIndex / 100)
  );
  const adjustedMax = Math.round(
    (marketRange?.max || 80) * (costOfLivingIndex / 100)
  );
  const avgRate = (adjustedMin + adjustedMax) / 2;
  let position = "Competitivo";
  if (baseRate < adjustedMin * 0.8) {
    position = "Abaixo do mercado";
  } else if (baseRate > adjustedMax * 1.2) {
    position = "Acima do mercado";
  } else if (baseRate > avgRate) {
    position = "Acima da média";
  }

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-6">
      {/* Google Analytics */}
      <GoogleAnalytics measurementId={gaId} debug={isDevelopment} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            🇧🇷{" "}
            <span className="hidden sm:inline">Calculadora de Preços para</span>{" "}
            Freelaz<span className="hidden sm:inline"> Brasileiros</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-300 font-light mb-4 md:mb-6">
            <span className="sm:hidden">Calculadora de Preços</span>
            <span className="hidden sm:inline">
              Brazilian Freelancer Rate Calculator
            </span>
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
                    {professionData[profession]?.name.pt} •{" "}
                    {stateData[state]?.name} •
                    {experienceLevel === "junior" && " Júnior"}
                    {experienceLevel === "pleno" && " Pleno"}
                    {experienceLevel === "senior" && " Sênior"}
                    {experienceLevel === "specialist" && " Especialista"}
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
                  onClick={() => setShowWizard(true)}
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
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  onFocus={(e) => {
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
                      onChange={(e) =>
                        setSavingsPercent(Number(e.target.value))
                      }
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
                      onChange={(e) => setExtraPercent(Number(e.target.value))}
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
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-semibold text-sm min-w-14 text-center">
                      {taxPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rates - Prominent */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  💰 <span className="hidden sm:inline">Suas</span> Taxas
                  <span className="sm:hidden">:</span>
                  <span className="hidden sm:inline"> Horárias</span>
                </h3>
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">
                    📊 Mercado: R$ {adjustedMin}-{adjustedMax}/h •{" "}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {position}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4 text-center">
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
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-4 text-center">
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
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-4 text-center">
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
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-400 rounded-xl p-4 text-center">
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
                        netMonthlyNeeds * (taxPercent / (100 - taxPercent)),
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
                    <span>Total Bruto:</span>
                    <span>{formatCurrency(grossMonthlyNeeds)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Actions - Mobile Optimized */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
              <button
                onClick={() => setShowCalculation(true)}
                className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium"
              >
                🧮 <span className="hidden sm:inline">Como </span>Calc
                <span className="hidden sm:inline">ulamos</span>?
              </button>
              <button
                onClick={() => setShowParameters(true)}
                className="text-xs sm:text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium"
              >
                📊 Param<span className="hidden sm:inline">etros</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <button
                onClick={() => {
                  const config = {
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
                  localStorage.setItem("freelazConfig", JSON.stringify(config));

                  // Track save event
                  trackEvent("save_configuration", {
                    profession,
                    state,
                    experience_level: experienceLevel,
                    hourly_rate: Math.round(baseRate),
                  });

                  alert("Configuração salva com sucesso!");
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
                        alert("Resultado copiado para a área de transferência!")
                      );
                  }
                }}
                className="bg-gray-600 text-white px-3 sm:px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
              >
                <span className="text-lg sm:text-base">🔗</span>
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden text-xs">Comp.</span>
              </button>
              <button
                onClick={() =>
                  alert("Funcionalidade de PDF em desenvolvimento")
                }
                className="bg-green-600 text-white px-3 sm:px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
              >
                <span className="text-lg sm:text-base">📄</span>
                <span className="text-xs sm:text-base">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        <ConfigurationModal
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          profession={profession}
          setProfession={setProfession}
          state={state}
          setState={setState}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          workHours={workHours}
          setWorkHours={setWorkHours}
          workDays={workDays}
          setWorkDays={setWorkDays}
          vacationDays={vacationDays}
          setVacationDays={setVacationDays}
        />

        {/* Calculation Explanation Modal */}
        <CalculationModal
          isOpen={showCalculation}
          onClose={() => setShowCalculation(false)}
          monthlyExpenses={monthlyExpenses}
          costOfLivingIndex={costOfLivingIndex}
          adjustedExpenses={adjustedExpenses}
          savingsPercent={savingsPercent}
          savingsAmount={savingsAmount}
          extraPercent={extraPercent}
          extraAmount={extraAmount}
          netMonthlyNeeds={netMonthlyNeeds}
          taxPercent={taxPercent}
          grossMonthlyNeeds={grossMonthlyNeeds}
          workingDaysPerYear={workingDaysPerYear}
          workingHoursPerYear={workingHoursPerYear}
          workingHoursPerMonth={workingHoursPerMonth}
          baseRate={baseRate}
          rates={rates}
        />

        {/* Parameters Info Modal */}
        <ParametersInfoModal
          isOpen={showParameters}
          onClose={() => setShowParameters(false)}
          currentState={state}
        />
      </div>
    </div>
  );
}

export default App;
