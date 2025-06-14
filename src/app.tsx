import { useState, useEffect } from "react";

// Simple data structures matching the original
const professionData = {
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

const stateData = {
  sp: { name: "São Paulo", costIndex: 100 },
  rj: { name: "Rio de Janeiro", costIndex: 95 },
  df: { name: "Distrito Federal", costIndex: 90 },
  mg: { name: "Minas Gerais", costIndex: 75 },
  rs: { name: "Rio Grande do Sul", costIndex: 80 },
  pr: { name: "Paraná", costIndex: 80 },
  sc: { name: "Santa Catarina", costIndex: 85 },
  ba: { name: "Bahia", costIndex: 70 },
  pe: { name: "Pernambuco", costIndex: 65 },
  ce: { name: "Ceará", costIndex: 60 },
  go: { name: "Goiás", costIndex: 65 },
  es: { name: "Espírito Santo", costIndex: 75 },
  mt: { name: "Mato Grosso", costIndex: 70 },
  ms: { name: "Mato Grosso do Sul", costIndex: 70 },
  pa: { name: "Pará", costIndex: 55 },
  am: { name: "Amazonas", costIndex: 60 },
  ma: { name: "Maranhão", costIndex: 50 },
  pi: { name: "Piauí", costIndex: 45 },
  al: { name: "Alagoas", costIndex: 50 },
  se: { name: "Sergipe", costIndex: 55 },
  pb: { name: "Paraíba", costIndex: 50 },
  rn: { name: "Rio Grande do Norte", costIndex: 55 },
  ac: { name: "Acre", costIndex: 60 },
  ro: { name: "Rondônia", costIndex: 60 },
  rr: { name: "Roraima", costIndex: 65 },
  ap: { name: "Amapá", costIndex: 65 },
  to: { name: "Tocantins", costIndex: 55 },
};

// Helper function to normalize text for search (remove accents)
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.57);
  const [lastUpdated, setLastUpdated] = useState("Taxa padrão");

  // Form data - matching the original exactly
  const [profession, setProfession] = useState("fullstack");
  const [state, setState] = useState("sp");
  const [experienceLevel, setExperienceLevel] = useState("pleno");
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [savingsPercent, setSavingsPercent] = useState(20);
  const [extraPercent, setExtraPercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(15);
  const [workHours, setWorkHours] = useState(8);
  const [workDays, setWorkDays] = useState(5);
  const [vacationDays, setVacationDays] = useState(30);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownOpen) {
        setStateDropdownOpen(false);
        setStateSearch("");
      }
    };

    if (stateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [stateDropdownOpen]);

  // Calculations (matching original exactly)
  const costOfLivingIndex = (stateData as any)[state]?.costIndex || 100;
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

  const formatCurrency = (amount: number, currency = "BRL") => {
    const locale = currency === "BRL" ? "pt-BR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Revenue projections
  const dailyRevenue = baseRate * workHours;
  const weeklyRevenue = dailyRevenue * workDays;
  const monthlyRevenue = weeklyRevenue * 4.33;
  const yearlyRevenue = monthlyRevenue * 12;

  // Market comparison
  const marketRange = (professionData as any)[profession]?.marketAverage;
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            🇧🇷 Calculadora de Preços para Freelancers
          </h1>
          <p className="text-lg text-gray-300 font-light mb-6">
            Brazilian Freelancer Rate Calculator
          </p>
        </header>

        {/* Single Main Panel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {/* Current Profile - Compact */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    {(professionData as any)[profession]?.name.pt} •{" "}
                    {(stateData as any)[state]?.name} •
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
                  </div>
                </div>
                <button
                  onClick={() => setShowWizard(true)}
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ⚙️ Configurar
                </button>
              </div>
            </div>

            {/* Primary Input - Cost of Living */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                💰 Qual seu custo de vida mensal?
              </h2>
              <div className="flex">
                <span className="bg-gray-100 border-2 border-r-0 border-gray-300 px-4 py-4 rounded-l-xl font-bold text-gray-700 text-lg">
                  R$
                </span>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-r-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                  placeholder="2000"
                />
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Inclui moradia, alimentação, transporte, etc.
              </p>
            </div>

            {/* Quick Adjustments */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reserva (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={savingsPercent}
                    onChange={(e) => setSavingsPercent(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-semibold text-sm min-w-12 text-center">
                    {savingsPercent}%
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Extras (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={extraPercent}
                    onChange={(e) => setExtraPercent(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-semibold text-sm min-w-12 text-center">
                    {extraPercent}%
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Impostos (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded font-semibold text-sm min-w-12 text-center">
                    {taxPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Your Rates - Prominent */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  💰 Suas Taxas Horárias
                </h3>
                <div className="text-sm text-gray-600">
                  📊 Mercado: R$ {adjustedMin}-{adjustedMax}/h •{" "}
                  <span className="font-semibold text-blue-600">
                    {position}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4 text-center">
                  <h4 className="text-sm font-bold mb-2 text-green-700">
                    🟢 Projeto Normal
                  </h4>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.regular)}/h
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(rates.regular / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-4 text-center">
                  <h4 className="text-sm font-bold mb-2 text-yellow-700">
                    🟡 Com Revisões
                  </h4>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.revision)}/h
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(rates.revision / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-4 text-center">
                  <h4 className="text-sm font-bold mb-2 text-orange-700">
                    🟠 Projeto Urgente
                  </h4>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.rush)}/h
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(rates.rush / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-400 rounded-xl p-4 text-center">
                  <h4 className="text-sm font-bold mb-2 text-red-700">
                    🔴 Cliente Difícil
                  </h4>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {formatCurrency(rates.difficult)}/h
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(rates.difficult / exchangeRate, "USD")}/h
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Projections & Cost Breakdown - Side by Side */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Projections */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  📈 Projeção de Receita
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
                      <div className="text-lg font-bold text-green-600 mb-1">
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
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  📋 Breakdown de Custos
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

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCalculation(true)}
                className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                🧮 Como calculamos?
              </button>
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
                  localStorage.setItem(
                    "brazilianRateCalculatorConfig",
                    JSON.stringify(config)
                  );
                  alert("Configuração salva com sucesso!");
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                💾 Salvar Configuração
              </button>
              <button
                onClick={() => {
                  const text = `🇧🇷 Minha taxa como freelancer: ${formatCurrency(
                    rates.regular
                  )}/hora (${formatCurrency(
                    rates.regular / exchangeRate,
                    "USD"
                  )}/hora)\n\nCalculado com a Calculadora de Preços para Freelancers Brasileiros`;
                  if (navigator.share) {
                    navigator.share({
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
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                🔗 Compartilhar Resultado
              </button>
              <button
                onClick={() =>
                  alert("Funcionalidade de PDF em desenvolvimento")
                }
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        {showWizard && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowWizard(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  ⚙️ Configurações Avançadas
                </h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="space-y-4">
                  {/* Profession - Full Width */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Profissão:
                    </label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base leading-6 min-h-[3.5rem]"
                    >
                      {Object.entries(professionData).map(([key, prof]) => (
                        <option key={key} value={key}>
                          {prof.name.pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State and Experience - Two Columns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Estado:
                      </label>
                      <div className="relative">
                        <div
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all cursor-pointer bg-white flex items-center justify-between text-base leading-6 min-h-[3.5rem]"
                          onClick={() =>
                            setStateDropdownOpen(!stateDropdownOpen)
                          }
                        >
                          <span>
                            {(stateData as any)[state]?.name ||
                              "Selecione um estado"}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              stateDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {stateDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg">
                            <div className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                placeholder="🔍 Buscar estado..."
                                value={stateSearch}
                                onChange={(e) => setStateSearch(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {Object.entries(stateData)
                                .filter(
                                  ([key, s]) =>
                                    normalizeText(s.name).includes(
                                      normalizeText(stateSearch)
                                    ) ||
                                    normalizeText(key).includes(
                                      normalizeText(stateSearch)
                                    )
                                )
                                .sort(([_, a], [__, b]) =>
                                  a.name.localeCompare(b.name)
                                )
                                .map(([key, s]) => (
                                  <div
                                    key={key}
                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                      setState(key);
                                      setStateDropdownOpen(false);
                                      setStateSearch("");
                                    }}
                                  >
                                    {s.name}
                                  </div>
                                ))}
                              {Object.entries(stateData).filter(
                                ([key, s]) =>
                                  normalizeText(s.name).includes(
                                    normalizeText(stateSearch)
                                  ) ||
                                  normalizeText(key).includes(
                                    normalizeText(stateSearch)
                                  )
                              ).length === 0 && (
                                <div className="p-3 text-gray-500 text-center">
                                  Nenhum estado encontrado
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Experiência:
                      </label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base leading-6 min-h-[3.5rem]"
                      >
                        <option value="junior">Júnior (0-2 anos)</option>
                        <option value="pleno">Pleno (2-5 anos)</option>
                        <option value="senior">Sênior (5+ anos)</option>
                        <option value="specialist">
                          Especialista (8+ anos)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Work Configuration */}
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    ⏰ Configuração de Trabalho
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Horas por Dia: {workHours}h
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="12"
                        value={workHours}
                        onChange={(e) => setWorkHours(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Dias por Semana: {workDays}
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="7"
                        value={workDays}
                        onChange={(e) => setWorkDays(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Férias por Ano: {vacationDays} dias
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={vacationDays}
                        onChange={(e) =>
                          setVacationDays(Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowWizard(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    ✅ Aplicar e Fechar
                  </button>
                  <button
                    onClick={() => setShowWizard(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Explanation Modal */}
        {showCalculation && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCalculation(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold">
                  🧮 Como Calculamos Sua Taxa
                </h2>
                <button
                  onClick={() => setShowCalculation(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-2">
                      1. Ajuste Regional
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Seus gastos são ajustados pelo custo de vida do seu
                      estado:
                    </p>
                    <div className="bg-white rounded p-3 text-sm">
                      <strong>R$ {monthlyExpenses.toLocaleString()}</strong> ×{" "}
                      {costOfLivingIndex}% ={" "}
                      <strong>{formatCurrency(adjustedExpenses)}</strong>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-bold text-green-800 mb-2">
                      2. Custos Adicionais
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Adicionamos reserva de emergência e gastos extras:
                    </p>
                    <div className="bg-white rounded p-3 text-sm space-y-1">
                      <div>
                        Custos básicos:{" "}
                        <strong>{formatCurrency(adjustedExpenses)}</strong>
                      </div>
                      <div>
                        Reserva ({savingsPercent}%):{" "}
                        <strong>{formatCurrency(savingsAmount)}</strong>
                      </div>
                      <div>
                        Extras ({extraPercent}%):{" "}
                        <strong>{formatCurrency(extraAmount)}</strong>
                      </div>
                      <div className="border-t pt-1 font-bold">
                        Total líquido:{" "}
                        <strong>{formatCurrency(netMonthlyNeeds)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-2">
                      3. Impostos
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Calculamos o valor bruto necessário considerando{" "}
                      {taxPercent}% de impostos:
                    </p>
                    <div className="bg-white rounded p-3 text-sm">
                      <strong>{formatCurrency(netMonthlyNeeds)}</strong> ÷ (1 -{" "}
                      {taxPercent}%) ={" "}
                      <strong>{formatCurrency(grossMonthlyNeeds)}</strong>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-2">
                      4. Horas Trabalhadas
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Calculamos suas horas mensais baseado na sua configuração:
                    </p>
                    <div className="bg-white rounded p-3 text-sm space-y-1">
                      <div>Dias úteis por ano: {workingDaysPerYear} dias</div>
                      <div>
                        Horas por ano: {workingHoursPerYear.toLocaleString()}{" "}
                        horas
                      </div>
                      <div className="font-bold">
                        Horas por mês: {Math.round(workingHoursPerMonth)} horas
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">
                      5. Taxa Base
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Dividimos o valor bruto mensal pelas horas trabalhadas:
                    </p>
                    <div className="bg-white rounded p-3 text-sm">
                      <strong>{formatCurrency(grossMonthlyNeeds)}</strong> ÷{" "}
                      {Math.round(workingHoursPerMonth)} horas ={" "}
                      <strong>{formatCurrency(baseRate)}/hora</strong>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h3 className="font-bold text-yellow-800 mb-2">
                      6. Multiplicadores
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Aplicamos multiplicadores para diferentes tipos de
                      projeto:
                    </p>
                    <div className="bg-white rounded p-3 text-sm space-y-1">
                      <div>
                        🟢 Normal (1.0x):{" "}
                        <strong>{formatCurrency(rates.regular)}/h</strong>
                      </div>
                      <div>
                        🟡 Com Revisões (1.25x):{" "}
                        <strong>{formatCurrency(rates.revision)}/h</strong>
                      </div>
                      <div>
                        🟠 Urgente (1.5x):{" "}
                        <strong>{formatCurrency(rates.rush)}/h</strong>
                      </div>
                      <div>
                        🔴 Cliente Difícil (2.0x):{" "}
                        <strong>{formatCurrency(rates.difficult)}/h</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCalculation(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  ✅ Entendi!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
