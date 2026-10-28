// src/components/EnterpriseBadge/index.jsx
import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

const EnterpriseBadge = ({
  text = "Enterprise Edition",
  compactText = "Enterprise",
  href = "/deploy/enterprise",
  compact = false,
  iconOnly = false,
  className = ""
}) => {
  // data-copy-exclude marks this badge as UI chrome so the "Copy page" markdown
  // export (src/components/ContextualMenu) strips it out via [data-copy-exclude].
  const badge = (
    <span
      className={`${styles.enterpriseBadge} ${compact ? styles.compact : ""} ${iconOnly ? styles.iconOnly : ""} ${className}`}
      title={iconOnly ? "Weaviate Enterprise Edition" : undefined}
      data-copy-exclude=""
    >
      <img src="/img/building-icon.svg" alt="" className={styles.enterpriseIcon} />
      {!iconOnly && <span>{compact ? compactText : text}</span>}
    </span>
  );

  // The icon-only variant renders inside sidebar links, where a nested link is invalid.
  if (iconOnly || !href) {
    return badge;
  }

  return (
    <Link to={href} className={styles.enterpriseBadgeLink} data-copy-exclude="">
      {badge}
    </Link>
  );
};

export default EnterpriseBadge;

// ============================================
// Example usage in MDX files:
/*
// Globally available through src/theme/MDXComponents.js, no import needed.

// Simple usage - shows "Enterprise Edition" and links to /deploy/enterprise
<EnterpriseBadge />

// Custom text
<EnterpriseBadge text="Enterprise feature" />

// Compact variant for inline use
<EnterpriseBadge compact />

// Without a link
<EnterpriseBadge href={null} />
*/
