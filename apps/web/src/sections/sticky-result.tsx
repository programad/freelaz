import { formatCurrency, type CalculatorResult } from "@freelaz/shared";

interface StickyResultProps {
  result: CalculatorResult;
  usdDisplayRate: number;
  exchangeRate: number;
  adjustedTaxPercent: number;
  clientCity?: string;
  onOpenBreakdown: () => void;
}

const FLOOR_LABEL = {
  cost: "pelos seus custos",
  market: "pelo mercado para seu nível",
  location: "pelo cliente internacional",
} as const;

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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Hourly rate (always visible) */}
          <div className="flex items-baseline gap-1">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5">
                Sua taxa · definida {FLOOR_LABEL[result.floorReason]}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white leading-none">
                {formatCurrency(result.rates.regular)}
                <span className="text-xs text-gray-400">/h</span>
              </div>
              <div className="text-[11px] text-blue-300 leading-tight">
                {formatCurrency(result.rates.regular / usdDisplayRate, "USD")}/h
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-gray-700 self-center" />

          {/* Monthly net (visible on sm+) */}
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5">
              Líquido / mês
            </div>
            <div className="text-lg font-bold text-green-400 leading-none">
              {formatCurrency(monthlyNet)}
            </div>
            <div className="text-[11px] text-blue-300 leading-tight">
              {formatCurrency(monthlyNet / usdDisplayRate, "USD")}
            </div>
            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
              {formatCurrency(yearlyNet)}/ano
            </div>
          </div>

          {/* Mobile-only: monthly net inline */}
          <div className="sm:hidden text-right">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5">
              Líquido/mês
            </div>
            <div className="text-base font-bold text-green-400 leading-none">
              {formatCurrency(monthlyNet)}
            </div>
            <div className="text-[10px] text-blue-300 leading-tight">
              {formatCurrency(monthlyNet / usdDisplayRate, "USD")}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: client + USD/BRL + Como? */}
          <div className="flex items-center gap-2 sm:gap-3">
            {clientCity && (
              <div className="hidden md:flex items-center text-xs text-gray-400">
                <span className="text-green-400 mr-1">●</span> {clientCity}
              </div>
            )}
            <div className="hidden sm:block text-right">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none">
                USD/BRL
              </div>
              <div className="text-xs font-mono text-gray-200">
                {exchangeRate.toFixed(2)}
              </div>
            </div>
            <button
              onClick={onOpenBreakdown}
              className="px-3 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold whitespace-nowrap"
            >
              📊 <span className="hidden sm:inline">Como?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
