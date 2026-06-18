import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "./config.js";
import { createReport, failStaleReports, getReport, listReports } from "./db.js";
import {
  attachResearchStream,
  canStartPipeline,
  runResearchPipeline,
} from "./services/researchPipeline.js";
import { slugify } from "./utils.js";

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
  }),
);
app.use(express.json({ limit: "2mb" }));

// Optional shared-secret guard for the paid pipeline. Enforced only when
// API_TOKEN is configured, so local/dev runs stay frictionless.
function requireApiToken(request: Request, response: Response, next: NextFunction): void {
  if (!config.apiToken) {
    next();
    return;
  }

  const header = request.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== config.apiToken) {
    response.status(401).json({ error: "Unauthorized." });
    return;
  }

  next();
}

// Rate limit the expensive endpoint (paid search + OpenAI calls) per IP.
const researchLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many research requests. Please slow down." },
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "mars-research-backend",
    model: config.openAiModel,
  });
});

app.post("/api/research", researchLimiter, requireApiToken, async (request, response) => {
  const bodySchema = z.object({
    topic: z.string().min(3).max(300),
  });

  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: "Please send a valid research topic.",
      details: parsed.error.flatten(),
    });
    return;
  }

  if (!canStartPipeline()) {
    response.status(429).json({
      error: "The research service is at capacity. Please try again shortly.",
    });
    return;
  }

  const topic = parsed.data.topic.trim();
  const report = createReport(topic, slugify(topic));

  void runResearchPipeline(report.id, topic);

  response.status(202).json({
    reportId: report.id,
    slug: report.slug,
    status: report.status,
  });
});

app.get("/api/research/:reportId/stream", (request, response) => {
  attachResearchStream(request.params.reportId, response);
});

app.get("/api/reports", (_request, response) => {
  response.json({
    reports: listReports(),
  });
});

app.get("/api/reports/:reportId", (request, response) => {
  const report = getReport(request.params.reportId);

  if (!report) {
    response.status(404).json({ error: "Report not found." });
    return;
  }

  response.json(report);
});

const reconciled = failStaleReports();
if (reconciled > 0) {
  console.log(`Marked ${reconciled} interrupted report(s) as failed on startup.`);
}

app.listen(config.port, () => {
  console.log(`MARS backend listening on http://localhost:${config.port}`);
});
