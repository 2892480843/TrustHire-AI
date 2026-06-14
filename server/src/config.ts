import "dotenv/config";

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
// Dev frontends may fall back to 5174 when 5173 is taken, so allow both by default.
const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

function intEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: intEnv("PORT", 3001),
  corsOrigin: (process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGINS.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL,
  openaiModel: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
  openaiTimeoutMs: intEnv("OPENAI_TIMEOUT_MS", 45_000),
  maxUploadBytes: intEnv("MAX_UPLOAD_MB", 8) * 1024 * 1024
} as const;
