"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ReportView from "@/components/ReportView";
import StreamLoader from "@/components/StreamLoader";
import { API_BASE_URL, fetchJson } from "@/lib/api";
import { downloadReportPdf } from "@/lib/pdf";
import type { ReportRecord } from "@/types/report";

type StreamEvent =
  | { type: "status"; stage: string; message: string }
  | { type: "markdown_delta"; chunk: string }
  | { type: "report_ready"; reportId: string }
  | { type: "error"; message: string };

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [streamingMarkdown, setStreamingMarkdown] = useState("");
  const [stage, setStage] = useState("queued");
  const [statusMessage, setStatusMessage] = useState("Preparing your report.");
  const [error, setError] = useState<string | null>(null);

  async function loadReport(): Promise<ReportRecord | null> {
    try {
      const data = await fetchJson<ReportRecord>(`/api/reports/${reportId}`);
      setReport(data);
      setStage(data.status);
      if (data.errorMessage) {
        setError(data.errorMessage);
      }
      return data;
    } catch {
      setError("We couldn't load this report. It may not exist or the service is unavailable.");
      return null;
    }
  }

  useEffect(() => {
    void loadReport();
  }, [reportId]);

  useEffect(() => {
    if (!reportId) {
      return;
    }

    let finished = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    // If the SSE stream drops mid-run (proxy buffering, idle timeout, network
    // blip), fall back to polling the snapshot so progress isn't lost silently.
    function startPolling() {
      if (poll) {
        return;
      }
      poll = setInterval(async () => {
        const data = await loadReport();
        if (data && (data.status === "completed" || data.status === "failed")) {
          finished = true;
          if (poll) {
            clearInterval(poll);
            poll = null;
          }
        }
      }, 4000);
    }

    const source = new EventSource(
      `${API_BASE_URL}/api/research/${reportId}/stream`,
    );

    source.onmessage = (event) => {
      let payload: StreamEvent;
      try {
        payload = JSON.parse(event.data) as StreamEvent;
      } catch {
        return;
      }

      if (payload.type === "status") {
        setStage(payload.stage);
        setStatusMessage(payload.message);
        return;
      }

      if (payload.type === "markdown_delta") {
        setStreamingMarkdown((current) => current + payload.chunk);
        return;
      }

      if (payload.type === "report_ready") {
        finished = true;
        void loadReport();
        source.close();
        return;
      }

      if (payload.type === "error") {
        finished = true;
        setError(payload.message);
        source.close();
      }
    };

    source.onerror = () => {
      source.close();
      if (!finished) {
        startPolling();
      }
    };

    return () => {
      source.close();
      if (poll) {
        clearInterval(poll);
      }
    };
  }, [reportId]);

  const isStreaming = useMemo(
    () => report?.status !== "completed" && !error,
    [error, report?.status],
  );

  function handleDownloadPdf() {
    if (report) {
      downloadReportPdf(report);
    }
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="rounded-[32px] border border-red-400/20 bg-red-500/8 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-red-200/70">Error</p>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
            The report could not be completed
          </h1>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">{error}</p>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
        <StreamLoader stage={stage} message="Loading report shell." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-14">
      <div className="space-y-8">
        {isStreaming ? (
          <StreamLoader stage={stage} message={statusMessage} />
        ) : null}
        <ReportView
          report={report}
          streamingMarkdown={streamingMarkdown}
          onDownloadPdf={handleDownloadPdf}
        />
      </div>
    </main>
  );
}
