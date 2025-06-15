import { useEffect } from "react";
import { Toast } from "../hooks/use-toast";

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    // Handle ESC key to close toast
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRemove(toast.id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toast.id, onRemove]);

  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-400 text-green-800";
      case "error":
        return "bg-red-100 border-red-400 text-red-800";
      case "warning":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "info":
      default:
        return "bg-blue-100 border-blue-400 text-blue-800";
    }
  };

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`
        ${getToastStyles(toast.type)}
        border rounded-lg p-4 shadow-lg 
        max-w-sm w-full
        animate-in slide-in-from-right-full duration-300
        hover:shadow-xl transition-shadow
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {getIcon(toast.type)}
          </span>
          <p className="text-sm font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
          aria-label="Fechar notificação"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
