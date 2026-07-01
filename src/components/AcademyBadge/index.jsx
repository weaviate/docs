// src/components/AcademyBadge/index.jsx
import React from "react";
import styles from "./styles.module.scss";

const AcademyBadge = ({
  text = "Weaviate Academy",
  compactText = "Academy",
  compact = false,
  iconOnly = false,
  className = ""
}) => {
  // data-copy-exclude marks this badge as UI chrome so the "Copy page" markdown
  // export (src/components/ContextualMenu) strips it out via [data-copy-exclude].
  return (
    <span
      className={`${styles.academyBadge} ${compact ? styles.compact : ""} ${iconOnly ? styles.iconOnly : ""} ${className}`}
      title={iconOnly ? "Weaviate Academy" : undefined}
      data-copy-exclude=""
    >
      <img src="/img/graduation-cap-icon.svg" alt="" className={styles.academyIcon} />
      {!iconOnly && <span>{compact ? compactText : text}</span>}
    </span>
  );
};

export default AcademyBadge;

// ============================================
// Example usage in MDX files:
/*
import AcademyBadge from '@site/src/components/AcademyBadge';

// Simple usage - shows "Weaviate Academy"
<AcademyBadge />

// Custom text
<AcademyBadge text="Academy course" />

// Compact variant for inline use
<AcademyBadge compact />

// With custom text and compact
<AcademyBadge text="Academy" compact />
*/
