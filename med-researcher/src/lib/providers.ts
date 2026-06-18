import type { SourceItem } from "@/types/report";

type ProviderName = SourceItem["provider"];

type ProviderMeta = {
  label: string;
  color: string;
};

/** Single source of truth for how each research provider is labelled + tinted. */
export const PROVIDER_META: Record<ProviderName, ProviderMeta> = {
  perplexity: { label: "Perplexity", color: "#6c7eff" },
  tavily: { label: "Tavily", color: "#4dd9ac" },
  serper: { label: "Serper", color: "#e8a24a" },
  parallel_ai: { label: "Parallel AI", color: "#e06cff" },
};

export function providerMeta(provider: string): ProviderMeta {
  return (
    PROVIDER_META[provider as ProviderName] ?? { label: provider, color: "#8aa0c8" }
  );
}
