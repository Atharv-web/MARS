import type { ReportRecord } from "@/types/report";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Fetch the most recent reports for the history view on /app. */
export async function getReports(): Promise<ReportRecord[]> {
  const data = await fetchJson<{ reports: ReportRecord[] }>("/api/reports");
  return data.reports ?? [];
}
