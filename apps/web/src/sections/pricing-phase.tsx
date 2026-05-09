import {
  TAX_REGIMES,
  TAX_REGIME_KEYS,
  PAYMENT_RAILS,
  PAYMENT_RAIL_KEYS,
  getRegimeHint,
  formatCurrency,
  type TaxRegimeKey,
  type PaymentRailKey,
} from "@freelaz/shared";
import type { ReactNode } from "react";

interface RegimeRow {
  key: TaxRegimeKey;
  label: string;
  rate: number;
  hourlyBRL: number;
  monthlyNet: number;
  yearlyNet: number;
}

interface PricingPhaseProps {
  taxRegime: TaxRegimeKey;
  onRegimeChange: (k: TaxRegimeKey) => void;
  taxPercent: number;
  setTaxPercent: (n: number) => void;
  regimeComparison: RegimeRow[];
  isExport: boolean;
  paymentRail: PaymentRailKey;
  setPaymentRail: (r: PaymentRailKey) => void;
  paymentFeePercent: number;
  hourlyBRL: number;
  monthlyNet: number;
  yearlyNet: number;
  /** Slot for the existing ClientLocationInput component */
  clientLocationSlot: ReactNode;
  /** Slot for the existing AdvancedSection */
  advancedSlot: ReactNode;
}

export function PricingPhase({
  taxRegime,
  onRegimeChange,
  taxPercent,
  setTaxPercent,
  regimeComparison,
  isExport,
  paymentRail,
  setPaymentRail,
  paymentFeePercent,
  hourlyBRL,
  monthlyNet,
  yearlyNet,
  clientLocationSlot,
  advancedSlot,
}: PricingPhaseProps) {
  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          3
        </span>
        <h2 className="text-xl font-bold text-gray-800">Como você cobra?</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Regime tributário, cliente, forma de recebimento. Determina sua taxa
        final.
      </p>

      {/* Client location FIRST — affects regime rates via export benefits */}
      <div className="mb-6">{clientLocationSlot}</div>

      {/* Regime — rates adapt to client (export benefits) */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-semibold text-gray-800">🧾 Regime tributário</h3>
          {isExport && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Exportação de serviços
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Toque para escolher. Cobrando{" "}
          <strong>{formatCurrency(hourlyBRL)}/h</strong>, isto é o que você
          leva pra casa em cada regime.
          {isExport && (
            <>
              {" "}
              Como o cliente é estrangeiro, ISS, PIS e COFINS não incidem.
            </>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TAX_REGIME_KEYS.map((key) => {
            const regime = TAX_REGIMES[key];
            const isActive = taxRegime === key;
            const compare = regimeComparison.find((r) => r.key === key);
            const showsExportRate =
              isExport &&
              regime.rate !== null &&
              regime.rateExport !== null &&
              regime.rateExport !== regime.rate;
            return (
              <button
                key={key}
                onClick={() => onRegimeChange(key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div
                  className={`text-sm font-bold ${
                    isActive ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {regime.label}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {compare ? (
                    showsExportRate ? (
                      <>
                        <span className="text-emerald-700 font-semibold">
                          {compare.rate}%
                        </span>{" "}
                        <span className="line-through text-gray-400">
                          {regime.rate}%
                        </span>
                      </>
                    ) : (
                      `${compare.rate}% imposto`
                    )
                  ) : (
                    "imposto livre"
                  )}
                </div>
                {compare ? (
                  <>
                    <div
                      className={`text-base font-bold ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(compare.monthlyNet)}
                    </div>
                    <div className="text-xs text-gray-500">por mês</div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    ajuste o slider abaixo
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          {getRegimeHint(taxRegime, isExport)}
        </p>
        {taxRegime === "custom" && (
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Imposto:
            </label>
            <input
              type="range"
              min="0"
              max="40"
              step="0.1"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-semibold text-sm min-w-14 text-center">
              {taxPercent.toFixed(taxPercent % 1 === 0 ? 0 : 1)}%
            </span>
          </div>
        )}
      </div>

      {/* Payment rails */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">
          💳 Forma de recebimento
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {PAYMENT_RAIL_KEYS.map((key) => {
            const rail = PAYMENT_RAILS[key];
            const active = paymentRail === key;
            return (
              <button
                key={key}
                onClick={() => setPaymentRail(key)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {rail.label}{" "}
                <span className="opacity-75">({rail.feePercent}%)</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-600">
          {PAYMENT_RAILS[paymentRail].hint}
          {paymentFeePercent > 0 && (
            <>
              {" "}
              Taxa horária ajustada para que você receba o valor desejado depois
              da tarifa.
            </>
          )}
        </p>
      </div>

      {/* Advanced disclosure */}
      <div className="mb-6">{advancedSlot}</div>

      {/* Bridge summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-4">
        <div className="text-xs uppercase tracking-wide opacity-75 mb-1">
          Resumo
        </div>
        <p className="text-sm leading-relaxed">
          Cobrando{" "}
          <strong className="text-white">{formatCurrency(hourlyBRL)}/h</strong>,
          você fatura{" "}
          <strong className="text-white">
            {formatCurrency(monthlyNet / (1 - taxPercent / 100))}/mês
          </strong>{" "}
          bruto e leva pra casa{" "}
          <strong className="text-green-300">
            {formatCurrency(monthlyNet)}/mês líquido
          </strong>{" "}
          ({formatCurrency(yearlyNet)}/ano).
        </p>
      </div>
    </section>
  );
}
