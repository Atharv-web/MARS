"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

type CreateResearchResponse = {
  reportId: string;
  slug: string;
  status: string;
};

const EXAMPLES = [
  "Latest breakthroughs in solid-state batteries",
  "How GLP-1 drugs affect long-term metabolism",
  "State of fusion energy startups in 2026",
];

export default function SearchBar() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startResearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });

      const data = (await response.json()) as
        | CreateResearchResponse
        | { error?: string };
      if (!response.ok || !("reportId" in data)) {
        throw new Error(
          ("error" in data && data.error) || "Could not start research.",
        );
      }

      router.push(`/report/${data.reportId}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not start research.",
      );
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void startResearch(topic);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mx-auto w-full max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="relative">
        {/* focus glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[26px] bg-[radial-gradient(120%_140%_at_50%_0%,rgba(108,126,255,0.45),transparent_70%)] opacity-0 blur-[2px] transition-opacity duration-300"
          style={{ opacity: focused ? 1 : 0 }}
        />
        <div className="glass-strong relative flex flex-col gap-2 rounded-[24px] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 md:px-5">
            <Search
              className="size-5 shrink-0 transition-colors"
              style={{ color: focused ? "var(--accent-indigo)" : "var(--text-muted)" }}
            />
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask MARS to research anything, with real cited sources"
              className="w-full min-w-0 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none md:text-lg"
              disabled={submitting}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !topic.trim()}
            className="group flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[var(--accent-indigo)] px-6 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 md:min-w-36"
          >
            {submitting ? (
              <>
                <span className="size-2 animate-ping rounded-full bg-white" />
                Starting
              </>
            ) : (
              <>
                Research
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-3 text-center text-sm text-[var(--error-text)]">{error}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setTopic(example);
                void startResearch(example);
              }}
              disabled={submitting}
              className="glass-card rounded-full px-3.5 py-1.5 text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              {example}
            </button>
          ))}
      </div>
    </motion.div>
  );
}
