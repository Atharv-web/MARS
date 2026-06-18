"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <div className="rounded-[32px] border border-red-400/20 bg-red-500/8 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-red-200/70">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
          This view hit an unexpected error
        </h1>
        <p className="mt-4 leading-7 text-[var(--text-secondary)]">
          The page failed to render. You can try again, and if it keeps
          happening the report may be malformed.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--button-text)] transition-all hover:bg-[var(--button-hover)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
