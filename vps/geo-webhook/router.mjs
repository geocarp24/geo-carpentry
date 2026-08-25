/**
 * router.mjs — maps {tenant, agent} → spawned node process.
 *
 * All agent scripts live under /opt/alex-bot/agents/<agent>/<agent>.mjs.
 * Each script accepts --tenant <slug> and --mode <mode> args.
 *
 * Last updated: 2026-05-29 — Added all 20 agents
 */
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const AGENT_BASE = process.env.AGENT_BASE_PATH || "/opt/alex-bot";

// Allowlist of agent → relative script path
// ── SEO & Content ──────────────────────────────────────────────────────────────
// posicionador  : SEO health + deep audits
// rastreador    : tracks rankings, page speed
// escriba       : content planner + writer
// reescritor    : rewrites/improves existing content
// ── Marketing & Ads ────────────────────────────────────────────────────────────
// mercader      : marketing audit + ad performance
// audit_meta    : Meta ads audit orchestrator
// cazador       : ads audit + optimization
// ── Social Media ───────────────────────────────────────────────────────────────
// social_media  : posts scheduler + publisher
// creativo      : generates creative assets (HTML→PNG via Playwright)
// director      : video production (HeyGen + FFMPEG + Cloudinary)
// ── Lead Gen & CRM ─────────────────────────────────────────────────────────────
// clasificador  : classifies inbound leads
// embajador     : lead nurture + follow-up
// remitente     : sends emails/messages to leads
// foro          : community / forum engagement
// ── Analytics & Intelligence ───────────────────────────────────────────────────
// analista      : business analytics + reporting
// analitico     : data analysis + insights
// espia         : competitor intelligence
// oraculo       : predictions + strategic insights
// ── Operations ─────────────────────────────────────────────────────────────────
// supervisor    : system health + agent orchestration
// auditor       : internal audit + compliance
const AGENT_MAP = {
  // SEO & Content
  posicionador:  "agents/posicionador/posicionador.mjs",
  rastreador:    "agents/rastreador/rastreador.mjs",
  escriba:       "agents/escriba/escriba.mjs",
  reescritor:    "agents/reescritor/reescritor.mjs",
  // Marketing & Ads
  mercader:      "agents/mercader/mercader.mjs",
  audit_meta:    "agents/audit_meta/audit_meta.mjs",
  cazador:       "agents/cazador/cazador.mjs",
  // Social Media
  social_media:  "agents/social_media/social_media.mjs",
  creativo:      "agents/creativo/creativo.mjs",
  director:      "agents/director_v2/director_v2.mjs",
  // Lead Gen & CRM
  clasificador:  "agents/clasificador/clasificador.mjs",
  embajador:     "agents/embajador/embajador.mjs",
  remitente:     "agents/remitente/remitente.mjs",
  foro:          "agents/foro/foro.mjs",
  // Analytics & Intelligence
  analista:      "agents/analista/analista.mjs",
  analitico:     "agents/analitico/analitico.mjs",
  espia:         "agents/espia/espia.mjs",
  oraculo:       "agents/oraculo/oraculo.mjs",
  // Operations
  supervisor:    "agents/supervisor/supervisor.mjs",
  auditor:       "agents/auditor/auditor.mjs",
  // Closing-loop / Remediator agents (added 2026-06-01 by CC)
  atlas:              "agents/atlas/atlas.mjs",
  foreman_seo:        "agents/foreman_seo/foreman_seo.mjs",
  foreman_marketing:  "agents/foreman_marketing/foreman_marketing.mjs",
  // GBP
  nova:          "agents/nova/nova.mjs",
  // Reviews — record-scoped, needs lead_id (added 2026-08-25)
  review_request: "agents/review_request/review_request.mjs",
};

// Agents that act on one Airtable record instead of a tenant-wide batch.
const RECORD_SCOPED = new Set(["review_request"]);
const RECORD_ID_RE = /^rec[A-Za-z0-9]{14}$/;

export async function routeTrigger({ tenant, agent, mode, dry_run, jobId, lead_id }) {
  const rel = AGENT_MAP[agent];
  if (!rel) {
    throw new Error(`Unknown agent: ${agent}`);
  }

  const agentPath = path.join(AGENT_BASE, rel);
  if (!fs.existsSync(agentPath)) {
    throw new Error(`Agent script not found on disk: ${agentPath}`);
  }

  const args = [agentPath, "--tenant", tenant];
  if (mode && mode !== "default") args.push("--mode", mode);
  if (dry_run) args.push("--dry-run");

  // Record-scoped agents get the Airtable record id. Re-validated here even
  // though index.mjs already checks: this value becomes process argv.
  if (RECORD_SCOPED.has(agent)) {
    if (!RECORD_ID_RE.test(lead_id ?? "")) {
      throw new Error(`${agent} requires a valid lead_id (got: ${lead_id ?? "none"})`);
    }
    args.push("--lead-id", lead_id);
  }

  console.log(`[geo-webhook] spawning: node ${args.join(" ")}`);

  // Load /opt/alex-bot/.env into child process env
  const dotenvPath = path.join(AGENT_BASE, ".env");
  const childEnv = { ...process.env };
  if (fs.existsSync(dotenvPath)) {
    const text = fs.readFileSync(dotenvPath, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in childEnv)) childEnv[k] = v;
    }
  }
  childEnv.POSICIONADOR_TRIGGER = "webhook";
  childEnv.MERCADER_TRIGGER = "webhook";
  childEnv.GEO_WEBHOOK_JOB_ID = jobId;
  childEnv.HOME = process.env.HOME || "/root";

  const child = spawn("node", args, {
    cwd: AGENT_BASE,
    env: childEnv,
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  console.log(`[geo-webhook] spawned PID ${child.pid} for job ${jobId}`);
  return { pid: child.pid, jobId };
}
