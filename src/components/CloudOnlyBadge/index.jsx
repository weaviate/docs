// src/components/CloudOnlyBadge/index.jsx
import React from "react";
import styles from "./styles.module.scss";

const CloudOnlyBadge = ({
  text = "Weaviate Cloud only",
  compactText = "Cloud only",
  compact = false,
  iconOnly = false,
  className = ""
}) => {
  return (
    <span
      className={`${styles.cloudOnlyBadge} ${compact ? styles.compact : ""} ${iconOnly ? styles.iconOnly : ""} ${className}`}
      title={iconOnly ? "Weaviate Cloud only" : undefined}
    >
      <img src="/img/cloud-icon.svg" alt="" className={styles.cloudIcon} />
      {!iconOnly && <span>{compact ? compactText : text}</span>}
    </span>
  );
};

export default CloudOnlyBadge;

// ============================================
// Example usage in MDX files:
/*
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';

// Simple usage - shows "Weaviate Cloud only"
<CloudOnlyBadge />

// Custom text
<CloudOnlyBadge text="Cloud feature" />

// Compact variant for inline use
<CloudOnlyBadge compact />

// With custom text and compact
<CloudOnlyBadge text="Cloud only" compact />
*/
