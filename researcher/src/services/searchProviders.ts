import { openai } from "./openai.js";
import { config } from "../config.js";
import type { ResearchProviderResult, SourceItem } from "../types.js";
import { safeJsonParse } from "../utils.js";

/**
 * fetch with a hard timeout. A hung provider should never stall the whole
 * pipeline, so every outbound request is bounded by an AbortController.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = config.providerTimeoutMs,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Throw a descriptive error on non-2xx responses. Without this, a 401/429
 * silently parses into an empty result and the report looks "successful"
 * while being grounded on nothing.
 */
async function ensureOk(response: Response, provider: string): Promise<void> {
  if (response.ok) {
    return;
  }
  const body = await response.text().catch(() => "");
  throw new Error(
    `${provider} request failed (${response.status} ${response.statusText}) ${body.slice(0, 200)}`.trim(),
  );
}

async function collectFromSerper(topic: string): Promise<ResearchProviderResult> {
  // Run both in parallel for latency, but isolate the image fetch: a timeout or
  // rejection on the nice-to-have image endpoint must never discard good search
  // results (Promise.all would reject before we can read the search response).
  const [searchSettled, imageSettled] = await Promise.allSettled([
    fetchWithTimeout("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": config.serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: topic, gl: "us", hl: "en", num: 8 }),
    }),
    fetchWithTimeout("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": config.serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: topic, gl: "us", hl: "en", num: 6 }),
    }),
  ]);

  if (searchSettled.status === "rejected") {
    throw searchSettled.reason;
  }

  const searchResponse = searchSettled.value;
  await ensureOk(searchResponse, "serper");

  const searchJson = await searchResponse.json();
  // Images are a nice-to-have; never fail the provider over them.
  const imageJson =
    imageSettled.status === "fulfilled" && imageSettled.value.ok
      ? await imageSettled.value.json()
      : { images: [] };

  const sources: SourceItem[] = (searchJson.organic ?? []).map(
    (item: Record<string, string>) => ({
      title: item.title ?? "Untitled result",
      url: item.link ?? "",
      snippet: item.snippet ?? "",
      provider: "serper",
      publishedAt: item.date ?? null,
    }),
  );

  return {
    provider: "serper",
    summary:
      searchJson.answerBox?.snippet ??
      searchJson.knowledgeGraph?.description ??
      "Serper returned web search results and images.",
    sources,
    images: (imageJson.images ?? []).map((item: Record<string, string>) => ({
      title: item.title ?? "Reference image",
      imageUrl: item.imageUrl ?? "",
      sourceUrl: item.link ?? "",
      provider: "serper",
    })),
  };
}

async function collectFromTavily(topic: string): Promise<ResearchProviderResult> {
  const response = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.tavilyApiKey,
      query: topic,
      search_depth: "advanced",
      include_answer: true,
      include_images: false,
      max_results: 8,
    }),
  });

  await ensureOk(response, "tavily");

  const json = await response.json();
  const sources: SourceItem[] = (json.results ?? []).map(
    (item: Record<string, string>) => ({
      title: item.title ?? "Untitled result",
      url: item.url ?? "",
      snippet: item.content ?? "",
      provider: "tavily",
      publishedAt: item.published_date ?? null,
    }),
  );

  return {
    provider: "tavily",
    summary: json.answer ?? "Tavily returned grounded search results.",
    sources,
  };
}

async function collectFromPerplexity(topic: string): Promise<ResearchProviderResult> {
  const response = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.perplexityApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.perplexityModel,
      messages: [
        {
          role: "system",
          content: "You are a factual research assistant. Be concise and cite sources.",
        },
        {
          role: "user",
          content: `Research this topic with citations and plain-English findings: ${topic}`,
        },
      ],
    }),
  });

  await ensureOk(response, "perplexity");

  const json = await response.json();
  const message = json.choices?.[0]?.message?.content ?? "";
  // Citation shape is version-dependent: newer Perplexity models return
  // `search_results` (objects with url/title) instead of a flat `citations`
  // string array. Support both so we don't end up with zero sources.
  const sources: SourceItem[] = Array.isArray(json.search_results)
    ? (json.search_results as Array<Record<string, string>>)
        .map((item, index) => ({
          title: item.title ?? `Perplexity citation ${index + 1}`,
          url: item.url ?? "",
          snippet: "Source cited by Perplexity in its grounded answer.",
          provider: "perplexity" as const,
        }))
        .filter((source) => source.url)
    : ((json.citations as string[]) ?? []).map((url, index) => ({
        title: `Perplexity citation ${index + 1}`,
        url,
        snippet: "Source cited by Perplexity in its grounded answer.",
        provider: "perplexity" as const,
      }));

  return {
    provider: "perplexity",
    summary: message,
    sources,
  };
}

/**
 * Real Parallel AI Search API: returns ranked web URLs with grounded excerpts.
 * This gives MARS a fourth stream of actual cited sources. If no key is set or
 * the call fails, we fall back to an OpenAI research map so the topic still gets
 * an analytical lens ("use OpenAI if necessary").
 */
async function collectFromParallelAi(topic: string): Promise<ResearchProviderResult> {
  if (config.parallelApiKey) {
    try {
      // Per docs.parallel.ai/api-reference/search/search
      const response = await fetchWithTimeout("https://api.parallel.ai/v1/search", {
        method: "POST",
        headers: {
          "x-api-key": config.parallelApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective: `Find authoritative, factual, recent sources about: ${topic}`,
          search_queries: [topic],
          mode: config.parallelMode,
        }),
      });

      await ensureOk(response, "parallel_ai");

      const json = await response.json();
      const results: Array<Record<string, unknown>> = json.results ?? [];
      const sources: SourceItem[] = results
        .map((item) => {
          const excerpts = item.excerpts;
          const snippet = Array.isArray(excerpts)
            ? (excerpts as string[]).join(" … ")
            : "";
          return {
            title: typeof item.title === "string" ? item.title : "Parallel AI result",
            url: typeof item.url === "string" ? item.url : "",
            snippet,
            provider: "parallel_ai" as const,
            publishedAt:
              typeof item.publish_date === "string" ? item.publish_date : null,
          };
        })
        .filter((source) => source.url);

      return {
        provider: "parallel_ai",
        summary: `Parallel AI returned ${sources.length} grounded web sources with extracted excerpts.`,
        sources,
      };
    } catch {
      // Fall through to the OpenAI research map below.
    }
  }

  return collectParallelResearchMap(topic);
}

/** OpenAI fallback: an analytical research map when Parallel AI is unavailable. */
async function collectParallelResearchMap(topic: string): Promise<ResearchProviderResult> {
  const completion = await openai.chat.completions.create({
    model: config.openAiModel,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict research planner. Do not present unverified facts as true. Return research angles, subtopics, likely claims to verify, and missing-data questions. JSON only.",
      },
      {
        role: "user",
        content: `Create a research map for this topic: ${topic}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  const parsed = safeJsonParse<Record<string, unknown>>(content, {});

  return {
    provider: "parallel_ai",
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : "Parallel AI generated a verification-first research map.",
    sources: [],
  };
}

export async function collectAllProviders(
  topic: string,
): Promise<ResearchProviderResult[]> {
  const settled = await Promise.allSettled([
    collectFromSerper(topic),
    collectFromTavily(topic),
    collectFromPerplexity(topic),
    collectFromParallelAi(topic),
  ]);

  const fulfilled = settled
    .filter(
      (item): item is PromiseFulfilledResult<ResearchProviderResult> =>
        item.status === "fulfilled",
    )
    .map((item) => item.value);

  if (fulfilled.length === 0) {
    const rejectedMessages = settled
      .filter((item): item is PromiseRejectedResult => item.status === "rejected")
      .map((item) =>
        item.reason instanceof Error ? item.reason.message : String(item.reason),
      );

    throw new Error(`All research providers failed. ${rejectedMessages.join(" | ")}`);
  }

  return fulfilled;
}
