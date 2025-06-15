import {
  professionData,
  type ProfessionKey,
  type ExperienceLevel,
  type StateKey,
} from "@freelaz/shared";
import { SearchableStateDropdown } from "./searchable-state-dropdown";
import { CustomDropdown } from "./custom-dropdown";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";

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
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  // Prepare profession options
  const professionOptions = Object.entries(professionData).map(
    ([key, prof]) => ({
      value: key,
      label: prof.name.pt,
    })
  );

  // Prepare experience level options
  const experienceOptions = [
    { value: "junior", label: "Júnior (0-2 anos)" },
    { value: "pleno", label: "Pleno (2-5 anos)" },
    { value: "senior", label: "Sênior (5+ anos)" },
    { value: "specialist", label: "Especialista (8+ anos)" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold">
            ⚙️ <span className="hidden sm:inline">Configurações Avançadas</span>
            <span className="sm:hidden">Config.</span>
          </h2>
          <button
            onClick={onClose}
            className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2 -mr-2">
          {/* Profile Settings */}
          <div className="space-y-4">
            {/* Profession - Full Width */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Profissão:
              </label>
              <CustomDropdown
                value={profession}
                onChange={(value) => setProfession(value as ProfessionKey)}
                options={professionOptions}
                placeholder="Selecione uma profissão"
                searchable={true}
              />
            </div>

            {/* Experience and State - Mobile Stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Experiência:
                </label>
                <CustomDropdown
                  value={experienceLevel}
                  onChange={(value) =>
                    setExperienceLevel(value as ExperienceLevel)
                  }
                  options={experienceOptions}
                  placeholder="Selecione o nível"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Estado:
                </label>
                <SearchableStateDropdown value={state} onChange={setState} />
              </div>
            </div>
          </div>

          {/* Work Configuration */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold">
                ⏰ <span className="hidden sm:inline">Configuração de</span>{" "}
                Trabalho
              </h3>
              <button
                onClick={() => {
                  // Reset to default values
                  setWorkHours(8);
                  setWorkDays(5);
                  setVacationDays(30);
                }}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
              >
                🔄 Resetar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Horas por Dia:{" "}
                  <span className="font-bold text-blue-600">{workHours}h</span>
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
                  Dias por Semana:{" "}
                  <span className="font-bold text-blue-600">{workDays}</span>
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
                  Férias por Ano:{" "}
                  <span className="font-bold text-blue-600">
                    {vacationDays} dias
                  </span>
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
        </div>

        <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span className="text-lg sm:text-base">✅</span>
            <span className="hidden sm:inline">Aplicar e Fechar</span>
            <span className="sm:hidden text-xs">Aplicar</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
          >
            <span className="text-lg sm:text-base">❌</span>
            <span className="hidden sm:inline">Cancelar</span>
            <span className="sm:hidden text-xs">Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
