import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.scss";

/**
 * Shows the cluster identity a reader arrived with, when they arrived with one.
 *
 * Weaviate can append `?clusterid=<uuid>` to the docs links it prints, so the
 * reader lands holding it. This renders it. From Weaviate v1.40 the banner
 * (logged once the cluster has an id, never before), the docs_url log field
 * and the link in error messages all carry it, on clusters with telemetry
 * enabled. The redirect rules pass the parameter through.
 *
 * Rendered on the four /errors entry pages, which is where a message link
 * actually lands, and on /improve-your-cluster, which is one link further on.
 * The redirect rules in netlify.toml carry the parameter to all five; the
 * component is page-agnostic and needs nothing from the page it sits on.
 *
 * ABSENT IS THE NORMAL CASE, NOT AN ERROR. Weaviate's ClusterID() returns an
 * empty string until the raft leader has committed an identity, a cluster may
 * never have one at all, and plenty of readers just type the URL. So every one
 * of absent, empty and malformed renders nothing at all -- no placeholder, no
 * warning, no "invalid cluster id". A reader who never had an id is not having
 * a problem, and telling them otherwise is noise on a page they came to for
 * something else.
 *
 * IT NEVER LOOKS THE ID UP. The check is a format check and nothing more: no
 * request, no 404 on an unknown id, no difference in what renders between an id
 * that exists and one that does not. Anything else would be an unauthenticated
 * oracle for guessing cluster identities. It is also why the id is validated
 * before it is rendered rather than passed through -- an arbitrary path segment
 * should never reach the DOM, React escaping or not.
 *
 * NO CANONICAL TAG IS NEEDED HERE. Docusaurus already emits a route-derived
 * `<link rel="canonical">` with no query string; verified against production,
 * where /weaviate/release-notes/known-issues?clusterid=abc-123 still serves
 * canonical https://docs.weaviate.io/weaviate/release-notes/known-issues. Do
 * not add a second one -- two canonical tags on a page are worth less than one.
 */

// Canonical 8-4-4-4-12 hex, version-agnostic on purpose. Weaviate mints a v7
// and falls back to v4 when the monotonic-random source fails, so a regex that
// pinned the version nibble would reject exactly the ids born on a bad day.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ClusterIdNotice() {
  const location = useLocation();
  const [clusterId, setClusterId] = useState(null);

  // Read after mount rather than during render. The server-rendered HTML is
  // built without a query string, so resolving this inline would make the first
  // client render disagree with it and trip a hydration mismatch.
  useEffect(() => {
    const raw = new URLSearchParams(location.search).get("clusterid");
    const value = (raw || "").trim();
    setClusterId(UUID.test(value) ? value.toLowerCase() : null);
  }, [location.search]);

  if (!clusterId) return null;

  return (
    <aside className={styles.notice} aria-label="Cluster identity">
      <p className={styles.label}>Cluster id</p>
      <p className={styles.value}>
        <code>{clusterId}</code>
      </p>
      <p className={styles.body}>This came from the link you followed.</p>
    </aside>
  );
}
