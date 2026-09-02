import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

/**
 * Building blocks for /errors and /improve-your-cluster. Each one turns a
 * paragraph the reader used to have to parse into something they can scan.
 */

const SEVERITY_LABEL = {
  error: "Error",
  warning: "Warning",
  deprecation: "Deprecation",
};

/** Facts strip at the top of a message entry: ids, origin, level, impact, fix. */
export function EntryFacts({ ids = [], raisedBy, severity, impact, fix }) {
  return (
    <div className={styles.facts} data-copy-exclude="">
      <div>
        <p className={styles.factLabel}>Message id{ids.length > 1 ? "s" : ""}</p>
        <p className={`${styles.factValue} ${styles.ids}`}>
          {ids.map((id) => (
            <code key={id} className={styles.id}>
              {id}
            </code>
          ))}
        </p>
      </div>
      {raisedBy && (
        <div>
          <p className={styles.factLabel}>Raised by</p>
          <p className={styles.factValue}>{raisedBy}</p>
        </div>
      )}
      {severity && (
        <div>
          <p className={styles.factLabel}>Kind</p>
          <p className={styles.factValue}>
            <span className={`${styles.severity} ${styles[severity] || ""}`}>
              {SEVERITY_LABEL[severity] || severity}
            </span>
          </p>
        </div>
      )}
      {impact && (
        <div>
          <p className={styles.factLabel}>What it means</p>
          <p className={styles.factValue}>{impact}</p>
        </div>
      )}
      {fix && (
        <div>
          <p className={styles.factLabel}>The fix</p>
          <p className={styles.factValue}>{fix}</p>
        </div>
      )}
    </div>
  );
}

/** Numbered steps, side by side: how a message id travels from a log to a page. */
export function LinkFlow({ steps }) {
  return (
    <ol className={styles.flow}>
      {steps.map((step, i) => (
        <li key={i} className={styles.step}>
          <span className={styles.stepNumber} aria-hidden="true">
            {i + 1}
          </span>
          <p className={styles.stepTitle}>{step.title}</p>
          <p className={styles.stepBody}>{step.body}</p>
          {step.code && <code className={styles.stepCode}>{step.code}</code>}
        </li>
      ))}
    </ol>
  );
}

/** A message id taken apart: origin, category and number, each labelled. */
export function IdAnatomy({ origin, category, number, originHint, categoryHint, numberHint }) {
  return (
    <div className={styles.anatomy}>
      <span className={`${styles.part} ${styles.partOrigin}`}>{origin}</span>
      <span className={styles.dash} aria-hidden="true">-</span>
      <span className={`${styles.part} ${styles.partCategory}`}>{category}</span>
      <span className={`${styles.part} ${styles.partNumber}`}>{number}</span>
      <span className={styles.partLabel}>Origin</span>
      <span aria-hidden="true" />
      <span className={styles.partLabel}>Category</span>
      <span className={styles.partLabel}>Number</span>
      <span className={styles.partHint}>{originHint}</span>
      <span aria-hidden="true" />
      <span className={styles.partHint}>{categoryHint}</span>
      <span className={styles.partHint}>{numberHint}</span>
    </div>
  );
}

/** Checklist items: a short lead, one line of why, and where to do it. */
export function Checklist({ items }) {
  return (
    <ul className={styles.checklist}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <i className={`fa fa-circle-check ${styles.check}`} aria-hidden="true" />
          <div>
            <p className={styles.itemTitle}>
              {item.title}
              {item.link && (
                <Link className={styles.itemLink} to={item.link}>
                  {item.linkText || "How"} →
                </Link>
              )}
            </p>
            <p className={styles.itemText}>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
