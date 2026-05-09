import { formatCurrency, type CalculatorResult } from "@freelaz/shared";

interface StickyResultProps {
  result: CalculatorResult;
  usdDisplayRate: number;
  exchangeRate: number;
  adjustedTaxPercent: number;
  clientCity?: string;
  onOpenBreakdown: () => void;
}

const FLOOR_BADGE: Record<
  CalculatorResult["floorReason"],
  { icon: string; label: string; tooltip: string }
> = {
  cost: {
    icon: "💼",
    label: "custos",
    tooltip: "Definida pelos seus custos mensais",
  },
  market: {
    icon: "📊",
    label: "mercado",
    tooltip: "Definida pelo mercado para seu nível",
  },
  location: {
    icon: "🌍",
    label: "cliente",
    tooltip: "Definida pelo mercado do cliente internacional",
  },
};

const formatCompactBRL = (n: number): string => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `R$ ${Math.round(n / 1000)}k`;
  return formatCurrency(n);
};

const formatCompactUSD = (n: number): string => {
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `US$ ${Math.round(n / 1000)}k`;
  return formatCurrency(n, "USD");
};

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
  const floor = FLOOR_BADGE[result.floorReason];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Column 1: hourly */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5 flex items-center gap-1">
              <span>Sua taxa</span>
              <span
                title={floor.tooltip}
                className="text-blue-300 font-medium normal-case"
              >
                · {floor.icon} {floor.label}
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-white leading-none">
              {formatCurrency(result.rates.regular)}
              <span className="text-xs text-gray-400">/h</span>
            </div>
            <div className="text-[11px] text-blue-300 leading-tight">
              {formatCurrency(result.rates.regular / usdDisplayRate, "USD")}/h
            </div>
          </div>

          <div className="w-px h-10 bg-gray-700 self-center" />

          {/* Column 2: monthly net */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5">
              Líquido / mês
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-400 leading-none">
              {formatCurrency(monthlyNet)}
            </div>
            <div className="text-[11px] text-blue-300 leading-tight">
              {formatCurrency(monthlyNet / usdDisplayRate, "USD")}
            </div>
          </div>

          {/* Column 3: yearly (tablet+) */}
          <div className="hidden md:block flex-1 min-w-0">
            <div className="w-px h-10 bg-gray-700 absolute -ml-3 self-center" />
            <div className="text-[10px] uppercase tracking-wide text-gray-500 leading-none mb-0.5">
              Líquido / ano
            </div>
            <div className="text-lg font-bold text-green-300 leading-none">
              {formatCompactBRL(yearlyNet)}
            </div>
            <div className="text-[11px] text-blue-300 leading-tight">
              {formatCompactUSD(yearlyNet / usdDisplayRate)}
            </div>
          </div>

          {/* Right: meta + button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {clientCity && (
              <div className="hidden lg:flex items-center text-xs text-gray-400">
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
