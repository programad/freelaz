import {
  stateData,
  costOfLivingInfo,
  multiplierExplanation,
  type StateKey,
} from "@freelaz/shared";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";

interface ParametersInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: StateKey;
}

export function ParametersInfoModal({
  isOpen,
  onClose,
  currentState,
}: ParametersInfoModalProps) {
  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const currentStateData = stateData[currentState];
  const currentStateInfo = costOfLivingInfo.stateDetails[currentState];

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
            📊{" "}
            <span className="hidden sm:inline">Parâmetros e Metodologia</span>
            <span className="sm:hidden">Parâmetros</span>
          </h2>
          <button
            onClick={onClose}
            className="text-xl sm:text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-8">
            {/* Current State Info */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 flex items-center gap-2">
                  🏛️ {currentStateData.name}
                </h3>
                <span className="text-xs sm:text-sm font-medium bg-blue-200 text-blue-800 px-2 py-1 rounded w-fit">
                  Índice: {currentStateData.costIndex}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">
                    Explicação:
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">
                    {currentStateInfo?.explanation ||
                      "Informação não disponível para este estado."}
                  </p>

                  <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">
                    Fatores Considerados:
                  </h4>
                  <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                    {currentStateInfo?.factors?.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {factor}
                      </li>
                    )) || <li>Dados não disponíveis</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">
                    Contexto do Mercado Tech:
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {currentStateInfo?.marketContext ||
                      "Informação não disponível."}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost of Living Methodology */}
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
              <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                📈 <span className="hidden sm:inline">Metodologia do</span>{" "}
                Custo de Vida
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    <strong>Descrição:</strong> {costOfLivingInfo.description}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    <strong>Metodologia:</strong> {costOfLivingInfo.methodology}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Fonte:</strong> {costOfLivingInfo.source} |
                    <strong> Última atualização:</strong>{" "}
                    {costOfLivingInfo.lastUpdated}
                  </p>
                </div>

                <div className="bg-white rounded p-3 sm:p-4">
                  <h4 className="font-semibold text-green-700 mb-2 sm:mb-3 text-sm sm:text-base">
                    Estados com Maiores Índices:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs sm:text-sm">
                    {Object.entries(stateData)
                      .sort(([, a], [, b]) => b.costIndex - a.costIndex)
                      .slice(0, 6)
                      .map(([key, state]) => (
                        <div
                          key={key}
                          className="flex justify-between bg-gray-50 px-2 py-1 rounded"
                        >
                          <span>{state.name}</span>
                          <span className="font-semibold text-green-600">
                            {state.costIndex}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Multipliers Explanation */}
            <div className="bg-orange-50 rounded-lg p-4 sm:p-6 border border-orange-200">
              <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3 sm:mb-4">
                ⚡{" "}
                <span className="hidden sm:inline">
                  {multiplierExplanation.title}
                </span>
                <span className="sm:hidden">Multiplicadores</span>
              </h3>

              <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6">
                {multiplierExplanation.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {Object.entries(multiplierExplanation.multipliers).map(
                  ([key, multiplier]) => (
                    <div
                      key={key}
                      className="bg-white rounded-lg p-3 sm:p-4 border border-orange-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">
                            {key === "regular" && "🟢"}
                            {key === "revision" && "🟡"}
                            {key === "rush" && "🟠"}
                            {key === "difficult" && "🔴"}
                          </span>
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                            {multiplier.title}
                          </h4>
                        </div>
                        <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-semibold w-fit">
                          {multiplier.value}x
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-700 mb-3">
                        {multiplier.description}
                      </p>

                      <div className="space-y-2 hidden sm:block">
                        <div>
                          <h5 className="text-xs font-semibold text-gray-600 mb-1">
                            Exemplos:
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {multiplier.examples.map((example, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-1"
                              >
                                <span className="text-orange-400 mt-0.5">
                                  •
                                </span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-gray-600 mb-1">
                            Considerações:
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {multiplier.considerations.map(
                              (consideration, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-1"
                                >
                                  <span className="text-orange-400 mt-0.5">
                                    •
                                  </span>
                                  {consideration}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-2 sm:mb-3 text-sm sm:text-base">
                  💡 Dicas Importantes:
                </h4>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2">
                  {multiplierExplanation.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5 sm:mt-1">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="text-lg sm:text-base">✅</span>
            <span className="hidden sm:inline">Entendi os Parâmetros!</span>
            <span className="sm:hidden">Entendi!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
