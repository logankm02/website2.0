-- Analytics event store for logankm.com (Cloudflare D1).
-- One row per tracked event. See analytics/server.js + functions/api/collect.js.
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER NOT NULL,            -- epoch ms, server-stamped
  type      TEXT    NOT NULL,            -- 'pageview' | 'section' | 'click'
  path      TEXT,                        -- SPA route, e.g. /about
  label     TEXT,                        -- section label or click id/hostname
  source    TEXT,                        -- acquisition channel (linkedin, github, direct, ...)
  referrer  TEXT,                        -- raw external referrer host
  country   TEXT,                        -- request.cf.country
  city      TEXT,                        -- request.cf.city
  region    TEXT,                        -- request.cf.region
  timezone  TEXT,                        -- request.cf.timezone
  org       TEXT,                        -- request.cf.asOrganization (network/company)
  device    TEXT,                        -- 'mobile' | 'desktop'
  visitor   TEXT,                        -- daily-rotating salted hash (not reversible to PII)
  session   TEXT,                        -- per-visit id from sessionStorage
  dwell     INTEGER                      -- ms a section was visible (section events only)
);

CREATE INDEX IF NOT EXISTS idx_events_ts      ON events (ts);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events (type);
CREATE INDEX IF NOT EXISTS idx_events_path    ON events (path);
CREATE INDEX IF NOT EXISTS idx_events_label   ON events (label);
CREATE INDEX IF NOT EXISTS idx_events_source  ON events (source);
CREATE INDEX IF NOT EXISTS idx_events_session ON events (session);
