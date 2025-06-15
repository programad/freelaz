import { useEffect, useCallback } from "react";

export interface FreelazConfig {
  profession: string;
  state: string;
  experienceLevel: string;
  monthlyExpenses: number;
  savingsPercent: number;
  extraPercent: number;
  taxPercent: number;
  workHours: number;
  workDays: number;
  vacationDays: number;
}

export const useLocalStorageConfig = (
  config: FreelazConfig,
  onLoad?: (config: FreelazConfig) => void,
  onError?: (error: Error) => void
) => {
  // Load configuration from localStorage
  const loadConfig = useCallback(() => {
    try {
      const savedConfig = localStorage.getItem("freelazConfig");
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig) as FreelazConfig;
        onLoad?.(parsedConfig);
        return parsedConfig;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      console.error("Failed to load saved configuration:", err);
      onError?.(err);
    }
    return null;
  }, [onLoad, onError]);

  // Save configuration to localStorage
  const saveConfig = useCallback(
    (configToSave: FreelazConfig = config) => {
      try {
        localStorage.setItem("freelazConfig", JSON.stringify(configToSave));
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        console.error("Failed to save configuration:", err);
        onError?.(err);
        return false;
      }
    },
    [config, onError]
  );

  // Clear saved configuration
  const clearConfig = useCallback(() => {
    try {
      localStorage.removeItem("freelazConfig");
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      console.error("Failed to clear configuration:", err);
      onError?.(err);
      return false;
    }
  }, [onError]);

  // Check if configuration exists
  const hasConfig = () => {
    return localStorage.getItem("freelazConfig") !== null;
  };

  return {
    loadConfig,
    saveConfig,
    clearConfig,
    hasConfig,
  };
};
