// src/components/CloudOnlyBadge/index.jsx
import React from "react";
import Link from "@docusaurus/Link";
import Tooltip from "@site/src/components/Tooltip";
import styles from "./styles.module.scss";

const CloudOnlyBadge = ({
  text = "Weaviate Cloud only",
  tooltip = "This feature requires Weaviate Cloud - a fully managed service with automatic scaling, backups, and monitoring. Click to learn more.",
  href = "/cloud",
  position = "top",
  compact = false,
  className = ""
}) => {
  const badgeContent = (
    <Link
      to={href}
      className={`${styles.cloudOnlyBadge} ${compact ? styles.compact : ""} ${className}`}
    >
      <i className="fa-regular fa-cloud"></i>
      <span>{text}</span>
    </Link>
  );

  return (
    <Tooltip content={tooltip} position={position}>
      {badgeContent}
    </Tooltip>
  );
};

export default CloudOnlyBadge;

// ============================================
// Example usage in MDX files:
/*
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';

// Simple usage - shows "Weaviate Cloud only", links to /cloud
<CloudOnlyBadge />

// Custom text
<CloudOnlyBadge text="Cloud feature" />

// Custom tooltip
<CloudOnlyBadge tooltip="Available only on Weaviate Cloud Services" />

// Custom link
<CloudOnlyBadge href="/cloud/manage-clusters" />

// Custom tooltip position (top, bottom, left, right, top-left, top-right, etc.)
<CloudOnlyBadge position="bottom" />

// All custom
<CloudOnlyBadge
  text="Cloud only"
  tooltip="Learn more about cloud features"
  href="/cloud/features"
  position="bottom-right"
/>
*/
