/**
 * Records one structured event per inbound click that carries attribution,
 * then passes the request through untouched.
 *
 * Phase 1 of the cluster-id capture pipeline. The sink is Netlify's own
 * function log: emit() writes one line per event with the stable prefix
 * "[clusterid-capture] ", which is what the log filter matches on. Phase 3
 * swaps only emit()'s body for a POST; nothing else here changes.
 *
 * THIS FUNCTION MUST BE INCAPABLE OF CHANGING A RESPONSE. The /e/ redirects
 * it observes are a shipped contract printed inside error messages, and
 * error-link-src.ts -- which runs after this one; same-path edge functions
 * run in netlify.toml declaration order -- owns the rewrite. So every path
 * through this file, including every failure, ends in `return context.next()`,
 * and `onError: "bypass"` covers anything a bug still manages to throw. The
 * event is expendable; the response is not.
 *
 * ONE EVENT PER CLICK. A frozen legacy alias redirects /e/dep011 ->
 * /e/py-dep011?src=dep011, so a single click re-enters this function on the
 * second hop, carrying the `src` the first hop set. The first hop is the
 * event; a request that already has `src` passes through unlogged.
 */

export const config = {
  path: ["/e/*", "/improve-your-cluster"],
  onError: "bypass",
};

// Same shape error-link-src.ts requires of an id: lowercase
// <origin>-<category><nnn>. A path that fails this still gets an event --
// catch-all hits are worth seeing -- but flagged, truncated, and only into
// this function's own JSON log line, never reflected into a URL.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 8-4-4-4-12 hex, any version, case-insensitive: the shape Weaviate appends
// as ?clusterid=<uuid>. A value that fails this is never logged, only flagged.
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Coarse traffic class only; the raw UA is never logged. Bots are tested
// before the Mozilla prefix because crawlers impersonate it
// ("Mozilla/5.0 (compatible; Googlebot/...)").
const uaClass = (ua: string | null): string => {
  if (!ua) return "agent";
  if (/bot|crawl|spider|slurp|preview/i.test(ua)) return "bot";
  return ua.startsWith("Mozilla") ? "browser" : "agent";
};

// Well-formed -> logged as-is; present but malformed -> flagged and the value
// dropped; absent -> null with no validity flag at all.
const clusteridFields = (url: URL): Record<string, unknown> => {
  const v = url.searchParams.get("clusterid");
  if (v === null) return { clusterid: null };
  if (UUID.test(v)) return { clusterid: v, clusterid_valid: true };
  return { clusterid: null, clusterid_valid: false };
};

// The single sink. One line, stable prefix.
const emit = (event: Record<string, unknown>) => {
  console.log("[clusterid-capture] " + JSON.stringify(event));
};

export default async (request: Request, context: any) => {
  try {
    const url = new URL(request.url);
    let fields: Record<string, unknown>;

    if (url.pathname.startsWith("/e/")) {
      // Second hop of the legacy-alias redirect; the first hop was the event.
      if (url.searchParams.has("src")) return context.next();
      const raw = url.pathname.slice("/e/".length).replace(/\/+$/, "");
      const ok = raw.length > 0 && raw.length <= 64 && ID.test(raw);
      fields = {
        surface: "error-link",
        src_id: ok ? raw : raw.slice(0, 64),
        id_valid: ok,
      };
    } else {
      // Organic /improve-your-cluster visits stay out of the data: only a
      // click carrying the banner's ?clusterid= is an event. src_id gets no
      // validity flag here for the same reason an absent clusterid gets
      // none -- there was never a value to judge.
      if (!url.searchParams.has("clusterid")) return context.next();
      fields = { surface: "banner", src_id: null };
    }

    emit({
      event_id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      ...fields,
      ...clusteridFields(url),
      path: url.pathname,
      country: context.geo?.country?.code ?? null,
      ua_class: uaClass(request.headers.get("user-agent")),
      method: request.method,
    });
  } catch {
    // The event is expendable; the response is not.
  }
  return context.next();
};
