// Data exports
export * from "./profession-data.js";
export * from "./state-data.js";
export { costOfLivingInfo, multiplierExplanation } from "./cost-of-living-info.js";
export * from "./data/location-data.js";

// Utility exports
export * from "./text-utils.js";
export * from "./market-rates.js";
export * from "./i18n.js";
export * from "./insights.js";
export * from "./calculator.js";

// Types (re-export for convenience)
export type { ProfessionKey, ExperienceLevel } from "./profession-data.js";

export type { StateKey } from "./state-data.js";

// No types exported from cost-of-living-info, just data
