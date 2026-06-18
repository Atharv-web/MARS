"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft, FileDown, Lightbulb, ScrollText, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { ReportRecord } from "@/types/report";
import DataChart from "./DataChart";
import ImageGrid from "./ImageGrid";
import SourceList from "./SourceList";
import StatCard from "./StatCard";

type ReportViewProps = {
  report: ReportRecord;
  streamingMarkdown: string;
  onDownloadPdf: () => void;
};

export default function ReportView({
  report,
  streamingMarkdown,
  onDownloadPdf,
}: ReportViewProps) {
  const markdown = report.markdown ?? streamingMarkdown;
  const wordCount = markdown
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;

  const isComplete = report.status === "completed";

  return (
    <div className="space-y-8">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="size-4" />
        New research
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Research report
          </p>
          <h1 className="mt-3 max-w-4xl font-[family:var(--font-cormorant)] text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
            {report.topic}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            {report.executiveSummary ??
              "The report is still being synthesized. Live sections will appear below as they are generated."}
          </p>
        </div>
        <button
          onClick={onDownloadPdf}
          disabled={!isComplete}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--button-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--button-text)] transition-all hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileDown className="size-4" />
          Download PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Sources"
          value={String(report.sources.length)}
          detail="Deduplicated links retained after the verification pass."
          accent="#6c7eff"
        />
        <StatCard
          label="Charts"
          value={String(report.charts.length)}
          detail="Only rendered when grounded numeric data was extracted."
          accent="#4dd9ac"
        />
        <StatCard
          label="Words"
          value={String(wordCount)}
          detail="Live markdown count while the report streams in."
          accent="#e8a24a"
        />
      </div>

      {report.keyFindings.length ? (
        <div className="glass rounded-3xl p-6 md:p-7">
          <div className="mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <Lightbulb className="size-4 text-[var(--accent-amber)]" />
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Key findings
            </span>
          </div>
          <ul className="space-y-2.5">
            {report.keyFindings.map((finding, index) => (
              <li key={`${index}-${finding}`} className="flex gap-3 text-[15px] leading-7 text-[var(--text-secondary)]">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--accent-indigo)]" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[32px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:p-10"
      >
        <div className="mb-8 flex items-center gap-3 text-[var(--text-primary)]">
          <ScrollText className="size-5" />
          <span className="text-sm">Full report</span>
        </div>
        <article className="markdown-content max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          {!isComplete ? (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[var(--accent-indigo)] align-middle" />
          ) : null}
        </article>
      </motion.div>

      {report.charts.length ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Data &amp; Stats
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Extracted metrics worth looking at
            </h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {report.charts.map((chart, index) => (
              <DataChart key={`${index}-${chart.title}`} {...chart} />
            ))}
          </div>
        </section>
      ) : null}

      {report.deepInsights.length ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Deep insights
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Cross-source takeaways
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {report.deepInsights.map((insight, index) => (
              <div
                key={`${index}-${insight}`}
                className="glass-card rounded-3xl p-5 text-[15px] leading-7 text-[var(--text-secondary)]"
              >
                {insight}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ImageGrid images={report.images} />
      <SourceList sources={report.sources} />

      <div className="glass rounded-3xl p-5 text-sm text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <ShieldCheck className="size-4 text-[var(--accent-teal)]" />
          Accuracy note
        </div>
        <p className="mt-2 leading-6">
          This app collects raw search evidence first, then uses AI to cross-check and
          write the report. It is designed to reduce made-up claims, not magically remove
          them. For anything high stakes, always open the cited sources yourself.
        </p>
      </div>
    </div>
  );
}
