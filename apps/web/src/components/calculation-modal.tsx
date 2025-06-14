import { formatCurrency } from "@brazilian-rate-calculator/shared";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyExpenses: number;
  costOfLivingIndex: number;
  adjustedExpenses: number;
  savingsPercent: number;
  savingsAmount: number;
  extraPercent: number;
  extraAmount: number;
  netMonthlyNeeds: number;
  taxPercent: number;
  grossMonthlyNeeds: number;
  workingDaysPerYear: number;
  workingHoursPerYear: number;
  workingHoursPerMonth: number;
  baseRate: number;
  rates: {
    regular: number;
    revision: number;
    rush: number;
    difficult: number;
  };
}

export function CalculationModal({
  isOpen,
  onClose,
  monthlyExpenses,
  costOfLivingIndex,
  adjustedExpenses,
  savingsPercent,
  savingsAmount,
  extraPercent,
  extraAmount,
  netMonthlyNeeds,
  taxPercent,
  grossMonthlyNeeds,
  workingDaysPerYear,
  workingHoursPerYear,
  workingHoursPerMonth,
  baseRate,
  rates,
}: CalculationModalProps) {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">🧮 Como Calculamos Sua Taxa</h2>
          <button
            onClick={onClose}
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
                Seus gastos são ajustados pelo custo de vida do seu estado:
              </p>
              <div className="bg-white rounded p-3 text-sm">
                <strong>R$ {monthlyExpenses.toLocaleString()}</strong> ×{" "}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                  {costOfLivingIndex}%
                </span>{" "}
                = <strong>{formatCurrency(adjustedExpenses)}</strong>
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
              <h3 className="font-bold text-purple-800 mb-2">3. Impostos</h3>
              <p className="text-sm text-gray-700 mb-2">
                Calculamos o valor bruto necessário considerando {taxPercent}%
                de impostos:
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
                  Horas por ano: {workingHoursPerYear.toLocaleString()} horas
                </div>
                <div className="font-bold">
                  Horas por mês: {Math.round(workingHoursPerMonth)} horas
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">5. Taxa Base</h3>
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
                Aplicamos multiplicadores para diferentes tipos de projeto:
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
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            ✅ Entendi!
          </button>
        </div>
      </div>
    </div>
  );
}
