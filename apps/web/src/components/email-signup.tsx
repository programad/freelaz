import { useState } from "react";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8787";

interface EmailSignupProps {
  onSuccess?: (alreadySubscribed: boolean) => void;
  onError?: (message: string) => void;
  source?: string;
}

export function EmailSignup({ onSuccess, onError, source }: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/email-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: source ?? "footer" }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { alreadySubscribed?: boolean };
      setDone(true);
      onSuccess?.(!!data.alreadySubscribed);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Erro ao cadastrar email"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700 rounded-xl p-4 text-center">
        <p className="text-green-200 text-sm">
          ✅ Obrigado! Você receberá novidades quando publicarmos o relatório
          mensal.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800 rounded-xl p-4"
    >
      <p className="text-sm text-gray-200 mb-3 text-center">
        📨 Receba o relatório mensal de mercado para freelancers brasileiros
        (sem spam, cancele quando quiser).
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "..." : "Quero receber"}
        </button>
      </div>
    </form>
  );
}
