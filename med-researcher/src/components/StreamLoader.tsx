"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

type StreamLoaderProps = {
  stage: string;
  message: string;
};

const STAGES = [
  { key: "collecting", label: "Collecting" },
  { key: "verifying", label: "Verifying" },
  { key: "synthesizing", label: "Synthesizing" },
  { key: "completed", label: "Ready" },
] as const;

// Map raw status values to a position on the pipeline.
const ORDER: Record<string, number> = {
  queued: 0,
  collecting: 0,
  verifying: 1,
  synthesizing: 2,
  completed: 3,
};

export default function StreamLoader({ stage, message }: StreamLoaderProps) {
  const activeIndex = ORDER[stage] ?? 0;

  return (
    <div className="glass-strong rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="block size-2 rounded-full bg-[var(--accent-indigo)]"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-[var(--text-primary)]">{message}</p>
      </div>

      <div className="mt-5 flex items-center">
        {STAGES.map((s, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <div key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                    done
                      ? "border-transparent bg-[var(--accent-teal)] text-[#06281f]"
                      : active
                        ? "border-[var(--accent-indigo)] text-[var(--accent-indigo)]"
                        : "border-[var(--surface-border)] text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={[
                    "hidden text-xs font-medium sm:block",
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
              {index < STAGES.length - 1 ? (
                <div className="mx-3 h-px flex-1 bg-[var(--surface-border)]">
                  <div
                    className="h-px bg-[var(--accent-teal)] transition-all duration-500"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
