import { ArrowUpRight } from "lucide-react";
import { providerMeta } from "@/lib/providers";
import type { ReportRecord } from "@/types/report";

type SourceListProps = {
  sources: ReportRecord["sources"];
};

export default function SourceList({ sources }: SourceListProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Sources
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          What the report was grounded on
        </h2>
      </div>
      <div className="grid gap-3">
        {sources.map((source, index) => {
          const meta = providerMeta(source.provider);
          return (
            <a
              key={`${source.provider}-${source.url}`}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card group relative overflow-hidden rounded-3xl p-5"
            >
              <span
                className="absolute inset-y-0 left-0 w-[3px]"
                style={{ background: meta.color }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs tabular-nums text-[var(--text-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    color: meta.color,
                    background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
                {source.publishedAt ? (
                  <span className="text-xs text-[var(--text-muted)]">
                    {source.publishedAt}
                  </span>
                ) : null}
                <ArrowUpRight className="ml-auto size-4 text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-primary)]" />
              </div>
              <h3 className="mt-3 text-[17px] font-medium leading-snug text-[var(--text-primary)]">
                {source.title}
              </h3>
              {source.snippet ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {source.snippet}
                </p>
              ) : null}
              <p className="mt-3 truncate text-xs text-[var(--text-muted)]">
                {source.url}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
