import { formatCurrency, type CalculatorResult } from "@freelaz/shared";

interface StickyResultProps {
  result: CalculatorResult;
  usdDisplayRate: number;
  exchangeRate: number;
  adjustedTaxPercent: number;
  clientCity?: string;
  onOpenBreakdown: () => void;
}

export function StickyResult({
  result,
  usdDisplayRate,
  exchangeRate,
  adjustedTaxPercent,
  clientCity,
  onOpenBreakdown,
}: StickyResultProps) {
  const monthlyNet = result.monthlyRevenue * (1 - adjustedTaxPercent / 100);
  const yearlyNet = result.yearlyRevenue * (1 - adjustedTaxPercent / 100);

  return (
    <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-800 no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Sua taxa
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {formatCurrency(result.rates.regular)}
                <span className="text-sm text-gray-400">/h</span>
              </div>
              <div className="text-xs text-blue-300">
                {formatCurrency(result.rates.regular / usdDisplayRate, "USD")}/h
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-700" />
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Líquido / mês
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(monthlyNet)}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(yearlyNet)}/ano
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {clientCity && (
              <div className="hidden md:block text-xs text-gray-400">
                <span className="text-green-400">●</span> Ajustado para{" "}
                {clientCity}
              </div>
            )}
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                USD/BRL
              </div>
              <div className="text-sm font-mono text-gray-200">
                {exchangeRate.toFixed(2)}
              </div>
            </div>
            <button
              onClick={onOpenBreakdown}
              className="px-3 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              📊 Como?
            </button>
          </div>
        </div>
        <div className="sm:hidden mt-2 flex items-baseline justify-between text-xs">
          <span className="text-gray-400">Líquido/mês:</span>
          <span className="font-bold text-green-400">
            {formatCurrency(monthlyNet)}
          </span>
        </div>
      </div>
    </div>
  );
}
