// src/components/Tooltip/index.jsx
// Reusable tooltip component

import React, { useState, useRef } from "react";
import styles from "./styles.module.scss";

const Tooltip = ({
  children,
  content,
  position = "left", // 'top', 'bottom', 'left', 'right', etc.
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimer = useRef(null);

  // When mouse enters the area, show tooltip and cancel any pending hide actions
  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    setIsVisible(true);
  };

  // When mouse leaves, set a timer to hide the tooltip
  // This delay gives the user time to move their cursor onto the tooltip content
  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // 200ms delay
  };

  return (
    <span
      className={`${styles.tooltip} ${className}`}
      data-position={position}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <span
        className={`${styles.tooltipContent} ${
          isVisible ? styles.visible : ""
        }`}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
