export type SourceItem = {
  title: string;
  url: string;
  snippet: string;
  provider: "serper" | "tavily" | "perplexity" | "parallel_ai";
  publishedAt?: string | null;
  credibility?: string;
};

export type ImageItem = {
  title: string;
  imageUrl: string;
  sourceUrl?: string;
  provider: "serper";
};

export type ChartSpec = {
  title: string;
  description: string;
  xKey: string;
  yKey: string;
  kind: "bar" | "line";
  data: Record<string, string | number>[];
};

export type ReportRecord = {
  id: string;
  topic: string;
  slug: string;
  status:
    | "queued"
    | "collecting"
    | "verifying"
    | "synthesizing"
    | "completed"
    | "failed";
  executiveSummary: string | null;
  markdown: string | null;
  keyFindings: string[];
  deepInsights: string[];
  charts: ChartSpec[];
  sources: SourceItem[];
  images: ImageItem[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};
