export type SearchProviderName =
  | "serper"
  | "tavily"
  | "perplexity"
  | "parallel_ai";

export type ReportStatus =
  | "queued"
  | "collecting"
  | "verifying"
  | "synthesizing"
  | "completed"
  | "failed";

export type SourceItem = {
  title: string;
  url: string;
  snippet: string;
  provider: SearchProviderName;
  publishedAt?: string | null;
  credibility?: string;
};

export type ImageItem = {
  title: string;
  imageUrl: string;
  sourceUrl?: string;
  provider: "serper";
};

export type ResearchProviderResult = {
  provider: SearchProviderName;
  summary: string;
  sources: SourceItem[];
  images?: ImageItem[];
};

export type VerifiedFact = {
  claim: string;
  confidence: "high" | "medium" | "low";
  supportingSources: string[];
  notes?: string;
};

export type VerificationResult = {
  verifiedFacts: VerifiedFact[];
  conflicts: Array<{
    topic: string;
    detail: string;
    sourceUrls: string[];
  }>;
  discardedClaims: Array<{
    claim: string;
    reason: string;
  }>;
  credibilityNotes: Array<{
    sourceUrl: string;
    note: string;
  }>;
};

export type ChartSeriesPoint = Record<string, string | number>;

export type ChartSpec = {
  title: string;
  description: string;
  xKey: string;
  yKey: string;
  kind: "bar" | "line";
  data: ChartSeriesPoint[];
};

export type ReportArtifact = {
  executiveSummary: string;
  keyFindings: string[];
  deepInsights: string[];
  markdown: string;
  charts: ChartSpec[];
  sources: SourceItem[];
  images: ImageItem[];
};

export type ReportRecord = {
  id: string;
  topic: string;
  slug: string;
  status: ReportStatus;
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
