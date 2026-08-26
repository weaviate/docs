import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

/**
 * Tells a reader which message brought them here when the index is where
 * they landed.
 *
 * netlify/edge-functions/error-link-src.ts puts `src=<id>` on every /e/<id>
 * request before the redirect rules run. A reader reaches the index with it
 * for two reasons, and both mean the same thing: the id has no entry yet.
 * Either its rule points at the index by design, or no rule matched and the
 * catch-all sent them here. Naming the id is what turns "if you arrived here
 * from a message and cannot find it" into something they can quote to support.
 *
 * Only the index renders this. On a group page the id resolved to a real
 * anchor, so there is nothing to explain.
 *
 * ABSENT IS THE NORMAL CASE. Most readers open the index from the site, and
 * an id that does not match the emitter's own format is not reflected into the
 * page at all.
 */

// The same shape the redirector requires of its ids: lowercase
// <origin>-<category><nnn>, or a bare legacy id such as dep024.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function ArrivedFromNotice() {
  const location = useLocation();
  const [id, setId] = useState(null);

  // Read after mount: the server-rendered HTML has no query string, and
  // resolving this during render would trip a hydration mismatch.
  useEffect(() => {
    const raw = (new URLSearchParams(location.search).get("src") || "").trim();
    setId(raw && raw.length <= 64 && ID.test(raw) ? raw : null);
  }, [location.search]);

  if (!id) return null;

  return (
    <aside className={styles.notice} aria-label="Message id">
      <p className={styles.label}>You followed a link for message</p>
      <p className={styles.value}>
        <code>{id}</code>
      </p>
      <p className={styles.body}>
        Its entry is not written yet, so the link brought you to the index.
        The message groups below cover the area it came from, and the{" "}
        <Link to="/support">support channels</Link> know the id.
      </p>
    </aside>
  );
}
