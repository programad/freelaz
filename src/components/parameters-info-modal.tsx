import { stateData, type StateKey } from "../data/state-data";
import {
  costOfLivingInfo,
  multiplierExplanation,
} from "../data/cost-of-living-info";

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
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold">📊 Parâmetros e Metodologia</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-8">
            {/* Current State Info */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                🏛️ {currentStateData.name}
                <span className="text-sm font-normal bg-blue-200 px-2 py-1 rounded">
                  Índice: {currentStateData.costIndex}%
                </span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Explicação:
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {currentStateInfo?.explanation ||
                      "Informação não disponível para este estado."}
                  </p>

                  <h4 className="font-semibold text-blue-700 mb-2">
                    Fatores Considerados:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {currentStateInfo?.factors?.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {factor}
                      </li>
                    )) || <li>Dados não disponíveis</li>}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Contexto do Mercado Tech:
                  </h4>
                  <p className="text-sm text-gray-700">
                    {currentStateInfo?.marketContext ||
                      "Informação não disponível."}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost of Living Methodology */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">
                📈 Metodologia do Custo de Vida
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Descrição:</strong> {costOfLivingInfo.description}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Metodologia:</strong> {costOfLivingInfo.methodology}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Fonte:</strong> {costOfLivingInfo.source} |
                    <strong> Última atualização:</strong>{" "}
                    {costOfLivingInfo.lastUpdated}
                  </p>
                </div>

                <div className="bg-white rounded p-4">
                  <h4 className="font-semibold text-green-700 mb-3">
                    Estados com Maiores Índices:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
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
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-xl font-bold text-orange-800 mb-4">
                ⚡ {multiplierExplanation.title}
              </h3>

              <p className="text-sm text-gray-700 mb-6">
                {multiplierExplanation.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {Object.entries(multiplierExplanation.multipliers).map(
                  ([key, multiplier]) => (
                    <div
                      key={key}
                      className="bg-white rounded-lg p-4 border border-orange-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {key === "regular" && "🟢"}
                          {key === "revision" && "🟡"}
                          {key === "rush" && "🟠"}
                          {key === "difficult" && "🔴"}
                        </span>
                        <h4 className="font-bold text-gray-800">
                          {multiplier.title}
                        </h4>
                        <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                          {multiplier.value}x
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {multiplier.description}
                      </p>

                      <div className="space-y-2">
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

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-700 mb-3">
                  💡 Dicas Importantes:
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  {multiplierExplanation.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            ✅ Entendi os Parâmetros!
          </button>
        </div>
      </div>
    </div>
  );
}
