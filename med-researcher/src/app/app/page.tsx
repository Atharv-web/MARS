"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import RecentReports from "@/components/RecentReports";

export default function AppPage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-24 pt-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_top,var(--hero-glow-primary)_0%,transparent_62%)]" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 font-[family:var(--font-cormorant)] text-xl font-semibold tracking-[0.07em] text-[var(--text-primary)]"
      >
        M<span className="text-[var(--accent-indigo)]">A</span>RS
      </Link>

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-panel)] px-4 py-[6px]"
        >
          <span className="size-[5px] animate-pulse rounded-full bg-[var(--accent-indigo)]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Four search systems, one report
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="mb-10 max-w-2xl text-balance font-[family:var(--font-cormorant)] text-[2.8rem] font-semibold leading-[1.0] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[3.6rem]"
        >
          What do you want to <em className="italic text-[var(--accent-indigo)]">know</em>?
        </motion.h1>

        <SearchBar />
      </div>

      <RecentReports />
    </main>
  );
}
