// Shared helpers for the analytics Pages Functions. Lives outside functions/
// so it is bundled (imported) without becoming its own route.

const EVENT_TYPES = new Set(["pageview", "section", "click"]);

// Per-field max lengths (chars) — defends the DB against oversized payloads.
const FIELD_LIMITS = {
  path: 256,
  label: 256,
  source: 64,
  referrer: 256,
};

export const MAX_EVENTS_PER_REQUEST = 50;

// Reject HTTP Basic Auth unless it matches the STATS_PASSWORD secret.
// Returns a 401 Response when auth fails, or null when it passes.
export function basicAuth(request, env) {
  const expected = env.STATS_PASSWORD;
  const unauthorized = () =>
    new Response("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="stats", charset="UTF-8"' },
    });

  if (!expected) {
    // Misconfigured: fail closed rather than expose the dashboard.
    return new Response("Stats password not configured.", { status: 503 });
  }

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }
  // Accept "user:password" or just "password".
  const password = decoded.includes(":") ? decoded.slice(decoded.indexOf(":") + 1) : decoded;
  if (!timingSafeEqual(password, expected)) return unauthorized();
  return null;
}

// Constant-time string compare to avoid leaking the password via timing.
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

// One-way, daily-rotating visitor id. SHA-256 over a server salt + the UTC date
// + ip + user-agent. The daily rotation means the same person produces a
// different hash on a different day, so it can't be used for long-term tracking
// and the raw IP is never stored.
export async function visitorHash(ip, ua, env) {
  const salt = env.SALT || "logankm-analytics";
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const data = new TextEncoder().encode(`${salt}|${day}|${ip || ""}|${ua || ""}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor/i;

export function isBot(ua) {
  return !!ua && BOT_RE.test(ua);
}

export function deviceFromUA(ua) {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua || "") ? "mobile" : "desktop";
}

function clean(value, limit) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, limit);
}

// Validate + normalize a single client-sent event. Returns null if invalid.
export function sanitizeEvent(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!EVENT_TYPES.has(raw.type)) return null;

  const dwell =
    Number.isFinite(raw.dwell) && raw.dwell >= 0 ? Math.min(Math.round(raw.dwell), 86_400_000) : null;

  return {
    type: raw.type,
    path: clean(raw.path, FIELD_LIMITS.path),
    label: clean(raw.label, FIELD_LIMITS.label),
    source: clean(raw.source, FIELD_LIMITS.source),
    referrer: clean(raw.referrer, FIELD_LIMITS.referrer),
    session: clean(raw.session, 64),
    dwell,
  };
}
