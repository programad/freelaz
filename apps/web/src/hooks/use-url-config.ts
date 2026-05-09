import { useEffect, useRef } from "react";

type Primitive = string | number;

const PARAM_KEYS: Record<string, "string" | "number"> = {
  profession: "string",
  state: "string",
  exp: "string",
  expenses: "number",
  savings: "number",
  extras: "number",
  hours: "number",
  days: "number",
  vacation: "number",
  city: "string",
  country: "string",
  regime: "string",
  rail: "string",
};

export type UrlConfig = Partial<Record<keyof typeof PARAM_KEYS, Primitive>>;

export const readUrlConfig = (): UrlConfig => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const result: UrlConfig = {};
  for (const [key, type] of Object.entries(PARAM_KEYS)) {
    const value = params.get(key);
    if (value === null || value === "") continue;
    if (type === "number") {
      const n = Number(value);
      if (Number.isFinite(n)) result[key as keyof UrlConfig] = n;
    } else {
      result[key as keyof UrlConfig] = value;
    }
  }
  return result;
};

export const useUrlConfigSync = (config: UrlConfig, debounceMs = 300) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(config)) {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      const newUrl =
        window.location.pathname + (query ? `?${query}` : "") + window.location.hash;
      window.history.replaceState(null, "", newUrl);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [JSON.stringify(config), debounceMs]);
};
