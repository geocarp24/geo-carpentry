#!/usr/bin/env node
/**
 * El Cronista — decides what content is worth writing, from real Search Console data.
 *
 * The site already has ~90 indexable pages. The failure mode here is not too
 * little content, it is content nobody links to and nobody searches for. So this
 * agent's first job is to say NO: if a page already ranks for a query, it reports
 * "improve that page" and refuses to create a competitor for it.
 *
 * Pipeline position:
 *   Cronista (this) -> Content_Queue status=Review -> human/oraculo gate
 *   -> escriba (Eli) publishes to WordPress
 *
 * It never publishes. It never sets ready_to_publish.
 *
 * Usage:
 *   node agents/cronista/cronista.mjs --tenant geo-carpentry [--dry-run] [--max N]
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = "/opt/alex-bot";
const ENV_PATH = path.join(ROOT, ".env");
const SITE = "https://geocarpentry.com/";

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(n);
  return i === -1 ? d : args[i + 1];
};
const TENANT = flag("--tenant", "geo-carpentry");
const DRY = args.includes("--dry-run");
const MAX = Number(flag("--max", "3"));

// Thresholds. A query below these is noise, not an opportunity.
const MIN_IMPRESSIONS = 8;   // fewer than this over 90 days is not a signal
const ALREADY_RANKING = 20;  // position <= this means a page exists and works

const env = Object.fromEntries(
  fs.readFileSync(ENV_PATH, "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "agents/tenants", `${TENANT}.json`), "utf8"));
const log = (...a) => console.log(...a);

/* ---------------------------------------------------------------- Search Console */

async function gscToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GBP_CLIENT_ID_GEO,
      client_secret: env.GBP_CLIENT_SECRET_GEO,
      refresh_token: env.GSC_REFRESH_TOKEN_GEO,
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`Search Console: no access token (${j.error || "?"})`);
  return j.access_token;
}

async function gscQuery(token, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).rows || [];
}

/* ------------------------------------------------------------------------ Airtable */

const AT_BASE = "appAQpveuAec077jF";
const AT_TABLE = "tblpiN42pK3YFxGEW"; // Content_Queue

async function airtable(method, pathPart, body) {
  const res = await fetch(`https://api.airtable.com/v0/${AT_BASE}/${pathPart}`, {
    method,
    headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN_GEO}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  // Airtable failing silently is a known problem in this repo. Never swallow it.
  if (!res.ok) throw new Error(`Airtable ${res.status} on ${pathPart}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function existingKeywords() {
  const seen = new Set();
  let offset;
  do {
    const q = new URLSearchParams({ pageSize: "100", "fields[]": "target_keyword" });
    if (offset) q.set("offset", offset);
    const j = await airtable("GET", `${AT_TABLE}?${q}`);
    for (const r of j.records) {
      const k = (r.fields.target_keyword || "").trim().toLowerCase();
      if (k) seen.add(k);
    }
    offset = j.offset;
  } while (offset);
  return seen;
}

/* --------------------------------------------------------------------- Site pages */

async function sitemapUrls() {
  const idx = await (await fetch(`${SITE}sitemap_index.xml`)).text();
  const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set();
  for (const m of maps) {
    const xml = await (await fetch(m)).text();
    for (const u of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(u[1]);
  }
  return urls;
}

/* ------------------------------------------------------------------ Classification */

function isBranded(q) {
  return /geo\s*carpentry|geocarpentry/i.test(q);
}

/**
 * Work Geo Carpentry does not do. Writing for these would mean promising
 * something the business cannot deliver, which is worse than not ranking.
 * See memoria.md section 1.
 */
const OUT_OF_SCOPE = [
  // Commercial construction IS in scope. Jorge corrected this on 2026-08-18;
  // memoria.md had it wrong and the error was suppressing real queries like
  // 'commercial carpentry contractors green bay' (16 impressions, position 20).
  /industrial/i,   // still unconfirmed, ask before claiming it
  /custom cabinet/i,
  /cabinet (maker|shop|making)/i,
];

/** Junk Google matched by accident. "green sea" is not a market we serve. */
const NOT_OUR_MARKET = [/green sea/i, /williams bay/i];

const SERVICE_TERMS = {
  "kitchen-remodeling": [/kitchen/i],
  "bathroom-remodeling": [/bath/i],
  "deck-building": [/deck/i],
  "finish-carpentry": [/carpentry|trim|molding|baseboard/i],
  "home-renovation": [/renovation|remodel(ing)? (my |our )?home|whole home/i],
  "general-construction": [/general contractor|construction|addition|framing/i],
};
const CITY_TERMS = {
  "green-bay": /green ?bay/i,
  appleton: /appleton/i,
  oshkosh: /oshkosh/i,
  "de-pere": /de ?pere/i,
  howard: /howard/i,
};

/**
 * Is there already a page built for this query's service and city? If so the
 * answer is to improve that page, never to write a second one that competes
 * with it. This is the guard that keeps the agent from repeating the
 * cannibalisation that six duplicate hub pages already caused.
 */
function existingTargetPage(query, urls) {
  for (const [service, pats] of Object.entries(SERVICE_TERMS)) {
    if (!pats.some((re) => re.test(query))) continue;
    for (const [city, cityRe] of Object.entries(CITY_TERMS)) {
      if (!cityRe.test(query)) continue;
      const u = `${SITE}${service}/${city}-wi/`;
      if (urls.has(u)) return u;
    }
    const hub = [...urls].find((u) => u.includes(`/services/`) && pats.some((re) => re.test(u)));
    if (hub) return hub;
  }
  return null;
}

/**
 * Split queries into the ones worth a new article and the ones where an existing
 * page should be improved instead. The second list is usually the valuable one.
 */
function classify(queryRows, queryPageRows, urls) {
  const pageFor = new Map();
  for (const r of queryPageRows) {
    const [q, page] = r.keys;
    const prev = pageFor.get(q);
    if (!prev || r.impressions > prev.impressions) pageFor.set(q, { page, ...r });
  }

  const improve = [];
  const create = [];
  for (const r of queryRows) {
    const q = r.keys[0];
    if (r.impressions < MIN_IMPRESSIONS || isBranded(q)) continue;
    if (OUT_OF_SCOPE.some((re) => re.test(q))) continue;
    if (NOT_OUR_MARKET.some((re) => re.test(q))) continue;

    const owner = pageFor.get(q);
    // A page built for this service and city counts as owning the query even
    // when it ranks badly. Bad ranking is a reason to improve it, not to
    // publish a rival.
    const built = existingTargetPage(q, urls);
    if (built) {
      improve.push({ query: q, impressions: r.impressions, position: r.position, clicks: r.clicks, page: built });
      continue;
    }
    if (owner && r.position <= ALREADY_RANKING) {
      improve.push({ query: q, impressions: r.impressions, position: r.position, clicks: r.clicks, page: owner.page });
    } else {
      create.push({ query: q, impressions: r.impressions, position: r.position, page: owner ? owner.page : null });
    }
  }
  improve.sort((a, b) => b.impressions - a.impressions);
  create.sort((a, b) => b.impressions - a.impressions);
  return { improve, create };
}

/* --------------------------------------------------------------------- Claude call */

// Same invocation shape as posicionador: prompt as a positional argument after
// `--`, stdin closed. Passing it on stdin makes the CLI exit 1 with no stderr.
function runClaude(prompt, timeoutMs = 15 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const child = spawn(cfg.claude.binary_path, [
      "--print",
      "--permission-mode", "acceptEdits",
      "--allowed-tools", "WebFetch,WebSearch,Read,Grep,Glob",
      "--",
      prompt,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("timeout")); }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`claude exit ${code}: ${err.slice(0, 500)}`));
      resolve(out);
    });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
  });
}

function articlePrompt(cand, links) {
  return `You are writing for Geo Carpentry LLC, a licensed general contractor in Green Bay, Wisconsin.
Owner Jorge Cruz, working since 2014, bilingual English and Spanish crew.
Licensed: Dwelling Contractor 823-DCFR, qualifier 1053-DCQ. Fully insured.
Serves Green Bay, Appleton, Oshkosh, De Pere and Howard.

Write an article targeting this search query: "${cand.query}"
It gets ${cand.impressions} impressions over 90 days and the site currently sits at position ${cand.position.toFixed(1)}, so nothing on the site answers it well.

Hard rules:
- Write for a homeowner deciding who to hire, not for a search engine.
- Never invent facts. No made-up prices, project counts, awards, review counts or customer names. If a number would help and you do not have it, describe the range in general terms or leave it out.
- Geo Carpentry does NOT build custom cabinets from scratch. It DOES do commercial construction. Do not claim industrial scale work.
- Plain, warm, direct. No hype. No em dashes. Avoid stacking adjectives in threes.
- 900 to 1400 words.
- Include these internal links naturally in the body, as markdown links:
${links.map((l) => `  - ${l}`).join("\n")}

Return ONLY this, no preamble:

---TITLE---
(under 60 characters, includes the city where it fits naturally)
---SLUG---
(lowercase-hyphenated)
---META---
(under 155 characters)
---BODY---
(markdown, starting with an H2, no H1)
`;
}

function parseArticle(raw) {
  const grab = (tag, next) => {
    const re = new RegExp(`---${tag}---\\s*([\\s\\S]*?)\\s*(?=---${next}---|$)`);
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  return {
    title: grab("TITLE", "SLUG"),
    slug: grab("SLUG", "META"),
    meta: grab("META", "BODY"),
    body: grab("BODY", "ENDOFTEXT"),
  };
}


/* ------------------------------------------------------------- Improvement briefs */

/**
 * When every query with real demand already has a page, the useful output is not
 * another article. It is a specific list of what to change on the pages that
 * already rank, grouped by page so one edit can serve several queries.
 */
async function improvementBriefs(improve) {
  if (!improve.length) return;

  const byPage = new Map();
  for (const r of improve) {
    if (!byPage.has(r.page)) byPage.set(r.page, []);
    byPage.get(r.page).push(r);
  }
  const pages = [...byPage.entries()]
    .map(([page, rows]) => ({
      page,
      rows: rows.sort((a, b) => b.impressions - a.impressions),
      impressions: rows.reduce((n, r) => n + r.impressions, 0),
      best: Math.min(...rows.map((r) => r.position)),
    }))
    .sort((a, b) => b.impressions - a.impressions);

  log(`\n--- PAGINAS A MEJORAR, por impresiones perdidas (${pages.length}) ---\n`);
  for (const p of pages) {
    log(`  ${String(p.impressions).padStart(4)} impr · mejor pos ${p.best.toFixed(1)} · ${p.page.replace("https://geocarpentry.com", "")}`);
    for (const r of p.rows.slice(0, 4)) {
      log(`         "${r.query}" · ${r.impressions} impr · pos ${r.position.toFixed(1)}`);
    }
  }

  if (DRY) { log("\n(dry run: no se generan briefs)\n"); return; }

  const dir = path.join(ROOT, "agents/cronista/briefs");
  fs.mkdirSync(dir, { recursive: true });
  const target = pages.slice(0, MAX);
  log(`\nGenerando ${target.length} brief(s) de mejora.\n`);

  const out = [`# Briefs de mejora · ${new Date().toISOString().slice(0, 10)}`, ""];
  for (const p of target) {
    const lines = p.rows.slice(0, 8)
      .map((r) => `  "${r.query}" — ${r.impressions} impressions, average position ${r.position.toFixed(1)}, ${r.clicks || 0} clicks`)
      .join("\n");
    const prompt = `You are auditing one page of geocarpentry.com for a licensed general contractor in Green Bay, Wisconsin.

Page: ${p.page}
Over the last 90 days Search Console shows it drawing these queries, all stuck off page one:
${lines}

Fetch that page and say what specifically to change so it can reach page one for these queries.

Rules:
- Be concrete. Quote the current title and heading, then write the replacement.
- Never invent facts. No made-up prices, project counts, awards or review numbers.
- Commercial construction is in scope. Industrial scale is not confirmed, so do not claim it. No custom cabinet making from scratch.
- Rank recommendations by expected impact, and say plainly when something will not move without more authority from reviews and links.
- At most 8 recommendations. Fewer is better.

Format as markdown under a heading with the page path.`;
    try {
      const res = await runClaude(prompt);
      out.push(res.trim(), "");
      log(`  BRIEF listo · ${p.page.replace("https://geocarpentry.com", "")}`);
    } catch (e) {
      log(`  FALLO brief ${p.page}: ${e.message}`);
    }
  }
  const file = path.join(dir, `mejoras-${new Date().toISOString().slice(0, 10)}.md`);
  fs.writeFileSync(file, out.join("\n"), "utf8");
  log(`\nBriefs escritos en ${file}\n`);
}

/* ---------------------------------------------------------------------------- Main */

const runId = `cronista-${new Date().toISOString().replace(/[:.]/g, "-")}`;
log(`\n=== El Cronista · ${TENANT} · ${runId}${DRY ? " · DRY RUN" : ""} ===\n`);

const token = await gscToken();
const since = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const range = { startDate: since(90), endDate: since(1) };

const [queries, queryPages] = await Promise.all([
  gscQuery(token, { ...range, dimensions: ["query"], rowLimit: 500 }),
  gscQuery(token, { ...range, dimensions: ["query", "page"], rowLimit: 1000 }),
]);
log(`Search Console: ${queries.length} consultas en 90 dias.`);

const urls = await sitemapUrls();
const { improve, create } = classify(queries, queryPages, urls);

log(`\n--- MEJORAR paginas existentes (${improve.length}) ---`);
log(`Esto vale mas que escribir nuevo: ya hay pagina y ya rankea.\n`);
for (const r of improve.slice(0, 12)) {
  log(`  ${String(r.impressions).padStart(4)} impr · pos ${r.position.toFixed(1).padStart(5)} · ${r.query}`);
  log(`       -> ${r.page.replace("https://geocarpentry.com", "")}`);
}

const known = await existingKeywords();
const fresh = create.filter((c) => !known.has(c.query.toLowerCase()));
log(`\n--- CREAR articulo nuevo (${fresh.length} candidatos, ${create.length - fresh.length} ya en cola) ---\n`);
for (const c of fresh.slice(0, 12)) {
  log(`  ${String(c.impressions).padStart(4)} impr · pos ${c.position.toFixed(1).padStart(5)} · ${c.query}`);
}

if (!fresh.length) {
  log("Nada nuevo que escribir: cada consulta con demanda real ya tiene pagina.");
  await improvementBriefs(improve);
  process.exit(0);
}

const pickLinks = (q) => {
  const words = q.toLowerCase().split(/\s+/);
  const scored = [...urls]
    .filter((u) => /\/services\/|-wi\/$/.test(u))
    .map((u) => ({ u, score: words.filter((w) => w.length > 3 && u.includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const out = scored.slice(0, 3).map((x) => x.u);
  out.push(`${SITE}quote/`);
  return out;
};

const batch = fresh.slice(0, MAX);
log(`\nGenerando ${batch.length} articulo(s).\n`);

let queued = 0;
for (const cand of batch) {
  const links = pickLinks(cand.query);
  const prompt = articlePrompt(cand, links);

  if (DRY) {
    log(`--- DRY RUN · "${cand.query}" ---`);
    log(prompt.slice(0, 700) + "\n...\n");
    continue;
  }

  let art;
  try {
    art = parseArticle(await runClaude(prompt));
  } catch (e) {
    log(`  FALLO generando "${cand.query}": ${e.message}`);
    continue;
  }
  if (!art.title || !art.body || art.body.length < 1500) {
    log(`  DESCARTADO "${cand.query}": salida incompleta (titulo ${art.title.length}, cuerpo ${art.body.length})`);
    continue;
  }

  await airtable("POST", AT_TABLE, {
    records: [{
      fields: {
        run_id: runId,
        tenant_id: TENANT,
        status: "Review",              // never ready_to_publish. A human gates this.
        content_type: "blog_post",
        title: art.title,
        target_keyword: cand.query,
        intent_query: cand.query,
        body_md: art.body,
        meta_description: art.meta,
        slug: art.slug,
        word_count: art.body.split(/\s+/).length,
        suggested_internal_links: links.join("\n"),
        language: "en",
        source_idea_id: `gsc:${cand.impressions}impr:pos${cand.position.toFixed(1)}`,
        run_started_at: new Date().toISOString(),
      },
    }],
  });
  queued++;
  log(`  EN COLA · "${art.title}" (${art.body.split(/\s+/).length} palabras) para "${cand.query}"`);
}

log(`\nListo. ${queued} en Content_Queue con estado Review.`);
log(`Nada se publica solo. Aprobar en Airtable y Eli lo sube.\n`);
