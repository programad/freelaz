import {
  professionData,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
} from "@brazilian-rate-calculator/shared";
import { SearchableStateDropdown } from "./searchable-state-dropdown";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profession: ProfessionKey;
  setProfession: (value: ProfessionKey) => void;
  state: StateKey;
  setState: (value: StateKey) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (value: ExperienceLevel) => void;
  workHours: number;
  setWorkHours: (value: number) => void;
  workDays: number;
  setWorkDays: (value: number) => void;
  vacationDays: number;
  setVacationDays: (value: number) => void;
}

export function ConfigurationModal({
  isOpen,
  onClose,
  profession,
  setProfession,
  state,
  setState,
  experienceLevel,
  setExperienceLevel,
  workHours,
  setWorkHours,
  workDays,
  setWorkDays,
  vacationDays,
  setVacationDays,
}: ConfigurationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">⚙️ Configurações Avançadas</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="space-y-4">
            {/* Profession - Full Width */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Profissão:
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value as ProfessionKey)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base leading-6 min-h-[3.5rem]"
              >
                {Object.entries(professionData).map(([key, prof]) => (
                  <option key={key} value={key}>
                    {prof.name.pt}
                  </option>
                ))}
              </select>
            </div>

            {/* State and Experience - Two Columns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Estado:
                </label>
                <SearchableStateDropdown value={state} onChange={setState} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Experiência:
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) =>
                    setExperienceLevel(e.target.value as ExperienceLevel)
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base leading-6 min-h-[3.5rem]"
                >
                  <option value="junior">Júnior (0-2 anos)</option>
                  <option value="pleno">Pleno (2-5 anos)</option>
                  <option value="senior">Sênior (5+ anos)</option>
                  <option value="specialist">Especialista (8+ anos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Configuration */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              ⏰ Configuração de Trabalho
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Horas por Dia: {workHours}h
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={workHours}
                  onChange={(e) => setWorkHours(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Dias por Semana: {workDays}
                </label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  value={workDays}
                  onChange={(e) => setWorkDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Férias por Ano: {vacationDays} dias
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              ✅ Aplicar e Fechar
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
