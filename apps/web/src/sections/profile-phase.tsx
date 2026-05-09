import {
  professionData,
  stateData,
  formatCurrency,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
} from "@freelaz/shared";

interface ProfilePhaseProps {
  profession: ProfessionKey;
  setProfession: (p: ProfessionKey) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (e: ExperienceLevel) => void;
  state: StateKey;
  setState: (s: StateKey) => void;
  workHours: number;
  setWorkHours: (h: number) => void;
  workDays: number;
  setWorkDays: (d: number) => void;
  vacationDays: number;
  setVacationDays: (d: number) => void;
  marketRange: { min: number; max: number };
  exchangeRate: number;
}

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  specialist: "Especialista",
};

export function ProfilePhase({
  profession,
  setProfession,
  experienceLevel,
  setExperienceLevel,
  state,
  setState,
  workHours,
  setWorkHours,
  workDays,
  setWorkDays,
  vacationDays,
  setVacationDays,
  marketRange,
  exchangeRate,
}: ProfilePhaseProps) {
  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          1
        </span>
        <h2 className="text-xl font-bold text-gray-800">Quem é você?</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Profissão e perfil de trabalho. Define a faixa de mercado.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <label className="text-sm">
          <span className="block font-semibold text-gray-700 mb-1">
            Profissão
          </span>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value as ProfessionKey)}
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
          <span className="block font-semibold text-gray-700 mb-1">
            Experiência
          </span>
          <select
            value={experienceLevel}
            onChange={(e) =>
              setExperienceLevel(e.target.value as ExperienceLevel)
            }
            className="w-full p-2 border-2 border-gray-300 rounded-lg"
          >
            {(["junior", "pleno", "senior", "specialist"] as const).map((k) => (
              <option key={k} value={k}>
                {EXPERIENCE_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block font-semibold text-gray-700 mb-1">Estado</span>
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
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <label className="text-sm">
          <span className="block font-semibold text-gray-700 mb-1">
            Horas/dia
          </span>
          <input
            type="number"
            min={1}
            max={16}
            value={workHours}
            onChange={(e) => setWorkHours(Number(e.target.value))}
            className="w-full p-2 border-2 border-gray-300 rounded-lg"
          />
        </label>
        <label className="text-sm">
          <span className="block font-semibold text-gray-700 mb-1">
            Dias/semana
          </span>
          <input
            type="number"
            min={1}
            max={7}
            value={workDays}
            onChange={(e) => setWorkDays(Number(e.target.value))}
            className="w-full p-2 border-2 border-gray-300 rounded-lg"
          />
        </label>
        <label className="text-sm">
          <span className="block font-semibold text-gray-700 mb-1">
            Férias (dias/ano)
          </span>
          <input
            type="number"
            min={0}
            max={120}
            value={vacationDays}
            onChange={(e) => setVacationDays(Number(e.target.value))}
            className="w-full p-2 border-2 border-gray-300 rounded-lg"
          />
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <span className="text-blue-900 font-medium">
          Faixa típica de mercado:
        </span>{" "}
        <span className="text-blue-700 font-bold">
          {formatCurrency(marketRange.min * exchangeRate)} –{" "}
          {formatCurrency(marketRange.max * exchangeRate)}/h
        </span>{" "}
        <span className="text-gray-600">
          ({formatCurrency(marketRange.min, "USD")} –{" "}
          {formatCurrency(marketRange.max, "USD")}/h)
        </span>
      </div>
    </section>
  );
}
