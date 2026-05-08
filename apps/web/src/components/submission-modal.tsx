import { useState } from "react";
import {
  professionData,
  stateData,
  TAX_REGIMES,
  TAX_REGIME_KEYS,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
  type TaxRegimeKey,
} from "@freelaz/shared";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaults: {
    profession: ProfessionKey;
    experienceLevel: ExperienceLevel;
    state: StateKey;
    hourlyRateBRL: number;
    hourlyRateUSD: number;
    taxRegime?: TaxRegimeKey;
    clientCountry?: string;
  };
  onSuccess: () => void;
  onError: (message: string) => void;
}

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8787";

export function SubmissionModal({
  isOpen,
  onClose,
  defaults,
  onSuccess,
  onError,
}: SubmissionModalProps) {
  useBodyScrollLock(isOpen);

  const [profession, setProfession] = useState<ProfessionKey>(
    defaults.profession
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    defaults.experienceLevel
  );
  const [state, setState] = useState<StateKey>(defaults.state);
  const [hourlyRateBRL, setHourlyRateBRL] = useState(
    Math.round(defaults.hourlyRateBRL)
  );
  const [hourlyRateUSD, setHourlyRateUSD] = useState(
    Math.round(defaults.hourlyRateUSD)
  );
  const [taxRegime, setTaxRegime] = useState<TaxRegimeKey>(
    defaults.taxRegime ?? "simples"
  );
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        profession,
        experienceLevel,
        state,
        hourlyRateBRL,
        hourlyRateUSD,
        taxRegime,
        yearsExperience: yearsExperience
          ? Number(yearsExperience)
          : undefined,
        industry: industry || undefined,
        notes: notes || undefined,
      };
      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      onError(
        error instanceof Error
          ? `Erro ao enviar: ${error.message}`
          : "Erro ao enviar."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-2xl font-bold">
            🤝 Compartilhar Minha Taxa Anonimamente
          </h2>
          <button
            onClick={onClose}
            className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
          <p className="text-sm text-gray-600 mb-4">
            Sua submissão é totalmente anônima — sem nome, email ou
            identificador. Ajuda outros freelancers brasileiros a se
            posicionarem no mercado.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block font-semibold mb-1">Profissão</span>
                <select
                  value={profession}
                  onChange={(e) =>
                    setProfession(e.target.value as ProfessionKey)
                  }
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  {Object.entries(professionData).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.name.pt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Experiência</span>
                <select
                  value={experienceLevel}
                  onChange={(e) =>
                    setExperienceLevel(e.target.value as ExperienceLevel)
                  }
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="specialist">Especialista</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Estado</span>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as StateKey)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  {Object.entries(stateData).map(([key, s]) => (
                    <option key={key} value={key}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Anos de experiência</span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="ex: 5"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                />
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Taxa (R$/h)</span>
                <input
                  type="number"
                  min={0}
                  value={hourlyRateBRL}
                  onChange={(e) => setHourlyRateBRL(Number(e.target.value))}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                />
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Taxa (US$/h)</span>
                <input
                  type="number"
                  min={0}
                  value={hourlyRateUSD}
                  onChange={(e) => setHourlyRateUSD(Number(e.target.value))}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                />
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">Regime tributário</span>
                <select
                  value={taxRegime}
                  onChange={(e) =>
                    setTaxRegime(e.target.value as TaxRegimeKey)
                  }
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                >
                  {TAX_REGIME_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {TAX_REGIMES[k].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block font-semibold mb-1">
                  Indústria (opcional)
                </span>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="ex: fintech, e-commerce"
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                />
              </label>
            </div>
            <label className="text-sm block">
              <span className="block font-semibold mb-1">
                Notas (opcional, máx 280 caracteres)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 280))}
                rows={3}
                placeholder="ex: cliente nos EUA via Wise, contrato anual"
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
              />
              <span className="text-xs text-gray-500">
                {notes.length}/280
              </span>
            </label>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar anonimamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
