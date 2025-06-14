/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ANALYTICS_ID: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
