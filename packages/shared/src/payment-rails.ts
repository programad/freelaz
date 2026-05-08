export const PAYMENT_RAILS = {
  direct: {
    label: "Direto (PIX/TED)",
    feePercent: 0,
    hint: "Cliente paga em BRL diretamente. Sem custo de processamento.",
  },
  wise: {
    label: "Wise",
    feePercent: 0.7,
    hint: "Conversão e recebimento via Wise. Spread + tarifa fixa pequena.",
  },
  payoneer: {
    label: "Payoneer",
    feePercent: 1.5,
    hint: "Cartão Payoneer + saque local. Combinação de tarifa de saque e câmbio.",
  },
  deel: {
    label: "Deel",
    feePercent: 3,
    hint: "Plataforma full-service de contratos. Tarifa típica para freelancer.",
  },
  stripe: {
    label: "Stripe",
    feePercent: 3.4,
    hint: "Cobrança direta no cartão do cliente + conversão.",
  },
  paypal: {
    label: "PayPal",
    feePercent: 4.5,
    hint: "Recebimento internacional com câmbio do PayPal.",
  },
} as const;

export type PaymentRailKey = keyof typeof PAYMENT_RAILS;

export const PAYMENT_RAIL_KEYS: readonly PaymentRailKey[] = [
  "direct",
  "wise",
  "payoneer",
  "deel",
  "stripe",
  "paypal",
];
