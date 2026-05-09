import { formatCurrency } from "@freelaz/shared";

interface NeedsPhaseProps {
  monthlyExpenses: number;
  setMonthlyExpenses: (n: number) => void;
  savingsPercent: number;
  setSavingsPercent: (n: number) => void;
  extraPercent: number;
  setExtraPercent: (n: number) => void;
  savingsAmount: number;
  extraAmount: number;
  netMonthlyNeeds: number;
}

export function NeedsPhase({
  monthlyExpenses,
  setMonthlyExpenses,
  savingsPercent,
  setSavingsPercent,
  extraPercent,
  setExtraPercent,
  savingsAmount,
  extraAmount,
  netMonthlyNeeds,
}: NeedsPhaseProps) {
  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          2
        </span>
        <h2 className="text-xl font-bold text-gray-800">Do que você precisa?</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Custo de vida e suas metas mensais. Define o piso da sua taxa.
      </p>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Custo de vida mensal
        </label>
        <div className="flex">
          <span className="bg-gray-100 border-2 border-r-0 border-gray-300 px-3 py-3 rounded-l-lg font-bold text-gray-700">
            R$
          </span>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className="flex-1 min-w-0 px-3 py-3 border-2 border-gray-300 rounded-r-lg focus:border-blue-500 text-base font-semibold"
            placeholder="2000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Inclui moradia, alimentação, transporte, contas, lazer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="font-semibold text-gray-700">
              Reserva (poupança)
            </label>
            <span className="text-gray-600">
              {savingsPercent}% ={" "}
              <span className="font-bold">{formatCurrency(savingsAmount)}</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={savingsPercent}
            onChange={(e) => setSavingsPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="font-semibold text-gray-700">
              Extras (imprevistos, lazer)
            </label>
            <span className="text-gray-600">
              {extraPercent}% ={" "}
              <span className="font-bold">{formatCurrency(extraAmount)}</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={extraPercent}
            onChange={(e) => setExtraPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-baseline justify-between">
        <span className="text-emerald-900 font-medium text-sm">
          Você precisa de
        </span>
        <span className="text-emerald-700 text-lg font-bold">
          {formatCurrency(netMonthlyNeeds)}/mês
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Líquido — antes de impostos. Os impostos entram na próxima etapa.
      </p>
    </section>
  );
}
