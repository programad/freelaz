import { formatCurrency } from "../services/location-service";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";
import type { LocationData } from "@freelaz/shared";
import type { LocationAnalysis } from "./client-location-input";

interface CalculationBreakdownModalProps {
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
  adjustedTaxPercent: number;
  grossMonthlyNeeds: number;
  grossMonthlyNeedsAdjusted: number;
  workingDaysPerYear: number;
  workingHoursPerYear: number;
  workingHoursPerMonth: number;
  baseRate: number;
  baseRateWithAdjustedTax: number;
  finalBaseRate: number;
  rates: {
    regular: number;
    revision: number;
    rush: number;
    difficult: number;
  };
  clientLocation: LocationData | null;
  locationAnalysis: LocationAnalysis | null;
  potentialGains: {
    monthlyDifference: number;
    yearlyDifference: number;
    percentageChange: number;
    isGain: boolean;
    taxSavings: number;
  } | null;
  exchangeRate: number;
  state: string;
}

export function CalculationBreakdownModal({
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
  adjustedTaxPercent,
  grossMonthlyNeeds,
  grossMonthlyNeedsAdjusted,
  workingDaysPerYear,
  workingHoursPerYear,
  workingHoursPerMonth,
  baseRate,
  baseRateWithAdjustedTax,
  finalBaseRate,
  rates,
  clientLocation,
  locationAnalysis,
  potentialGains,
  exchangeRate,
  state,
}: CalculationBreakdownModalProps) {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold">
            📊 Cálculo Detalhado
          </h2>
          <button
            onClick={onClose}
            className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
          <div className="space-y-6">
            {/* Step 1: Base Expenses */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                1️⃣ Custos Base
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Custo de vida informado:</span>
                  <span className="font-medium">
                    {formatCurrency(monthlyExpenses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Índice de custo ({state}):</span>
                  <span className="font-medium">{costOfLivingIndex}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Custo ajustado:</span>
                  <span className="font-semibold">
                    {formatCurrency(adjustedExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Additional Costs */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                2️⃣ Custos Adicionais
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Reserva ({savingsPercent}%):</span>
                  <span className="font-medium">
                    {formatCurrency(savingsAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Extras ({extraPercent}%):</span>
                  <span className="font-medium">
                    {formatCurrency(extraAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">
                    Total líquido necessário:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(netMonthlyNeeds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Tax Calculation */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                3️⃣ Cálculo de Impostos
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxa de imposto base:</span>
                  <span className="font-medium">{taxPercent}%</span>
                </div>
                {clientLocation && adjustedTaxPercent !== taxPercent && (
                  <>
                    <div className="flex justify-between">
                      <span>
                        Taxa ajustada (
                        {clientLocation.country !== "Brazil"
                          ? "internacional"
                          : "nacional"}
                        ):
                      </span>
                      <span className="font-medium text-purple-600">
                        {adjustedTaxPercent.toFixed(1)}%
                      </span>
                    </div>
                    {clientLocation.country !== "Brazil" && (
                      <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                        💡 Exportação de serviços pode ter benefícios fiscais
                        (MEI, regime especial)
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span>Bruto necessário (base):</span>
                  <span className="font-medium">
                    {formatCurrency(grossMonthlyNeeds)}
                  </span>
                </div>
                {adjustedTaxPercent !== taxPercent && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Bruto ajustado:</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(grossMonthlyNeedsAdjusted)}
                    </span>
                  </div>
                )}
                {locationAnalysis && (
                  <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded mt-2">
                    ⚠️ Impostos finais serão calculados sobre a receita total
                    ajustada pela localização do cliente
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Working Hours */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                4️⃣ Horas de Trabalho
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dias úteis por ano:</span>
                  <span className="font-medium">{workingDaysPerYear} dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas por ano:</span>
                  <span className="font-medium">
                    {workingHoursPerYear.toFixed(0)} horas
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Horas por mês:</span>
                  <span className="font-semibold">
                    {workingHoursPerMonth.toFixed(0)} horas
                  </span>
                </div>
              </div>
            </div>

            {/* Step 5: Rate Calculation */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                5️⃣ Cálculo da Taxa
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxa base (Brasil):</span>
                  <span className="font-medium">
                    {formatCurrency(baseRate)}/h
                  </span>
                </div>
                {adjustedTaxPercent !== taxPercent && (
                  <div className="flex justify-between">
                    <span>Taxa com imposto ajustado:</span>
                    <span className="font-medium">
                      {formatCurrency(baseRateWithAdjustedTax)}/h
                    </span>
                  </div>
                )}
                {locationAnalysis && (
                  <>
                    <div className="flex justify-between">
                      <span>Multiplicador de localização:</span>
                      <span className="font-medium">
                        {locationAnalysis.adjustment.multiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">
                        Taxa final ajustada:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(finalBaseRate)}/h
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      {formatCurrency(finalBaseRate / exchangeRate, "USD")}/h em
                      dólares
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 6: Location Impact (if applicable) */}
            {clientLocation && potentialGains && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  6️⃣ Impacto da Localização do Cliente
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-800 mb-2">
                      📍 Cliente:{" "}
                      {clientLocation.namePortuguese || clientLocation.city},{" "}
                      {clientLocation.country === "United States"
                        ? "Estados Unidos"
                        : clientLocation.country === "United Kingdom"
                        ? "Reino Unido"
                        : clientLocation.country === "Germany"
                        ? "Alemanha"
                        : clientLocation.country === "France"
                        ? "França"
                        : clientLocation.country === "Spain"
                        ? "Espanha"
                        : clientLocation.country === "Netherlands"
                        ? "Holanda"
                        : clientLocation.country === "Switzerland"
                        ? "Suíça"
                        : clientLocation.country === "Sweden"
                        ? "Suécia"
                        : clientLocation.country === "Finland"
                        ? "Finlândia"
                        : clientLocation.country === "Poland"
                        ? "Polônia"
                        : clientLocation.country === "Czech Republic"
                        ? "República Tcheca"
                        : clientLocation.country === "Hungary"
                        ? "Hungria"
                        : clientLocation.country === "Bulgaria"
                        ? "Bulgária"
                        : clientLocation.country === "Romania"
                        ? "Romênia"
                        : clientLocation.country === "Canada"
                        ? "Canadá"
                        : clientLocation.country === "Australia"
                        ? "Austrália"
                        : clientLocation.country === "Singapore"
                        ? "Singapura"
                        : clientLocation.country === "Japan"
                        ? "Japão"
                        : clientLocation.country === "Brazil"
                        ? "Brasil"
                        : clientLocation.country === "Portugal"
                        ? "Portugal"
                        : clientLocation.country === "Ireland"
                        ? "Irlanda"
                        : clientLocation.country}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Poder de compra:</span>
                        <div className="font-medium">
                          {clientLocation.purchasingPowerIndex}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Dev sênior local:</span>
                        <div className="font-medium">
                          {formatCurrency(
                            clientLocation.localDeveloperRates.senior,
                            "USD"
                          )}
                          /h
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-800 mb-2">
                      {potentialGains.isGain
                        ? "📈 Ganho Potencial"
                        : "📉 Redução Potencial"}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Por mês:</span>
                        <div
                          className={`font-bold ${
                            potentialGains.isGain
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {potentialGains.isGain ? "+" : ""}
                          {formatCurrency(potentialGains.monthlyDifference)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Por ano:</span>
                        <div
                          className={`font-bold ${
                            potentialGains.isGain
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {potentialGains.isGain ? "+" : ""}
                          {formatCurrency(potentialGains.yearlyDifference)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {potentialGains.percentageChange > 0 ? "+" : ""}
                      {potentialGains.percentageChange.toFixed(1)}% vs trabalho
                      apenas no Brasil
                    </div>
                  </div>

                  {potentialGains.taxSavings > 0 && (
                    <div className="bg-purple-100 p-3 rounded border border-purple-200">
                      <div className="font-medium text-purple-800 mb-1">
                        💰 Benefício Fiscal
                      </div>
                      <div className="text-xs text-purple-700">
                        Economia de {potentialGains.taxSavings.toFixed(1)}% em
                        impostos para clientes internacionais
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Rates */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                🎯 Taxas Finais
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600 mb-1">Normal:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(rates.regular)}/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(rates.regular / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600 mb-1">Revisão:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(rates.revision)}/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(rates.revision / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600 mb-1">Urgente:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(rates.rush)}/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(rates.rush / exchangeRate, "USD")}/h
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600 mb-1">Complexo:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(rates.difficult)}/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(rates.difficult / exchangeRate, "USD")}/h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
