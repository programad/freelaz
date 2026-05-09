import {
  SPECIALTIES,
  SPECIALTY_KEYS,
  INDUSTRIES,
  INDUSTRY_KEYS,
  CLIENT_TYPES,
  CLIENT_TYPE_KEYS,
  type SpecialtyKey,
  type IndustryKey,
  type ClientTypeKey,
} from "@freelaz/shared";

interface AdvancedSectionProps {
  specialties: SpecialtyKey[];
  setSpecialties: (s: SpecialtyKey[]) => void;
  specialtyPremiumPercent: number;
  industry: IndustryKey;
  setIndustry: (i: IndustryKey) => void;
  clientType: ClientTypeKey;
  setClientType: (c: ClientTypeKey) => void;
  segmentAdjustmentPercent: number;
  currencyBuffer: number;
  setCurrencyBuffer: (n: number) => void;
  exchangeRate: number;
  usdDisplayRate: number;
}

export function AdvancedSection({
  specialties,
  setSpecialties,
  specialtyPremiumPercent,
  industry,
  setIndustry,
  clientType,
  setClientType,
  segmentAdjustmentPercent,
  currencyBuffer,
  setCurrencyBuffer,
  exchangeRate,
  usdDisplayRate,
}: AdvancedSectionProps) {
  const totalAdjust =
    specialtyPremiumPercent + segmentAdjustmentPercent + currencyBuffer;

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
            ⚙️ Avançado: especialidades, indústria, segurança
          </span>
        </div>
        {totalAdjust !== 0 && (
          <span
            className={`text-sm font-bold ${
              totalAdjust > 0 ? "text-green-700" : "text-orange-700"
            }`}
          >
            {totalAdjust > 0 ? "+" : ""}
            {totalAdjust}% na taxa
          </span>
        )}
      </summary>

      <div className="border-t border-gray-200 p-5 space-y-6">
        {/* Specialties */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-semibold text-gray-800">⭐ Especialidades</h4>
            {specialtyPremiumPercent > 0 && (
              <span className="text-sm font-bold text-green-700">
                +{specialtyPremiumPercent}%
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_KEYS.map((key) => {
              const s = SPECIALTIES[key];
              const active = specialties.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSpecialties(
                      active
                        ? specialties.filter((k) => k !== key)
                        : [...specialties, key]
                    );
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-semibold border ${
                    active
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                  }`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.label}
                  <span className="ml-1 opacity-75">+{s.premium}%</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cap de +50% no total combinado.
          </p>
        </div>

        {/* Industry & Client type */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-semibold text-gray-800">
              🏭 Indústria & cliente
            </h4>
            {segmentAdjustmentPercent !== 0 && (
              <span
                className={`text-sm font-bold ${
                  segmentAdjustmentPercent > 0
                    ? "text-green-700"
                    : "text-orange-700"
                }`}
              >
                {segmentAdjustmentPercent > 0 ? "+" : ""}
                {segmentAdjustmentPercent}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Indústria</span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryKey)}
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
              >
                {INDUSTRY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {INDUSTRIES[k].label}
                    {INDUSTRIES[k].premium !== 0 &&
                      ` (${
                        INDUSTRIES[k].premium > 0 ? "+" : ""
                      }${INDUSTRIES[k].premium}%)`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-700 mb-1">Tipo de cliente</span>
              <select
                value={clientType}
                onChange={(e) =>
                  setClientType(e.target.value as ClientTypeKey)
                }
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
              >
                {CLIENT_TYPE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CLIENT_TYPES[k].label}
                    {CLIENT_TYPES[k].premium !== 0 &&
                      ` (${
                        CLIENT_TYPES[k].premium > 0 ? "+" : ""
                      }${CLIENT_TYPES[k].premium}%)`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Currency buffer */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-semibold text-gray-800">
              📉 Margem de segurança (câmbio)
            </h4>
            <span className="text-sm font-semibold text-gray-700">
              {currencyBuffer}% · cota como se USD = R${" "}
              {usdDisplayRate.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={currencyBuffer}
            onChange={(e) => setCurrencyBuffer(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-gray-500 mt-1">
            Aumenta seu valor em USD para proteger contra queda do dólar.
            Cotação real ({exchangeRate.toFixed(2)}) é usada para os números
            em R$. 5–10% é razoável.
          </p>
        </div>
      </div>
    </details>
  );
}
