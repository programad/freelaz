interface ActionsBarProps {
  onSave: () => void;
  onShare: () => void;
  onPrint: () => void;
  onSubmit: () => void;
}

export function ActionsBar({
  onSave,
  onShare,
  onPrint,
  onSubmit,
}: ActionsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 no-print">
      <button
        onClick={onSave}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        💾 <span className="text-sm">Salvar</span>
      </button>
      <button
        onClick={onShare}
        className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        🔗 <span className="text-sm">Compartilhar</span>
      </button>
      <button
        onClick={onPrint}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        📄 <span className="text-sm">PDF</span>
      </button>
      <button
        onClick={onSubmit}
        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        🤝 <span className="text-sm">Compartilhar taxa</span>
      </button>
    </div>
  );
}
