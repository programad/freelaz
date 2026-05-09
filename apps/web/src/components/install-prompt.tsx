import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "freelaz:installPromptDismissedAt";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(
      localStorage.getItem(DISMISSED_KEY) || "0"
    );
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  const handleInstall = async () => {
    await event.prompt();
    await event.userChoice;
    setVisible(false);
    setEvent(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl no-print">
      <div className="text-sm text-gray-200 mb-2">
        📲 Instale o Freelaz para acesso rápido offline.
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-gray-400 text-sm hover:text-gray-200"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
