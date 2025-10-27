// src/components/Tooltip/index.jsx
// Reusable tooltip component

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./styles.module.scss";

const Tooltip = ({
  children,
  content,
  position = "top", // 'top', 'bottom', 'left', 'right', 'top-left', etc.
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dynamicStyles, setDynamicStyles] = useState({});
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hideTimer = useRef(null);

  // This function calculates the optimal position for the tooltip to stay in the viewport
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 8; // Space from viewport edges

    let newStyles = {};

    // Base vertical and horizontal alignment calculations
    const topCentered =
      triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
    const leftCentered =
      triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // Position based on the 'position' prop
    switch (position) {
      case "top":
      case "top-left":
      case "top-right":
        newStyles.top = triggerRect.top - tooltipRect.height - MARGIN;
        break;
      case "bottom":
      case "bottom-left":
      case "bottom-right":
        newStyles.top = triggerRect.bottom + MARGIN;
        break;
      case "left":
        newStyles.left = triggerRect.left - tooltipRect.width - MARGIN;
        newStyles.top = topCentered;
        break;
      case "right":
        newStyles.left = triggerRect.right + MARGIN;
        newStyles.top = topCentered;
        break;
      default:
        // Default to 'top'
        newStyles.top = triggerRect.top - tooltipRect.height - MARGIN;
        break;
    }

    // Alignment adjustments for top/bottom positions
    if (position.startsWith("top") || position.startsWith("bottom")) {
      if (position.includes("-left")) {
        newStyles.left = triggerRect.left;
      } else if (position.includes("-right")) {
        newStyles.left = triggerRect.right - tooltipRect.width;
      } else {
        newStyles.left = leftCentered; // Default to centered
      }
    }

    // === Viewport Collision Detection ===

    // Horizontal overflow correction
    if (newStyles.left < MARGIN) {
      newStyles.left = MARGIN;
    } else if (newStyles.left + tooltipRect.width > vw - MARGIN) {
      newStyles.left = vw - tooltipRect.width - MARGIN;
    }

    // Vertical overflow correction
    if (newStyles.top < MARGIN) {
      newStyles.top = MARGIN;
    } else if (newStyles.top + tooltipRect.height > vh - MARGIN) {
      newStyles.top = vh - tooltipRect.height - MARGIN;
    }

    setDynamicStyles(newStyles);
  }, [position]);

  // Run position calculation after the tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition);
      };
    }
    // Remove the else block entirely - no need to reset styles
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  return (
    <span
      ref={triggerRef}
      className={`${styles.tooltip} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <span
        ref={tooltipRef}
        className={`${styles.tooltipContent} ${
          isVisible ? styles.visible : ""
        }`}
        style={dynamicStyles}
        data-position={position}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
