/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AGENT_ID: string
  readonly VITE_USER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
