#!/usr/bin/env node
/**
 * geo-webhook — multi-tenant agent trigger receiver.
 *
 * Listens on PORT (default 3001), validates HMAC-SHA256 signature on the
 * raw request body, and spawns the requested agent as a detached node
 * process. Fire-and-forget: HTTP response returns immediately with a jobId;
 * the agent itself runs in the background (minutes), writes results to
 * Airtable, and alerts via Telegram on its own.
 *
 * Per Cowork's HANDOFF_WEBHOOK_FASE2_CLAUDECODE.md spec. Hosted on the
 * ALEX VPS (root@187.77.215.146) as systemd service geo-webhook.service.
 */
import express from "express";
import crypto from "crypto";
import { routeTrigger } from "./router.mjs";

const app = express();

// We need the raw body string for HMAC verification — set up a raw parser
// for application/json that keeps the original buffer alongside parsed JSON.
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  },
}));

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = Number(process.env.PORT) || 3001;

if (!WEBHOOK_SECRET) {
  console.error("[geo-webhook] FATAL: WEBHOOK_SECRET not set");
  process.exit(1);
}

function constantTimeCompare(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function validateHmac(req, res, next) {
  const sig = req.headers["x-webhook-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(401).json({ error: "Missing signature" });
  }
  const raw = req.rawBody ?? JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(raw)
    .digest("hex");
  if (!constantTimeCompare(sig, expected)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  next();
}

// Health check (no auth — used by uptime monitors + Vercel API to probe)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "geo-webhook",
    version: "1.0.0",
    uptime_sec: Math.round(process.uptime()),
  });
});

// Main trigger endpoint
app.post("/trigger", validateHmac, async (req, res) => {
  const { tenant, agent, mode, dry_run, lead_id } = req.body ?? {};
  if (!tenant || !agent) {
    return res.status(400).json({ error: "tenant + agent required" });
  }

  // review_request acts on a single lead. Validate before answering 200: the
  // CRM treats any 200 as sent, and routeTrigger is fire-and-forget, so a bad
  // id would only ever surface in the log.
  if (agent === "review_request" && !/^rec[A-Za-z0-9]{14}$/.test(lead_id ?? "")) {
    return res.status(400).json({ error: "review_request requires a valid lead_id" });
  }

  const jobId = `${tenant}-${agent}-${Date.now()}`;
  console.log(`[geo-webhook] trigger: tenant=${tenant} agent=${agent} mode=${mode ?? "default"} dry_run=${!!dry_run} jobId=${jobId}`);

  // Fire and forget — don't await (agents take 2-20 min)
  routeTrigger({ tenant, agent, mode, dry_run, jobId, lead_id }).catch((err) =>
    console.error(`[geo-webhook] route error: ${err.message}`)
  );

  res.json({ jobId, status: "accepted", tenant, agent, mode: mode ?? null });
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`[geo-webhook] listening on :${PORT}`);
});
