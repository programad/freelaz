import { useEffect, useState } from "react";
import {
  formatCurrency,
  professionData,
  stateData,
  TAX_REGIMES,
  type ProfessionKey,
  type StateKey,
  type TaxRegimeKey,
  type ExperienceLevel,
} from "@freelaz/shared";

interface Submission {
  id: string;
  profession: ProfessionKey;
  experienceLevel: ExperienceLevel;
  state: StateKey;
  hourlyRateBRL: number;
  hourlyRateUSD: number;
  taxRegime?: TaxRegimeKey;
  industry?: string;
  yearsExperience?: number;
  notes?: string;
  submittedAt: string;
}

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8787";

const experienceLabel = (k: ExperienceLevel) =>
  ({ junior: "Júnior", pleno: "Pleno", senior: "Sênior", specialist: "Especialista" })[k];

export function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/submissions?limit=100`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as {
          data: Submission[];
          total: number;
        };
        setItems(data.data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Erro ao carregar relatos"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      <main className="max-w-4xl mx-auto">
        <nav className="text-sm text-gray-400 mb-6">
          <a href="/" className="hover:text-white">
            ← Freelaz
          </a>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          🤝 Relatos de Taxas — Freelancers Brasileiros
        </h1>
        <p className="text-gray-300 mb-8">
          Submissões anônimas de freelancers brasileiros sobre suas taxas
          horárias. Use para se posicionar no mercado.{" "}
          <a href="/" className="text-blue-300 underline hover:text-blue-200">
            Compartilhe a sua
          </a>
          .
        </p>

        {loading && (
          <div className="text-gray-400">Carregando relatos...</div>
        )}
        {error && (
          <div className="text-red-300 bg-red-900/30 border border-red-800 rounded-lg p-4">
            {error}
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-gray-400 bg-gray-800 rounded-xl p-6 text-center">
            Ainda não há relatos. Seja o primeiro a contribuir!
          </div>
        )}
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-gray-800 rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-wrap justify-between gap-2 items-baseline">
                <div className="text-sm text-gray-300">
                  <span className="font-semibold text-white">
                    {professionData[item.profession]?.name?.pt ??
                      item.profession}
                  </span>{" "}
                  · {experienceLabel(item.experienceLevel)}
                  {item.yearsExperience !== undefined &&
                    ` · ${item.yearsExperience} anos`}{" "}
                  · {stateData[item.state]?.name ?? item.state}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.submittedAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base">
                <span className="font-bold text-green-400">
                  {formatCurrency(item.hourlyRateBRL)}/h
                </span>
                <span className="font-semibold text-blue-300">
                  {formatCurrency(item.hourlyRateUSD, "USD")}/h
                </span>
                {item.taxRegime && TAX_REGIMES[item.taxRegime] && (
                  <span className="text-sm text-gray-400">
                    Regime: {TAX_REGIMES[item.taxRegime].label}
                  </span>
                )}
                {item.industry && (
                  <span className="text-sm text-gray-400">
                    {item.industry}
                  </span>
                )}
              </div>
              {item.notes && (
                <p className="mt-2 text-sm text-gray-400 italic">
                  "{item.notes}"
                </p>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
