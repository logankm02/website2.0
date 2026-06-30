// Ingest endpoint for the analytics tracker. Receives batched events from
// navigator.sendBeacon (src/lib/analytics.js), enriches them with Cloudflare
// geo/network data, and writes them to D1. Always returns 204 quickly.
import {
  MAX_EVENTS_PER_REQUEST,
  deviceFromUA,
  isBot,
  sanitizeEvent,
  visitorHash,
} from "../../analytics/server.js";

const noContent = () => new Response(null, { status: 204 });

export async function onRequestPost({ request, env }) {
  // Only accept same-origin posts to limit drive-by spam.
  const origin = request.headers.get("Origin");
  if (origin && new URL(request.url).origin !== origin) {
    return new Response("Bad origin", { status: 403 });
  }

  const ua = request.headers.get("User-Agent") || "";
  if (isBot(ua)) return noContent(); // silently ignore crawlers

  let payload;
  try {
    payload = await request.json();
  } catch {
    return noContent();
  }

  const rawEvents = Array.isArray(payload) ? payload : [payload];
  const events = rawEvents
    .slice(0, MAX_EVENTS_PER_REQUEST)
    .map(sanitizeEvent)
    .filter(Boolean);
  if (events.length === 0) return noContent();

  if (!env.DB) return noContent(); // binding missing — don't error the client

  const cf = request.cf || {};
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const visitor = await visitorHash(ip, ua, env);
  const device = deviceFromUA(ua);
  const ts = Date.now();

  const stmt = env.DB.prepare(
    `INSERT INTO events
       (ts, type, path, label, source, referrer, country, city, region, timezone, org, device, visitor, session, dwell)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );

  const batch = events.map((e) =>
    stmt.bind(
      ts,
      e.type,
      e.path,
      e.label,
      e.source,
      e.referrer,
      cf.country || null,
      cf.city || null,
      cf.region || null,
      cf.timezone || null,
      cf.asOrganization || null,
      device,
      visitor,
      e.session,
      e.dwell,
    ),
  );

  try {
    await env.DB.batch(batch);
  } catch {
    // Swallow DB errors — analytics must never break the page.
  }
  return noContent();
}
