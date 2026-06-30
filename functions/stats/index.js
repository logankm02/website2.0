// Password-gated analytics dashboard at /stats. HTTP Basic Auth against the
// STATS_PASSWORD secret, then renders aggregates from D1 as a self-contained
// HTML page (no external deps). Switch window with ?range=24h|7d|30d|all.
import { basicAuth } from "../../analytics/server.js";

const RANGES = {
  "24h": { label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
  "7d": { label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  "30d": { label: "Last 30 days", ms: 30 * 24 * 60 * 60 * 1000 },
  all: { label: "All time", ms: null },
};

// Friendlier names for the section ids the tracker reports.
const SECTION_NAMES = {
  home: "Home / Hero",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  contact: "Contact",
};

export async function onRequestGet({ request, env }) {
  const denied = basicAuth(request, env);
  if (denied) return denied;

  if (!env.DB) {
    return html("<h1>Analytics</h1><p>D1 binding <code>DB</code> is not configured.</p>");
  }

  const url = new URL(request.url);
  const rangeKey = RANGES[url.searchParams.get("range")] ? url.searchParams.get("range") : "7d";
  const cutoff = RANGES[rangeKey].ms == null ? 0 : Date.now() - RANGES[rangeKey].ms;

  const q = async (sql, ...params) => {
    const res = await env.DB.prepare(sql).bind(...params).all();
    return res.results || [];
  };

  const [totals] = await q(
    `SELECT COUNT(*) AS events,
            COUNT(DISTINCT visitor) AS visitors,
            COUNT(DISTINCT session) AS sessions,
            SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS pageviews
       FROM events WHERE ts >= ?`,
    cutoff,
  );

  const pages = await q(
    `SELECT COALESCE(path,'(none)') AS k, COUNT(*) AS c
       FROM events WHERE ts >= ? AND type='pageview'
       GROUP BY k ORDER BY c DESC LIMIT 10`,
    cutoff,
  );

  const sections = await q(
    `SELECT COALESCE(label,'(none)') AS k, COUNT(*) AS c, CAST(AVG(dwell) AS INTEGER) AS avg_dwell
       FROM events WHERE ts >= ? AND type='section'
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const clicks = await q(
    `SELECT COALESCE(label,'(none)') AS k, COUNT(*) AS c
       FROM events WHERE ts >= ? AND type='click'
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const sources = await q(
    `SELECT COALESCE(source,'direct') AS k, COUNT(DISTINCT session) AS c
       FROM events WHERE ts >= ?
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const countries = await q(
    `SELECT COALESCE(country,'?') AS k, COUNT(DISTINCT session) AS c
       FROM events WHERE ts >= ?
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const cities = await q(
    `SELECT (COALESCE(city,'?') || ', ' || COALESCE(country,'?')) AS k, COUNT(DISTINCT session) AS c
       FROM events WHERE ts >= ?
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const orgs = await q(
    `SELECT COALESCE(org,'(unknown)') AS k, COUNT(DISTINCT session) AS c
       FROM events WHERE ts >= ?
       GROUP BY k ORDER BY c DESC LIMIT 12`,
    cutoff,
  );

  const devices = await q(
    `SELECT COALESCE(device,'?') AS k, COUNT(DISTINCT session) AS c
       FROM events WHERE ts >= ?
       GROUP BY k ORDER BY c DESC LIMIT 5`,
    cutoff,
  );

  const daily = await q(
    `SELECT date(ts/1000,'unixepoch') AS k, COUNT(*) AS c
       FROM events WHERE ts >= ? AND type='pageview'
       GROUP BY k ORDER BY k DESC LIMIT 30`,
    cutoff,
  );

  // Recent visits: one row per session, newest first, with the journey.
  const sessionRows = await q(
    `SELECT session,
            MIN(ts) AS start,
            MAX(source)   AS source,
            MAX(city)     AS city,
            MAX(region)   AS region,
            MAX(country)  AS country,
            MAX(org)      AS org,
            MAX(device)   AS device,
            MAX(referrer) AS referrer
       FROM events
       WHERE ts >= ? AND session IS NOT NULL
       GROUP BY session ORDER BY start DESC LIMIT 25`,
    cutoff,
  );

  const journeys = {};
  if (sessionRows.length) {
    const ids = sessionRows.map((r) => r.session);
    const placeholders = ids.map(() => "?").join(",");
    const evs = await q(
      `SELECT session, type, path, label, ts
         FROM events WHERE session IN (${placeholders}) ORDER BY ts ASC`,
      ...ids,
    );
    for (const e of evs) {
      (journeys[e.session] ||= []).push(e);
    }
  }

  return html(renderBody({ totals, rangeKey, pages, sections, clicks, sources, countries, cities, orgs, devices, daily, sessionRows, journeys }));
}

// ---- rendering helpers -------------------------------------------------

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function fmtDwell(ms) {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTime(ms) {
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// A labelled list of horizontal bars scaled to the largest value.
function barList(rows, opts = {}) {
  if (!rows.length) return `<p class="empty">No data yet.</p>`;
  const max = Math.max(...rows.map((r) => r.c)) || 1;
  return rows
    .map((r) => {
      const name = opts.name ? opts.name(r) : esc(r.k);
      const extra = opts.extra ? `<span class="extra">${esc(opts.extra(r))}</span>` : "";
      return `<div class="bar-row"><div class="bar-label">${name}${extra}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(r.c / max) * 100}%"></div></div>
        <div class="bar-val">${r.c}</div></div>`;
    })
    .join("");
}

function journeyTrail(events) {
  const steps = events.map((e) => {
    if (e.type === "pageview") return `<span class="step page">${esc(e.path || "/")}</span>`;
    if (e.type === "section") return `<span class="step sect">${esc(SECTION_NAMES[e.label] || e.label || "?")}</span>`;
    return `<span class="step click">↗ ${esc(e.label || "?")}</span>`;
  });
  return steps.join('<span class="arrow">→</span>') || '<span class="empty">—</span>';
}

function renderBody(d) {
  const t = d.totals || {};
  const tabs = Object.entries(RANGES)
    .map(([key, r]) => `<a class="tab ${key === d.rangeKey ? "active" : ""}" href="?range=${key}">${esc(r.label)}</a>`)
    .join("");

  const visitors = d.sessionRows
    .map((r) => {
      const loc = [r.city, r.region, r.country].filter(Boolean).join(", ") || "Unknown location";
      const src = r.source || "direct";
      const ref = r.referrer ? ` <span class="muted">(${esc(r.referrer)})</span>` : "";
      return `<div class="visit">
        <div class="visit-head">
          <span class="when">${esc(fmtTime(r.start))}</span>
          <span class="src tag">${esc(src)}</span>${ref}
          <span class="dev">${esc(r.device || "?")}</span>
        </div>
        <div class="visit-meta">📍 ${esc(loc)} · 🖧 ${esc(r.org || "unknown network")}</div>
        <div class="trail">${journeyTrail(d.journeys[r.session] || [])}</div>
      </div>`;
    })
    .join("");

  return `
  <header>
    <h1>logankm.com analytics</h1>
    <nav class="tabs">${tabs}</nav>
  </header>

  <section class="cards">
    <div class="stat"><div class="n">${t.pageviews || 0}</div><div class="l">Pageviews</div></div>
    <div class="stat"><div class="n">${t.visitors || 0}</div><div class="l">Unique visitors</div></div>
    <div class="stat"><div class="n">${t.sessions || 0}</div><div class="l">Sessions</div></div>
    <div class="stat"><div class="n">${t.events || 0}</div><div class="l">Total events</div></div>
  </section>

  <div class="grid">
    <div class="panel"><h2>Top sources</h2>${barList(d.sources)}</div>
    <div class="panel"><h2>Pageviews per day</h2>${barList(d.daily)}</div>
    <div class="panel"><h2>Top pages</h2>${barList(d.pages)}</div>
    <div class="panel"><h2>Sections viewed</h2>${barList(d.sections, {
      name: (r) => esc(SECTION_NAMES[r.k] || r.k),
      extra: (r) => (r.avg_dwell ? `avg ${fmtDwell(r.avg_dwell)}` : ""),
    })}</div>
    <div class="panel"><h2>Clicks</h2>${barList(d.clicks)}</div>
    <div class="panel"><h2>Devices</h2>${barList(d.devices)}</div>
    <div class="panel"><h2>Countries</h2>${barList(d.countries)}</div>
    <div class="panel"><h2>Cities</h2>${barList(d.cities)}</div>
    <div class="panel"><h2>Networks / orgs</h2>${barList(d.orgs)}</div>
  </div>

  <section class="panel wide">
    <h2>Recent visitors <span class="muted">(latest ${d.sessionRows.length})</span></h2>
    ${visitors || '<p class="empty">No visits yet.</p>'}
  </section>`;
}

function html(body) {
  const doc = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Analytics · logankm.com</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: #0f1115; color: #e6e8ec; padding: 24px; }
  a { color: inherit; text-decoration: none; }
  header { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  h1 { font-size: 20px; margin: 0; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #9aa0aa; margin: 0 0 12px; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .tab { padding: 6px 12px; border-radius: 999px; background: #1a1d24; color: #c5cad3; font-size: 13px; }
  .tab.active { background: #3b82f6; color: #fff; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 12px; margin-bottom: 20px; }
  .stat { background: #161a21; border: 1px solid #232833; border-radius: 14px; padding: 16px; }
  .stat .n { font-size: 28px; font-weight: 700; }
  .stat .l { font-size: 12px; color: #9aa0aa; margin-top: 2px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 14px; }
  .panel { background: #161a21; border: 1px solid #232833; border-radius: 14px; padding: 16px; }
  .panel.wide { margin-top: 14px; }
  .bar-row { display: grid; grid-template-columns: 1fr 90px 36px; align-items: center; gap: 10px; margin: 7px 0; }
  .bar-label { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-label .extra { color: #7f8794; font-size: 11px; margin-left: 6px; }
  .bar-track { background: #232833; border-radius: 6px; height: 8px; overflow: hidden; }
  .bar-fill { background: linear-gradient(90deg,#3b82f6,#60a5fa); height: 100%; }
  .bar-val { text-align: right; color: #c5cad3; font-variant-numeric: tabular-nums; }
  .empty { color: #6b7280; font-size: 13px; }
  .muted { color: #6b7280; font-weight: 400; font-size: 12px; }
  .visit { border-top: 1px solid #232833; padding: 12px 0; }
  .visit:first-of-type { border-top: 0; }
  .visit-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .when { color: #c5cad3; font-size: 13px; }
  .tag { background: #1e293b; color: #93c5fd; padding: 1px 8px; border-radius: 999px; font-size: 12px; }
  .dev { color: #7f8794; font-size: 12px; margin-left: auto; }
  .visit-meta { color: #9aa0aa; font-size: 12px; margin: 4px 0 6px; }
  .trail { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
  .step { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: #232833; }
  .step.page { color: #fde68a; }
  .step.sect { color: #86efac; }
  .step.click { color: #f0abfc; }
  .arrow { color: #4b5563; font-size: 11px; }
</style></head><body>${body}</body></html>`;
  return new Response(doc, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
