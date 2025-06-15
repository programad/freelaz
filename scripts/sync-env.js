#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_ENV = ".env";
const WEB_ENV = "apps/web/.env";
const API_DEV_VARS = "apps/api/.dev.vars";

function syncEnvFiles() {
  console.log("🔄 Syncing environment variables...");

  // Check if root .env exists
  if (!fs.existsSync(ROOT_ENV)) {
    console.log("⚠️  Root .env file not found. Creating template...");

    const template = `# Freelaz Environment Variables
# Copy this file to .env and fill in your values

# Web App Configuration (VITE_ prefix required for client-side)
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_API_URL=http://localhost:8787

# API Configuration
API_BASE_URL=http://localhost:8787

# Cloudflare (for deployment)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Database (will be set after D1 creation)
# DATABASE_ID=your-d1-database-id

# External APIs
EXCHANGE_RATE_API_KEY=optional-api-key
`;

    fs.writeFileSync(ROOT_ENV, template);
    console.log("✅ Created .env template. Please fill in your values.");
    return;
  }

  // Read root .env
  const rootEnvContent = fs.readFileSync(ROOT_ENV, "utf8");

  // Parse environment variables
  const envVars = {};
  const lines = rootEnvContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    }
  }

  // Create web .env (only VITE_ prefixed variables)
  const webEnvVars = Object.entries(envVars)
    .filter(([key]) => key.startsWith("VITE_"))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  if (webEnvVars) {
    fs.writeFileSync(
      WEB_ENV,
      `# Auto-generated from root .env\n# Do not edit directly - run 'npm run sync-env' instead\n\n${webEnvVars}\n`
    );
    console.log("✅ Synced web app .env");
  }

  // Create API .dev.vars (exclude VITE_ and analytics variables)
  const apiEnvVars = Object.entries(envVars)
    .filter(
      ([key]) =>
        !key.startsWith("VITE_") &&
        !key.includes("ANALYTICS") &&
        !key.includes("CLOUDFLARE") // Cloudflare vars are handled by wrangler.toml
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  if (apiEnvVars) {
    fs.writeFileSync(
      API_DEV_VARS,
      `# Auto-generated from root .env\n# Do not edit directly - run 'npm run sync-env' instead\n# This file is used by Cloudflare Workers for local development\n\n${apiEnvVars}\n`
    );
    console.log("✅ Synced API .dev.vars");
  }

  console.log("🎉 Environment sync complete!");
  console.log(
    "📝 Note: API uses .dev.vars for Cloudflare Workers local development"
  );
}

// Run the sync
syncEnvFiles();
