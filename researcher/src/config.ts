import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const isProduction = process.env.NODE_ENV === "production";

// In production the frontend origin must be set explicitly, otherwise CORS
// silently falls back to localhost and blocks the real frontend.
const frontendOrigin = isProduction
  ? requireEnv("FRONTEND_ORIGIN")
  : process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 8000),
  frontendOrigin,
  databasePath: process.env.DATABASE_PATH ?? "data/mars.db",
  openAiApiKey: requireEnv("OPENAI_API_KEY"),
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
  serperApiKey: requireEnv("SERPER_API_KEY"),
  tavilyApiKey: requireEnv("TAVILY_API_KEY"),
  perplexityApiKey: requireEnv("PERPLEXITY_API_KEY"),
  perplexityModel: process.env.PERPLEXITY_MODEL ?? "sonar-pro",
  // Optional: when present, MARS queries the real Parallel AI Search API for
  // grounded web sources. When absent, it falls back to an OpenAI research map.
  parallelApiKey: process.env.PARALLEL_API_KEY ?? "",
  // Parallel Search "mode": turbo | basic | advanced (defaults to advanced).
  parallelMode: process.env.PARALLEL_MODE ?? "advanced",
  // Network safety: how long any single provider may take before we give up.
  providerTimeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS ?? 22000),
  // How long any single OpenAI call may take before we abort it.
  openAiTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS ?? 60000),
  // Optional shared secret. When set, every /api/research request must send
  // `Authorization: Bearer <token>`. Protects the paid pipeline from abuse.
  apiToken: process.env.API_TOKEN ?? "",
  // Cost/DoS guardrails for the expensive research endpoint.
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 20),
  maxConcurrentPipelines: Number(process.env.MAX_CONCURRENT_PIPELINES ?? 4),
};
