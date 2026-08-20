import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

/**
 * Right-hand panel for the /errors section.
 *
 * Error pages set `hide_table_of_contents: true` (readers arrive at one
 * anchor from a message link, so a list of the other anchors is noise) and
 * `side_panel: improve-cluster`. src/theme/DocItem/Layout renders this in the
 * column the table of contents would otherwise occupy. Nothing else on the
 * site sets `side_panel`, so no normal docs page is affected.
 */
export default function ErrorSidePanel() {
  return (
    <aside
      className={styles.panel}
      aria-labelledby="error-side-panel-title"
      data-copy-exclude=""
    >
      <p className={styles.eyebrow}>Next step</p>
      <h2 className={styles.title} id="error-side-panel-title">
        Improve your cluster
      </h2>
      <p className={styles.body}>
        Most messages in this section are symptoms of a cluster that is short on
        headroom, unmonitored, or behind on versions. Work through the checklist
        to stop the next one before it reaches your logs.
      </p>
      <Link className={styles.cta} to="/improve-your-cluster">
        Open the checklist
      </Link>
    </aside>
  );
}
