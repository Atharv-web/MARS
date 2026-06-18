import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import type { ReportArtifact, ReportRecord, ReportStatus } from "./types.js";
import { safeJsonParse } from "./utils.js";

const databaseFile = path.resolve(process.cwd(), config.databasePath);
fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

const db = new Database(databaseFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL,
    executive_summary TEXT,
    markdown TEXT,
    key_findings_json TEXT NOT NULL DEFAULT '[]',
    deep_insights_json TEXT NOT NULL DEFAULT '[]',
    charts_json TEXT NOT NULL DEFAULT '[]',
    sources_json TEXT NOT NULL DEFAULT '[]',
    images_json TEXT NOT NULL DEFAULT '[]',
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function mapRecord(row: Record<string, unknown>): ReportRecord {
  return {
    id: String(row.id),
    topic: String(row.topic),
    slug: String(row.slug),
    status: row.status as ReportStatus,
    executiveSummary: (row.executive_summary as string | null) ?? null,
    markdown: (row.markdown as string | null) ?? null,
    keyFindings: safeJsonParse<string[]>(row.key_findings_json as string, []),
    deepInsights: safeJsonParse<string[]>(row.deep_insights_json as string, []),
    charts: safeJsonParse(row.charts_json as string, []),
    sources: safeJsonParse(row.sources_json as string, []),
    images: safeJsonParse(row.images_json as string, []),
    errorMessage: (row.error_message as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createReport(topic: string, slug: string): ReportRecord {
  const id = randomUUID();
  const now = new Date().toISOString();

  // slugify() returns "" for topics with no [a-z0-9] characters (pure
  // punctuation or non-Latin scripts). Fall back to the report's own unique id
  // so every report still has a distinct, non-empty slug.
  const finalSlug = slug || `report-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO reports (
      id, topic, slug, status, created_at, updated_at
    ) VALUES (
      @id, @topic, @slug, 'queued', @createdAt, @updatedAt
    )
  `).run({
    id,
    topic,
    slug: finalSlug,
    createdAt: now,
    updatedAt: now,
  });

  return getReport(id)!;
}

export function updateReportStatus(
  id: string,
  status: ReportStatus,
  errorMessage?: string | null,
): void {
  db.prepare(`
    UPDATE reports
    SET status = @status,
        error_message = @errorMessage,
        updated_at = @updatedAt
    WHERE id = @id
  `).run({
    id,
    status,
    errorMessage: errorMessage ?? null,
    updatedAt: new Date().toISOString(),
  });
}

export function completeReport(id: string, artifact: ReportArtifact): void {
  db.prepare(`
    UPDATE reports
    SET status = 'completed',
        executive_summary = @executiveSummary,
        markdown = @markdown,
        key_findings_json = @keyFindings,
        deep_insights_json = @deepInsights,
        charts_json = @charts,
        sources_json = @sources,
        images_json = @images,
        error_message = NULL,
        updated_at = @updatedAt
    WHERE id = @id
  `).run({
    id,
    executiveSummary: artifact.executiveSummary,
    markdown: artifact.markdown,
    keyFindings: JSON.stringify(artifact.keyFindings),
    deepInsights: JSON.stringify(artifact.deepInsights),
    charts: JSON.stringify(artifact.charts),
    sources: JSON.stringify(artifact.sources),
    images: JSON.stringify(artifact.images),
    updatedAt: new Date().toISOString(),
  });
}

export function getReport(id: string): ReportRecord | null {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;

  return row ? mapRecord(row) : null;
}

export function listReports(limit = 20): ReportRecord[] {
  // List view only needs metadata — never fetch markdown or the JSON blobs for
  // every row. Heavy fields are returned empty/null and filled on detail fetch.
  const rows = db
    .prepare(
      `SELECT id, topic, slug, status, executive_summary, error_message,
              created_at, updated_at
       FROM reports ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as Record<string, unknown>[];

  return rows.map(mapRecord);
}

/**
 * On startup, any report still in a non-terminal state is an orphan from a
 * previous process that died mid-run — its in-memory pipeline is gone and no
 * terminal event will ever fire. Mark them failed so clients don't hang.
 */
export function failStaleReports(): number {
  const result = db
    .prepare(
      `UPDATE reports
       SET status = 'failed',
           error_message = @errorMessage,
           updated_at = @updatedAt
       WHERE status IN ('queued', 'collecting', 'verifying', 'synthesizing')`,
    )
    .run({
      errorMessage: "Research was interrupted by a server restart.",
      updatedAt: new Date().toISOString(),
    });

  return result.changes;
}
