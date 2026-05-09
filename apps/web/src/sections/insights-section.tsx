import { formatCurrency, type CalculatorRates } from "@freelaz/shared";

interface InsightsSectionProps {
  rates: CalculatorRates;
  usdDisplayRate: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  adjustedTaxPercent: number;
}

export function InsightsSection({
  rates,
  usdDisplayRate,
  dailyRevenue,
  weeklyRevenue,
  monthlyRevenue,
  yearlyRevenue,
  adjustedTaxPercent,
}: InsightsSectionProps) {
  const projection = [
    { label: "Por dia", brl: dailyRevenue },
    { label: "Por semana", brl: weeklyRevenue },
    { label: "Por mês", brl: monthlyRevenue },
    { label: "Por ano", brl: yearlyRevenue },
  ];

  const variants = [
    { key: "regular", label: "Normal", emoji: "🟢", value: rates.regular },
    { key: "revision", label: "Com revisões", emoji: "🟡", value: rates.revision },
    { key: "rush", label: "Urgente", emoji: "🟠", value: rates.rush },
    { key: "difficult", label: "Cliente difícil", emoji: "🔴", value: rates.difficult },
  ];

  const baseline = yearlyRevenue * (1 - adjustedTaxPercent / 100);

  return (
    <details className="bg-white rounded-2xl border border-gray-200 group">
      <summary className="cursor-pointer p-5 flex items-center justify-between list-none">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-semibold text-gray-800">
            📈 Detalhes: variantes, projeção, simulador
          </span>
        </div>
      </summary>

      <div className="border-t border-gray-200 p-5 space-y-6">
        {/* Rate variants */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Variantes de taxa
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {variants.map((v) => (
              <div
                key={v.key}
                className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-3 text-center"
              >
                <div className="text-xs font-bold text-gray-700 mb-1">
                  {v.emoji} {v.label}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(v.value)}/h
                </div>
                <div className="text-xs text-blue-600">
                  {formatCurrency(v.value / usdDisplayRate, "USD")}/h
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue projection */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            Projeção de receita (bruta)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {projection.map((p) => (
              <div
                key={p.label}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="text-xs text-gray-600">{p.label}</div>
                <div className="text-base font-bold text-gray-900">
                  {formatCurrency(p.brl)}
                </div>
                <div className="text-xs text-blue-600">
                  {formatCurrency(p.brl / usdDisplayRate, "USD")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raise simulator */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            💭 E se você cobrasse mais?
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[0, 10, 20, 30].map((bump) => {
              const yNet =
                yearlyRevenue *
                (1 + bump / 100) *
                (1 - adjustedTaxPercent / 100);
              const mNet = yNet / 12;
              const mDelta = (yNet - baseline) / 12;
              const isCurrent = bump === 0;
              return (
                <div
                  key={bump}
                  className={`p-3 rounded-lg ${
                    isCurrent
                      ? "bg-amber-50 border border-amber-300"
                      : "bg-amber-50/50 border border-amber-200"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-600">
                    {isCurrent ? "Hoje" : `+${bump}%`}
                  </div>
                  <div className="text-base font-bold text-gray-800">
                    {formatCurrency(mNet)}
                  </div>
                  <div className="text-xs text-gray-500">por mês</div>
                  {!isCurrent && (
                    <div className="text-xs text-green-700 font-semibold mt-1">
                      +{formatCurrency(mDelta)}/mês
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Líquido após {adjustedTaxPercent.toFixed(1)}% de impostos. Mesma
            carga de trabalho.
          </p>
        </div>
      </div>
    </details>
  );
}
