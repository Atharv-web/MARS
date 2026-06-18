"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { getReports } from "@/lib/api";
import type { ReportRecord } from "@/types/report";

const STATUS_COLOR: Record<string, string> = {
  completed: "#4dd9ac",
  failed: "#ff6c8a",
  queued: "#98a2b8",
  collecting: "#6c7eff",
  verifying: "#6c7eff",
  synthesizing: "#e8a24a",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function RecentReports() {
  const [reports, setReports] = useState<ReportRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    function refresh() {
      getReports()
        .then((data) => setReports(data))
        .catch(() => setFailed(true));
    }

    refresh();
    // In-progress reports change status server-side; refresh when the user
    // returns to the tab so statuses don't stay stale until a manual reload.
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  if (failed) {
    return null;
  }

  return (
    <section className="mx-auto mt-20 w-full max-w-3xl px-1">
      <div className="mb-5 flex items-center gap-2 text-[var(--text-muted)]">
        <Clock className="size-4" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          Recent research
        </p>
      </div>

      {reports === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="shimmer h-[68px] rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="glass rounded-2xl px-5 py-8 text-center text-sm text-[var(--text-muted)]">
          No reports yet. Your research history will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.slice(0, 8).map((report, index) => {
            const color = STATUS_COLOR[report.status] ?? "#98a2b8";
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <Link
                  href={`/report/${report.id}`}
                  className="glass-card group flex items-center gap-4 rounded-2xl px-5 py-4"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-[var(--text-primary)]">
                      {report.topic}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      <span className="capitalize" style={{ color }}>
                        {report.status}
                      </span>
                      {" · "}
                      {relativeTime(report.createdAt)}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-primary)]" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
