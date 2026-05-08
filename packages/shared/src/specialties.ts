export const SPECIALTIES = {
  aws: { label: "AWS / Cloud", premium: 10, icon: "☁️" },
  k8s: { label: "Kubernetes", premium: 10, icon: "⚙️" },
  ml: { label: "ML / IA", premium: 15, icon: "🧠" },
  mobile: { label: "Mobile", premium: 8, icon: "📱" },
  security: { label: "Security / Pentest", premium: 15, icon: "🔒" },
  web3: { label: "Web3 / Blockchain", premium: 15, icon: "⛓️" },
  devops: { label: "DevOps", premium: 10, icon: "🚀" },
  data: { label: "Data Engineering", premium: 12, icon: "📊" },
} as const;

export type SpecialtyKey = keyof typeof SPECIALTIES;

export const SPECIALTY_KEYS: readonly SpecialtyKey[] = [
  "aws",
  "k8s",
  "ml",
  "mobile",
  "security",
  "web3",
  "devops",
  "data",
];

export const SPECIALTY_PREMIUM_CAP = 50;

export const sumSpecialtyPremium = (keys: SpecialtyKey[]): number => {
  const total = keys.reduce(
    (sum, key) => sum + (SPECIALTIES[key]?.premium ?? 0),
    0
  );
  return Math.min(total, SPECIALTY_PREMIUM_CAP);
};
