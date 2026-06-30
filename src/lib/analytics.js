// Lightweight, dependency-free first-party analytics tracker. Emits pageviews,
// section-view events (with dwell time) and outbound/CTA clicks to /api/collect
// via navigator.sendBeacon. No cookies; a per-visit session id lives in
// sessionStorage. Disabled in dev so `npm run dev` stays clean.

const COLLECT_URL = "/api/collect";

// Section element id -> friendly label stored with the event.
const SECTIONS = {
  home: "home",
  about: "education",
  experience: "experience",
  projects: "projects",
  skills: "skills",
  getInTouch: "contact",
};

// Map a referrer hostname to a coarse acquisition channel.
function channelFromReferrer(host) {
  if (!host) return "direct";
  const h = host.toLowerCase();
  if (h.includes("linkedin")) return "linkedin";
  if (h.includes("github")) return "github";
  if (h.includes("google")) return "google";
  if (h.includes("bing") || h.includes("duckduckgo") || h.includes("ecosia")) return "search";
  if (h.includes("t.co") || h.includes("twitter") || h === "x.com" || h.endsWith(".x.com")) return "twitter";
  if (h.includes("instagram")) return "instagram";
  if (h.includes("facebook") || h === "lnkd.in") return h === "lnkd.in" ? "linkedin" : "facebook";
  if (h.includes("reddit")) return "reddit";
  if (h.includes("youtube")) return "youtube";
  return host.replace(/^www\./, "");
}

const isBrowser = typeof window !== "undefined" && typeof navigator !== "undefined";

// Append ?la_debug=1 to force-enable on localhost (e.g. when testing the full
// pipeline under `wrangler pages dev`); it sticks for the session.
function debugForced() {
  if (!isBrowser) return false;
  try {
    if (new URLSearchParams(window.location.search).get("la_debug") === "1") {
      sessionStorage.setItem("la_debug", "1");
    }
    return sessionStorage.getItem("la_debug") === "1";
  } catch {
    return false;
  }
}

const isLocalhost = isBrowser && /^(localhost|127\.|0\.0\.0\.0$|\[?::1)/.test(window.location.hostname);
const ENABLED = isBrowser && !import.meta.env.DEV && (debugForced() || !isLocalhost);

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSession() {
  try {
    let id = sessionStorage.getItem("la_sess");
    if (!id) {
      id = randomId();
      sessionStorage.setItem("la_sess", id);
    }
    return id;
  } catch {
    return "nostore";
  }
}

// Resolve the acquisition source once per session. Prefer an explicit ?ref= or
// utm_source tag (then strip it from the URL so it doesn't pollute pageviews),
// otherwise fall back to the referrer host.
function getSourceAndReferrer() {
  let cached;
  try {
    cached = sessionStorage.getItem("la_src");
  } catch {
    cached = null;
  }
  if (cached) {
    const [source, referrer] = cached.split("|");
    return { source, referrer: referrer || "" };
  }

  const params = new URLSearchParams(window.location.search);
  const tag = params.get("ref") || params.get("utm_source");

  let referrer = "";
  try {
    if (document.referrer) {
      const refHost = new URL(document.referrer).hostname;
      if (refHost && refHost !== window.location.hostname) referrer = refHost;
    }
  } catch {
    referrer = "";
  }

  const source = (tag || channelFromReferrer(referrer)).toString().toLowerCase().slice(0, 64);

  // Strip tracking params from the visible URL.
  if (tag) {
    ["ref", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((p) =>
      params.delete(p),
    );
    const qs = params.toString();
    const clean = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    try {
      window.history.replaceState(null, "", clean);
    } catch {
      /* ignore */
    }
  }

  try {
    sessionStorage.setItem("la_src", `${source}|${referrer}`);
  } catch {
    /* ignore */
  }
  return { source, referrer };
}

// ---- event queue + transport ------------------------------------------

let queue = [];
let flushTimer = null;

function send(events) {
  const body = JSON.stringify(events);
  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(COLLECT_URL, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }
  // Fallback for browsers/cases where sendBeacon is unavailable or rejects.
  fetch(COLLECT_URL, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
    () => {},
  );
}

function flush() {
  if (!queue.length) return;
  const batch = queue;
  queue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  send(batch);
}

function enqueue(event) {
  if (!ENABLED) return;
  const { source, referrer } = getSourceAndReferrer();
  queue.push({
    ...event,
    path: window.location.pathname,
    source,
    referrer,
    session: getSession(),
  });
  if (queue.length >= 20) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, 2000);
  }
}

// ---- public API --------------------------------------------------------

export function trackPageview(path) {
  enqueue({ type: "pageview", path: path || window.location.pathname });
}

// Observe section visibility and emit one 'section' event per visible interval,
// carrying how long the section stayed on screen (dwell). Returns a cleanup fn.
export function observeSections() {
  if (!ENABLED || typeof IntersectionObserver === "undefined") return () => {};

  const enteredAt = new Map(); // id -> timestamp

  const emit = (id) => {
    const start = enteredAt.get(id);
    if (start == null) return;
    enteredAt.delete(id);
    enqueue({ type: "section", label: SECTIONS[id] || id, dwell: Math.round(performance.now() - start) });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!enteredAt.has(id)) enteredAt.set(id, performance.now());
        } else {
          emit(id);
        }
      }
    },
    { threshold: [0, 0.5] },
  );

  Object.keys(SECTIONS).forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // When the page is hidden/closed, record dwell for whatever is still visible.
  const flushVisible = () => {
    for (const id of [...enteredAt.keys()]) emit(id);
    flush();
  };
  window.addEventListener("pagehide", flushVisible);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushVisible();
  });

  return () => {
    flushVisible();
    observer.disconnect();
    window.removeEventListener("pagehide", flushVisible);
  };
}

// Track outbound link clicks and any [data-track-click] element. Returns cleanup.
export function observeClicks() {
  if (!ENABLED) return () => {};

  const onClick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const tagged = target.closest("[data-track-click]");
    if (tagged) {
      enqueue({ type: "click", label: tagged.getAttribute("data-track-click") || "click" });
      return;
    }

    const link = target.closest("a[href]");
    if (link) {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("mailto:")) {
        enqueue({ type: "click", label: "email" });
        return;
      }
      try {
        const host = new URL(href, window.location.href).hostname;
        if (host && host !== window.location.hostname) enqueue({ type: "click", label: host.replace(/^www\./, "") });
      } catch {
        /* ignore non-URL hrefs */
      }
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

// Flush on unload as a safety net for any queued non-section events.
if (ENABLED) {
  window.addEventListener("pagehide", flush);
}
