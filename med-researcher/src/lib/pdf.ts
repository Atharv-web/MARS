import jsPDF from "jspdf";
import { providerMeta } from "@/lib/providers";
import type { ReportRecord } from "@/types/report";

/**
 * Build a clean, text-based PDF directly from the report data.
 *
 * We deliberately do NOT rasterize the DOM (html2canvas): the live UI relies on
 * oklch(), color-mix() and backdrop-filter, which html2canvas cannot parse and
 * which produce broken or blank exports. Rendering from the source data instead
 * yields selectable text, small files, and predictable layout.
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // links -> label
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/`([^`]+)`/g, "$1") // inline code
    .trim();
}

export function downloadReportPdf(report: ReportRecord): void {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxW = pageW - margin * 2;
  let y = margin;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function write(
    text: string,
    opts: { size: number; style?: "normal" | "bold" | "italic"; color?: [number, number, number]; gap?: number },
  ) {
    const { size, style = "normal", color = [30, 36, 50], gap = 6 } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    const lineHeight = size * 1.4;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += gap;
  }

  // ── Header ──
  write("MARS RESEARCH REPORT", { size: 9, style: "bold", color: [108, 126, 255], gap: 4 });
  write(report.topic, { size: 22, style: "bold", color: [17, 20, 27], gap: 10 });

  if (report.executiveSummary) {
    write(report.executiveSummary, { size: 11, style: "italic", color: [70, 83, 106], gap: 14 });
  }

  // ── Body (from markdown) ──
  const markdown = report.markdown ?? "";
  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      y += 4;
      continue;
    }
    if (line.startsWith("### ")) {
      write(stripInlineMarkdown(line.slice(4)), { size: 13, style: "bold", color: [17, 20, 27], gap: 4 });
    } else if (line.startsWith("## ")) {
      y += 6;
      write(stripInlineMarkdown(line.slice(3)), { size: 16, style: "bold", color: [17, 20, 27], gap: 6 });
    } else if (line.startsWith("# ")) {
      write(stripInlineMarkdown(line.slice(2)), { size: 18, style: "bold", color: [17, 20, 27], gap: 6 });
    } else if (/^[-*]\s+/.test(line)) {
      write(`•  ${stripInlineMarkdown(line.replace(/^[-*]\s+/, ""))}`, {
        size: 11,
        color: [55, 65, 84],
        gap: 3,
      });
    } else {
      write(stripInlineMarkdown(line), { size: 11, color: [55, 65, 84], gap: 6 });
    }
  }

  // ── Sources ──
  if (report.sources.length) {
    y += 8;
    write("Sources", { size: 16, style: "bold", color: [17, 20, 27], gap: 8 });
    report.sources.forEach((source, index) => {
      const label = providerMeta(source.provider).label;
      write(`${index + 1}. [${label}] ${source.title}`, {
        size: 10,
        style: "bold",
        color: [40, 48, 66],
        gap: 1,
      });
      write(source.url, { size: 9, color: [108, 126, 255], gap: 6 });
    });
  }

  doc.save(`${report.slug || "mars-report"}.pdf`);
}
