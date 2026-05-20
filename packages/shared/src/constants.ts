export const FALLBACK_EXCHANGE_RATE = 5.57;
export const EXCHANGE_RATE_CACHE_KEY = "exchange-rate:usd-brl";
export const EXCHANGE_RATE_TTL_SECONDS = 600;

export const RATE_MULTIPLIERS = {
  regular: 1.0,
  revision: 1.25,
  rush: 1.5,
  difficult: 2.0,
} as const;
